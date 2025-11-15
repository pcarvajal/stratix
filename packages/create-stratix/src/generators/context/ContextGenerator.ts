import path from 'path';
import { BaseGenerator } from '../BaseGenerator.js';
import { ContextGeneratorOptions, GeneratedFile, ProjectStructure } from '../../types/generator.js';
import { ValidationUtils } from '../../utils/validation.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generator for complete Bounded Context with ContextModule.
 *
 * Generates:
 * - Domain layer (entity, value object, repository interface, events)
 * - Application layer (commands, queries, handlers)
 * - Infrastructure layer (in-memory repository)
 * - ContextModule class that wires everything together
 *
 * @example
 * ```bash
 * stratix generate context Products --props "name:string,price:number"
 * ```
 */
export class ContextGenerator extends BaseGenerator {
  private contextOptions: ContextGeneratorOptions;

  constructor(options: ContextGeneratorOptions) {
    super(options);
    this.contextOptions = options;
  }

  protected validate(): void {
    ValidationUtils.validateEntityName(this.options.name);

    if (this.contextOptions.props) {
      ValidationUtils.validateProps(this.contextOptions.props);
    }
  }

  protected async generateFiles(structure: ProjectStructure): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    const contextName = this.options.name;
    const entityName = this.naming.singularize(contextName);
    const entityNamePlural = this.naming.pluralize(entityName);
    const props = this.parseProps(this.contextOptions.props || '');

    const templateData = {
      contextName,
      contextNameCamel: this.naming.toCamelCase(contextName),
      contextNameKebab: this.naming.toKebabCase(contextName),
      entityName,
      entityNameCamel: this.naming.toCamelCase(entityName),
      entityNameKebab: this.naming.toKebabCase(entityName),
      entityNamePlural,
      entityNamePluralCamel: this.naming.toCamelCase(entityNamePlural),
      props,
      naming: this.naming,
    };

    const contextPath = this.getContextPath(structure);

    // 1. Domain Layer
    files.push({
      path: path.join(contextPath, 'domain', 'entities', `${entityName}.ts`),
      content: await this.renderTemplate('entity.ts.ejs', templateData),
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'domain', 'value-objects', '.gitkeep'),
      content: '',
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'domain', 'repositories', `${entityName}Repository.ts`),
      content: await this.renderTemplate('repository-interface.ts.ejs', templateData),
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'domain', 'events', `${entityName}Created.ts`),
      content: await this.renderTemplate('event.ts.ejs', templateData),
      action: 'create',
    });

    // 2. Application Layer
    files.push({
      path: path.join(contextPath, 'application', 'commands', `Create${entityName}.ts`),
      content: await this.renderTemplate('command.ts.ejs', templateData),
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'application', 'commands', `Create${entityName}Handler.ts`),
      content: await this.renderTemplate('command-handler.ts.ejs', templateData),
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'application', 'queries', `Get${entityName}ById.ts`),
      content: await this.renderTemplate('query.ts.ejs', templateData),
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'application', 'queries', `Get${entityName}ByIdHandler.ts`),
      content: await this.renderTemplate('query-handler.ts.ejs', templateData),
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'application', 'queries', `List${entityNamePlural}.ts`),
      content: await this.renderTemplate('query-list.ts.ejs', templateData),
      action: 'create',
    });

    files.push({
      path: path.join(contextPath, 'application', 'queries', `List${entityNamePlural}Handler.ts`),
      content: await this.renderTemplate('query-list-handler.ts.ejs', templateData),
      action: 'create',
    });

    // 3. Infrastructure Layer
    files.push({
      path: path.join(
        contextPath,
        'infrastructure',
        'persistence',
        `InMemory${entityName}Repository.ts`
      ),
      content: await this.renderTemplate('repository-inmemory.ts.ejs', templateData),
      action: 'create',
    });

    // 4. Context Module
    files.push({
      path: path.join(contextPath, `${contextName}ContextModule.ts`),
      content: await this.renderTemplate('context-module.ts.ejs', templateData),
      action: 'create',
    });

    // 5. Index file for exports
    files.push({
      path: path.join(contextPath, 'index.ts'),
      content: await this.renderTemplate('index.ts.ejs', templateData),
      action: 'create',
    });

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

  private getContextPath(structure: ProjectStructure): string {
    const contextNameKebab = this.naming.toKebabCase(this.options.name);

    if (structure.type === 'modular-monolith' && structure.contextsPath) {
      return path.join(structure.contextsPath, contextNameKebab);
    }

    // Default: create contexts directory in src
    return path.join(structure.basePath, 'src', 'contexts', contextNameKebab);
  }
}
