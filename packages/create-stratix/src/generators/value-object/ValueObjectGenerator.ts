import path from 'path';
import { BaseGenerator } from '../BaseGenerator.js';
import {
  ValueObjectGeneratorOptions,
  GeneratedFile,
  ProjectStructure,
} from '../../types/generator.js';
import { ValidationUtils } from '../../utils/validation.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ValueObjectGenerator extends BaseGenerator {
  private voOptions: ValueObjectGeneratorOptions;

  constructor(options: ValueObjectGeneratorOptions) {
    super(options);
    this.voOptions = options;
  }

  protected validate(): void {
    ValidationUtils.validateValueObjectName(this.options.name);

    if (this.voOptions.props) {
      ValidationUtils.validateProps(this.voOptions.props);
    }
  }

  protected async generateFiles(structure: ProjectStructure): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    const props = this.parseProps(this.voOptions.props || '');

    const templateData = {
      voName: this.options.name,
      voNameCamel: this.naming.toCamelCase(this.options.name),
      props,
      withValidation: this.voOptions.withValidation ?? false,
      naming: this.naming,
    };

    // 1. Value Object file
    files.push({
      path: this.getValueObjectPath(structure),
      content: await this.renderTemplate('value-object.ts.ejs', templateData),
      action: 'create',
    });

    // 2. Tests (if specified)
    if (this.voOptions.withTests) {
      files.push({
        path: this.getTestPath(structure),
        content: await this.renderTemplate('value-object.test.ts.ejs', templateData),
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

  private getValueObjectPath(structure: ProjectStructure): string {
    const fileName = `${this.options.name}.ts`;

    if (structure.type === 'ddd' && structure.domainPath) {
      return path.join(structure.domainPath, 'value-objects', fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'domain', 'value-objects', fileName);
    }

    return this.getDestinationPath('src', 'domain', 'value-objects', fileName);
  }

  private getTestPath(structure: ProjectStructure): string {
    const fileName = `${this.options.name}.test.ts`;

    if (structure.type === 'ddd' && structure.domainPath) {
      return path.join(structure.domainPath, 'value-objects', '__tests__', fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'domain', 'value-objects', '__tests__', fileName);
    }

    return this.getDestinationPath('src', 'domain', 'value-objects', '__tests__', fileName);
  }
}
