import path from 'path';
import { BaseGenerator } from './BaseGenerator.js';
import { ValidationUtils } from '../utils/validation.js';
import { contextEntityTemplate } from './templates/context/entity-template.js';
import { repositoryInterfaceTemplate, inMemoryRepositoryTemplate } from './templates/context/repository-template.js';
import { domainEventTemplate } from './templates/context/event-template.js';
import {
  createCommandTemplate,
  createCommandHandlerTemplate,
  updateCommandTemplate,
  updateCommandHandlerTemplate,
  deleteCommandTemplate,
  deleteCommandHandlerTemplate,
} from './templates/context/commands-template.js';
import {
  getByIdQueryTemplate,
  getByIdQueryHandlerTemplate,
  listQueryTemplate,
  listQueryHandlerTemplate,
} from './templates/context/queries-template.js';
import { contextPluginTemplate, contextIndexTemplate } from './templates/context/plugin-template.js';
import type { GeneratedFile, GenerateCommandOptions, TemplateData } from '../types/index.js';

export class ContextGenerator extends BaseGenerator {
  constructor(
    private contextName: string,
    private options: GenerateCommandOptions,
    projectRoot?: string
  ) {
    super(projectRoot);
  }

  async generate(): Promise<GeneratedFile[]> {
    const validation = ValidationUtils.validateEntityName(this.contextName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const props = ValidationUtils.parseProps(this.options.props);
    if (props.length === 0) {
      throw new Error('Context must have at least one property. Use --props "name:type,price:number"');
    }

    const structure = await this.detectProjectStructure();
    const contextsPath = path.join(structure.sourceRoot, 'contexts');
    const contextPath = path.join(contextsPath, this.naming.toKebabCase(this.contextName));

    const entityName = this.naming.toPascalCase(this.naming.singularize(this.contextName));
    const templateData: TemplateData = {
      entityName,
      entityNameCamel: this.naming.toCamelCase(entityName),
      entityNameKebab: this.naming.toKebabCase(entityName),
      entityNamePlural: this.naming.toPascalCase(this.naming.pluralize(entityName)),
      contextName: this.naming.toPascalCase(this.contextName),
      props,
      naming: this.naming,
    };

    const files: GeneratedFile[] = [];

    // Domain layer
    files.push(
      this.createFile(
        path.join(contextPath, 'domain', 'entities', `${templateData.entityName}.ts`),
        contextEntityTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'domain', 'repositories', `${templateData.entityName}Repository.ts`),
        repositoryInterfaceTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'domain', 'events', `${templateData.entityName}Created.ts`),
        domainEventTemplate(templateData)
      )
    );

    // Application layer - Commands
    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'commands', `Create${templateData.entityName}.ts`),
        createCommandTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'commands', `Create${templateData.entityName}Handler.ts`),
        createCommandHandlerTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'commands', `Update${templateData.entityName}.ts`),
        updateCommandTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'commands', `Update${templateData.entityName}Handler.ts`),
        updateCommandHandlerTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'commands', `Delete${templateData.entityName}.ts`),
        deleteCommandTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'commands', `Delete${templateData.entityName}Handler.ts`),
        deleteCommandHandlerTemplate(templateData)
      )
    );

    // Application layer - Queries
    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'queries', `Get${templateData.entityName}ById.ts`),
        getByIdQueryTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'queries', `Get${templateData.entityName}ByIdHandler.ts`),
        getByIdQueryHandlerTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'queries', `List${templateData.entityNamePlural}.ts`),
        listQueryTemplate(templateData)
      )
    );

    files.push(
      this.createFile(
        path.join(contextPath, 'application', 'queries', `List${templateData.entityNamePlural}Handler.ts`),
        listQueryHandlerTemplate(templateData)
      )
    );

    // Infrastructure layer
    files.push(
      this.createFile(
        path.join(contextPath, 'infrastructure', 'persistence', `InMemory${templateData.entityName}Repository.ts`),
        inMemoryRepositoryTemplate(templateData)
      )
    );

    // Plugin
    files.push(
      this.createFile(
        path.join(contextPath, `${templateData.contextName}ContextPlugin.ts`),
        contextPluginTemplate(templateData)
      )
    );

    // Index
    files.push(
      this.createFile(
        path.join(contextPath, 'index.ts'),
        contextIndexTemplate(templateData)
      )
    );

    await this.writeFiles(files, this.options.dryRun);
    return files;
  }

  private createFile(filePath: string, content: string): GeneratedFile {
    return {
      path: this.getRelativePath(filePath),
      content,
      action: this.options.dryRun ? 'dry-run' : 'create',
    };
  }
}
