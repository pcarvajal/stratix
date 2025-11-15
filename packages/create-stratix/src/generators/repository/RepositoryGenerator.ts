import path from 'path';
import { BaseGenerator } from '../BaseGenerator.js';
import {
  RepositoryGeneratorOptions,
  GeneratedFile,
  ProjectStructure,
} from '../../types/generator.js';
import { ValidationUtils } from '../../utils/validation.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class RepositoryGenerator extends BaseGenerator {
  private repoOptions: RepositoryGeneratorOptions;

  constructor(options: RepositoryGeneratorOptions) {
    super(options);
    this.repoOptions = options;
  }

  protected validate(): void {
    ValidationUtils.validateEntityName(this.options.name);

    if (!this.repoOptions.entityName) {
      throw new Error('Entity name is required for repository generation');
    }

    ValidationUtils.validateEntityName(this.repoOptions.entityName);
  }

  protected async generateFiles(structure: ProjectStructure): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    const entityName = this.repoOptions.entityName;
    const entityNameCamel = this.naming.toCamelCase(entityName);
    const repoName = `${entityName}Repository`;

    const templateData = {
      entityName,
      entityNameCamel,
      repoName,
      implementations: this.repoOptions.implementations || ['inmemory'],
      naming: this.naming,
    };

    // 1. Repository interface
    files.push({
      path: this.getInterfacePath(structure),
      content: await this.renderTemplate('repository-interface.ts.ejs', templateData),
      action: 'create',
    });

    // 2. Generate implementations
    for (const impl of templateData.implementations) {
      const implTemplateData = {
        ...templateData,
        implementation: impl,
        implClassName: this.getImplClassName(entityName, impl),
      };

      files.push({
        path: this.getImplementationPath(structure, impl),
        content: await this.renderTemplate(`repository-${impl}.ts.ejs`, implTemplateData),
        action: 'create',
      });
    }

    // 3. Tests (if specified)
    if (this.repoOptions.withTests) {
      for (const impl of templateData.implementations) {
        const testTemplateData = {
          ...templateData,
          implementation: impl,
          implClassName: this.getImplClassName(entityName, impl),
        };

        files.push({
          path: this.getTestPath(structure, impl),
          content: await this.renderTemplate('repository.test.ts.ejs', testTemplateData),
          action: 'create',
        });
      }
    }

    return files;
  }

  protected getTemplatePath(templateName: string): string {
    return path.join(__dirname, 'templates', templateName);
  }

  private getImplClassName(entityName: string, implementation: string): string {
    const implPrefix = this.naming.toPascalCase(implementation);
    return `${implPrefix}${entityName}Repository`;
  }

  private getInterfacePath(structure: ProjectStructure): string {
    const fileName = `${this.repoOptions.entityName}Repository.ts`;

    if (structure.type === 'ddd' && structure.domainPath) {
      return path.join(structure.domainPath, 'repositories', fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'domain', 'repositories', fileName);
    }

    return this.getDestinationPath('src', 'domain', 'repositories', fileName);
  }

  private getImplementationPath(structure: ProjectStructure, implementation: string): string {
    const implClassName = this.getImplClassName(this.repoOptions.entityName, implementation);
    const fileName = `${implClassName}.ts`;

    if (structure.type === 'ddd' && structure.infrastructurePath) {
      return path.join(structure.infrastructurePath, 'persistence', implementation, fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(
        structure.contextsPath,
        'infrastructure',
        'persistence',
        implementation,
        fileName
      );
    }

    return this.getDestinationPath(
      'src',
      'infrastructure',
      'persistence',
      implementation,
      fileName
    );
  }

  private getTestPath(structure: ProjectStructure, implementation: string): string {
    const implClassName = this.getImplClassName(this.repoOptions.entityName, implementation);
    const fileName = `${implClassName}.test.ts`;

    if (structure.type === 'ddd' && structure.infrastructurePath) {
      return path.join(
        structure.infrastructurePath,
        'persistence',
        implementation,
        '__tests__',
        fileName
      );
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(
        structure.contextsPath,
        'infrastructure',
        'persistence',
        implementation,
        '__tests__',
        fileName
      );
    }

    return this.getDestinationPath(
      'src',
      'infrastructure',
      'persistence',
      implementation,
      '__tests__',
      fileName
    );
  }
}
