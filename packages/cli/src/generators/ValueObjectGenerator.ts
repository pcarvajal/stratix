import path from 'path';
import { BaseGenerator } from './BaseGenerator.js';
import { ValidationUtils } from '../utils/validation.js';
import { valueObjectTemplate } from './templates/value-object-template.js';
import type { GeneratedFile, GenerateCommandOptions, TemplateData } from '../types/index.js';

export class ValueObjectGenerator extends BaseGenerator {
  constructor(
    private name: string,
    private options: GenerateCommandOptions,
    projectRoot?: string
  ) {
    super(projectRoot);
  }

  async generate(): Promise<GeneratedFile[]> {
    const validation = ValidationUtils.validateEntityName(this.name);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const props = ValidationUtils.parseProps(this.options.props);
    if (props.length === 0) {
      throw new Error('Value objects must have at least one property. Use --props "name:type"');
    }

    const structure = await this.detectProjectStructure();

    const voPath = structure.domainPath 
      ? path.join(structure.domainPath, 'value-objects')
      : path.join(structure.sourceRoot, 'domain', 'value-objects');

    const templateData: TemplateData = {
      entityName: this.naming.toPascalCase(this.name),
      entityNameCamel: this.naming.toCamelCase(this.name),
      entityNameKebab: this.naming.toKebabCase(this.name),
      entityNamePlural: this.naming.pluralize(this.name),
      props,
      naming: this.naming,
    };

    const files: GeneratedFile[] = [];

    const voFilePath = path.join(voPath, `${templateData.entityName}.ts`);
    const fileExists = await this.fileExists(voFilePath);

    if (fileExists && !this.options.force) {
      files.push({
        path: this.getRelativePath(voFilePath),
        content: '',
        action: 'skip',
      });
    } else {
      files.push({
        path: this.getRelativePath(voFilePath),
        content: valueObjectTemplate(templateData),
        action: this.options.dryRun ? 'dry-run' : 'create',
      });
    }

    await this.writeFiles(files, this.options.dryRun);
    return files;
  }
}
