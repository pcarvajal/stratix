import path from 'path';
import { BaseGenerator } from '../BaseGenerator.js';
import { UseCaseGeneratorOptions, GeneratedFile, ProjectStructure } from '../../types/generator.js';
import { ValidationUtils } from '../../utils/validation.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class UseCaseGenerator extends BaseGenerator {
  private useCaseOptions: UseCaseGeneratorOptions;

  constructor(options: UseCaseGeneratorOptions) {
    super(options);
    this.useCaseOptions = options;
  }

  protected validate(): void {
    ValidationUtils.validateUseCaseName(this.options.name);

    if (this.useCaseOptions.input) {
      ValidationUtils.validateProps(this.useCaseOptions.input);
    }

    if (this.useCaseOptions.output) {
      ValidationUtils.validateProps(this.useCaseOptions.output);
    }
  }

  protected async generateFiles(structure: ProjectStructure): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    const isCommand = this.useCaseOptions.type === 'command';
    const isQuery = this.useCaseOptions.type === 'query';

    const inputProps = this.parseProps(this.useCaseOptions.input || '');
    const outputProps = this.parseProps(this.useCaseOptions.output || '');

    const templateData = {
      useCaseName: this.options.name,
      useCaseNameCamel: this.naming.toCamelCase(this.options.name),
      isCommand,
      isQuery,
      inputProps,
      outputProps,
      hasInput: inputProps.length > 0,
      hasOutput: outputProps.length > 0,
      naming: this.naming,
    };

    // 1. Command/Query type definition file
    files.push({
      path: this.getTypePath(structure),
      content: await this.renderTemplate('use-case-type.ts.ejs', templateData),
      action: 'create',
    });

    // 2. Handler file
    files.push({
      path: this.getHandlerPath(structure),
      content: await this.renderTemplate('use-case-handler.ts.ejs', templateData),
      action: 'create',
    });

    // 3. Tests (if specified)
    if (this.useCaseOptions.withTests) {
      files.push({
        path: this.getTestPath(structure),
        content: await this.renderTemplate('use-case.test.ts.ejs', templateData),
        action: 'create',
      });
    }

    return files;
  }

  protected getTemplatePath(templateName: string): string {
    return path.join(__dirname, 'templates', templateName);
  }

  private parseProps(propsString: string): Array<{ name: string; type: string }> {
    if (!propsString) return [];

    return ValidationUtils.validateProps(propsString);
  }

  private getTypePath(structure: ProjectStructure): string {
    const isCommand = this.useCaseOptions.type === 'command';
    const folder = isCommand ? 'commands' : 'queries';
    const fileName = `${this.options.name}.ts`;

    if (structure.type === 'ddd' && structure.applicationPath) {
      return path.join(structure.applicationPath, folder, fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'application', folder, fileName);
    }

    return this.getDestinationPath('src', 'application', folder, fileName);
  }

  private getHandlerPath(structure: ProjectStructure): string {
    const isCommand = this.useCaseOptions.type === 'command';
    const folder = isCommand ? 'commands' : 'queries';
    const fileName = `${this.options.name}Handler.ts`;

    if (structure.type === 'ddd' && structure.applicationPath) {
      return path.join(structure.applicationPath, folder, fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'application', folder, fileName);
    }

    return this.getDestinationPath('src', 'application', folder, fileName);
  }

  private getTestPath(structure: ProjectStructure): string {
    const isCommand = this.useCaseOptions.type === 'command';
    const folder = isCommand ? 'commands' : 'queries';
    const fileName = `${this.options.name}Handler.test.ts`;

    if (structure.type === 'ddd' && structure.applicationPath) {
      return path.join(structure.applicationPath, folder, '__tests__', fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'application', folder, '__tests__', fileName);
    }

    return this.getDestinationPath('src', 'application', folder, '__tests__', fileName);
  }
}
