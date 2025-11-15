import path from 'path';
import { BaseGenerator } from '../BaseGenerator.js';
import { EntityGeneratorOptions, GeneratedFile, ProjectStructure } from '../../types/generator.js';
import { ValidationUtils } from '../../utils/validation.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class EntityGenerator extends BaseGenerator {
  private entityOptions: EntityGeneratorOptions;

  constructor(options: EntityGeneratorOptions) {
    super(options);
    this.entityOptions = options;
  }

  protected validate(): void {
    ValidationUtils.validateEntityName(this.options.name);

    if (this.entityOptions.props) {
      ValidationUtils.validateProps(this.entityOptions.props);
    }
  }

  protected async generateFiles(structure: ProjectStructure): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    const props = this.parseProps(this.entityOptions.props || '');

    const templateData = {
      entityName: this.options.name,
      entityNameCamel: this.naming.toCamelCase(this.options.name),
      entityNameKebab: this.naming.toKebabCase(this.options.name),
      props,
      isAggregate: this.entityOptions.aggregate ?? true,
      eventName: this.entityOptions.withEvent,
      hasEvent: !!this.entityOptions.withEvent,
      skipValidation: this.entityOptions.skipValidation ?? false,
      naming: this.naming,
    };

    // 1. Entity file
    files.push({
      path: this.getEntityPath(structure),
      content: await this.renderTemplate('entity.ts.ejs', templateData),
      action: 'create',
    });

    // 2. Event file (if specified)
    if (this.entityOptions.withEvent) {
      files.push({
        path: this.getEventPath(structure),
        content: await this.renderTemplate('event.ts.ejs', templateData),
        action: 'create',
      });
    }

    // 3. Tests (if specified)
    if (this.entityOptions.withTests) {
      files.push({
        path: this.getTestPath(structure),
        content: await this.renderTemplate('entity.test.ts.ejs', templateData),
        action: 'create',
      });
    }

    return files;
  }

  protected getTemplatePath(templateName: string): string {
    return path.join(__dirname, 'templates', templateName);
  }

  private parseProps(
    propsString: string
  ): Array<{ name: string; type: string; isPrimitive: boolean }> {
    if (!propsString) return [];

    const primitiveTypes = ['string', 'number', 'boolean', 'Date'];

    return ValidationUtils.validateProps(propsString).map((prop) => ({
      ...prop,
      isPrimitive: primitiveTypes.includes(prop.type) || prop.type.endsWith('[]'),
    }));
  }

  private getEntityPath(structure: ProjectStructure): string {
    const fileName = `${this.options.name}.ts`;

    if (structure.type === 'ddd' && structure.domainPath) {
      return path.join(structure.domainPath, 'entities', fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'domain', 'entities', fileName);
    }

    return this.getDestinationPath('src', 'domain', 'entities', fileName);
  }

  private getEventPath(structure: ProjectStructure): string {
    const fileName = `${this.entityOptions.withEvent}.ts`;

    if (structure.type === 'ddd' && structure.domainPath) {
      return path.join(structure.domainPath, 'events', fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'domain', 'events', fileName);
    }

    return this.getDestinationPath('src', 'domain', 'events', fileName);
  }

  private getTestPath(structure: ProjectStructure): string {
    const fileName = `${this.options.name}.test.ts`;

    if (structure.type === 'ddd' && structure.domainPath) {
      return path.join(structure.domainPath, 'entities', '__tests__', fileName);
    }

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, 'domain', 'entities', '__tests__', fileName);
    }

    return this.getDestinationPath('src', 'domain', 'entities', '__tests__', fileName);
  }
}
