import path from 'path';
import { BaseGenerator } from './BaseGenerator.js';
import { ValidationUtils } from '../utils/validation.js';
import { commandTemplate, commandHandlerTemplate } from './templates/command-template.js';
import type { GeneratedFile, GenerateCommandOptions, TemplateData } from '../types/index.js';

export class CommandGenerator extends BaseGenerator {
  constructor(
    private commandName: string,
    private options: GenerateCommandOptions,
    projectRoot?: string
  ) {
    super(projectRoot);
  }

  async generate(): Promise<GeneratedFile[]> {
    const validation = ValidationUtils.validateEntityName(this.commandName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const props = ValidationUtils.parseProps(this.options.input || this.options.props);
    const structure = await this.detectProjectStructure();

    const commandPath = structure.applicationPath 
      ? path.join(structure.applicationPath, 'commands')
      : path.join(structure.sourceRoot, 'application', 'commands');

    const templateData: TemplateData = {
      entityName: this.naming.toPascalCase(this.commandName),
      entityNameCamel: this.naming.toCamelCase(this.commandName),
      entityNameKebab: this.naming.toKebabCase(this.commandName),
      entityNamePlural: this.naming.pluralize(this.commandName),
      props,
      naming: this.naming,
    };

    const files: GeneratedFile[] = [];

    const commandFilePath = path.join(commandPath, `${templateData.entityName}.ts`);
    const commandFileExists = await this.fileExists(commandFilePath);

    if (commandFileExists && !this.options.force) {
      files.push({
        path: this.getRelativePath(commandFilePath),
        content: '',
        action: 'skip',
      });
    } else {
      files.push({
        path: this.getRelativePath(commandFilePath),
        content: commandTemplate(templateData),
        action: this.options.dryRun ? 'dry-run' : 'create',
      });
    }

    const handlerFilePath = path.join(commandPath, `${templateData.entityName}Handler.ts`);
    const handlerFileExists = await this.fileExists(handlerFilePath);

    if (handlerFileExists && !this.options.force) {
      files.push({
        path: this.getRelativePath(handlerFilePath),
        content: '',
        action: 'skip',
      });
    } else {
      files.push({
        path: this.getRelativePath(handlerFilePath),
        content: commandHandlerTemplate(templateData),
        action: this.options.dryRun ? 'dry-run' : 'create',
      });
    }

    await this.writeFiles(files, this.options.dryRun);
    return files;
  }
}
