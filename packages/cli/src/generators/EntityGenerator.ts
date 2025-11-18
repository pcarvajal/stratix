import path from 'path';
import { BaseGenerator } from './BaseGenerator.js';
import { ValidationUtils } from '../utils/validation.js';
import { entityTemplate } from './templates/entity-template.js';
import type { GeneratedFile, GenerateCommandOptions, TemplateData } from '../types/index.js';

export class EntityGenerator extends BaseGenerator {
  constructor(
    private entityName: string,
    private options: GenerateCommandOptions,
    projectRoot?: string
  ) {
    super(projectRoot);
  }

  async generate(): Promise<GeneratedFile[]> {
    const validation = ValidationUtils.validateEntityName(this.entityName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const props = ValidationUtils.parseProps(this.options.props);
    const structure = await this.detectProjectStructure();

    const entityPath = structure.domainPath 
      ? path.join(structure.domainPath, 'entities')
      : path.join(structure.sourceRoot, 'domain', 'entities');

    const templateData: TemplateData = {
      entityName: this.naming.toPascalCase(this.entityName),
      entityNameCamel: this.naming.toCamelCase(this.entityName),
      entityNameKebab: this.naming.toKebabCase(this.entityName),
      entityNamePlural: this.naming.pluralize(this.entityName),
      props,
      aggregate: this.options.aggregate !== false,
      naming: this.naming,
    };

    const files: GeneratedFile[] = [];

    const entityFilePath = path.join(entityPath, `${templateData.entityName}.ts`);
    const fileExists = await this.fileExists(entityFilePath);

    if (fileExists && !this.options.force) {
      files.push({
        path: this.getRelativePath(entityFilePath),
        content: '',
        action: 'skip',
      });
    } else {
      files.push({
        path: this.getRelativePath(entityFilePath),
        content: entityTemplate(templateData),
        action: this.options.dryRun ? 'dry-run' : 'create',
      });
    }

    await this.writeFiles(files, this.options.dryRun);
    return files;
  }
}
