import path from 'path';
import { BaseGenerator } from './BaseGenerator.js';
import { ValidationUtils } from '../utils/validation.js';
import { queryTemplate, queryHandlerTemplate } from './templates/query-template.js';
import type { GeneratedFile, GenerateCommandOptions, TemplateData } from '../types/index.js';

export class QueryGenerator extends BaseGenerator {
  constructor(
    private queryName: string,
    private options: GenerateCommandOptions,
    projectRoot?: string
  ) {
    super(projectRoot);
  }

  async generate(): Promise<GeneratedFile[]> {
    const validation = ValidationUtils.validateEntityName(this.queryName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const props = ValidationUtils.parseProps(this.options.input || this.options.props);
    const structure = await this.detectProjectStructure();

    const queryPath = structure.applicationPath 
      ? path.join(structure.applicationPath, 'queries')
      : path.join(structure.sourceRoot, 'application', 'queries');

    const templateData: TemplateData = {
      entityName: this.naming.toPascalCase(this.queryName),
      entityNameCamel: this.naming.toCamelCase(this.queryName),
      entityNameKebab: this.naming.toKebabCase(this.queryName),
      entityNamePlural: this.naming.pluralize(this.queryName),
      props,
      naming: this.naming,
    };

    const outputType = this.options.output || 'any';

    const files: GeneratedFile[] = [];

    const queryFilePath = path.join(queryPath, `${templateData.entityName}.ts`);
    const queryFileExists = await this.fileExists(queryFilePath);

    if (queryFileExists && !this.options.force) {
      files.push({
        path: this.getRelativePath(queryFilePath),
        content: '',
        action: 'skip',
      });
    } else {
      files.push({
        path: this.getRelativePath(queryFilePath),
        content: queryTemplate(templateData),
        action: this.options.dryRun ? 'dry-run' : 'create',
      });
    }

    const handlerFilePath = path.join(queryPath, `${templateData.entityName}Handler.ts`);
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
        content: queryHandlerTemplate(templateData, outputType),
        action: this.options.dryRun ? 'dry-run' : 'create',
      });
    }

    await this.writeFiles(files, this.options.dryRun);
    return files;
  }
}
