import type { TemplateData } from '../../../types/index.js';

export const contextPluginTemplate = (data: TemplateData): string => {
  const { entityName, entityNamePlural, contextName = 'Unknown' } = data;

  return `import type { Plugin, PluginContext, HealthCheckResult } from '@stratix/core';
import { HealthStatus } from '@stratix/core';
import { Create${entityName}Handler } from './application/commands/Create${entityName}Handler.js';
import { Update${entityName}Handler } from './application/commands/Update${entityName}Handler.js';
import { Delete${entityName}Handler } from './application/commands/Delete${entityName}Handler.js';
import { Get${entityName}ByIdHandler } from './application/queries/Get${entityName}ByIdHandler.js';
import { List${entityNamePlural}Handler } from './application/queries/List${entityNamePlural}Handler.js';
import { InMemory${entityName}Repository } from './infrastructure/persistence/InMemory${entityName}Repository.js';

export class ${contextName}ContextPlugin implements Plugin {
  readonly metadata = {
    name: '${contextName.toLowerCase()}-context',
    version: '1.0.0',
    dependencies: [],
  };

  async initialize(context: PluginContext): Promise<void> {
    const repository = new InMemory${entityName}Repository();
    
    context.container.register('${entityName.toLowerCase()}Repository', () => repository);

    const create${entityName}Handler = new Create${entityName}Handler(repository);
    const update${entityName}Handler = new Update${entityName}Handler(repository);
    const delete${entityName}Handler = new Delete${entityName}Handler(repository);
    const get${entityName}ByIdHandler = new Get${entityName}ByIdHandler(repository);
    const list${entityNamePlural}Handler = new List${entityNamePlural}Handler(repository);

    context.container.register('create${entityName}Handler', () => create${entityName}Handler);
    context.container.register('update${entityName}Handler', () => update${entityName}Handler);
    context.container.register('delete${entityName}Handler', () => delete${entityName}Handler);
    context.container.register('get${entityName}ByIdHandler', () => get${entityName}ByIdHandler);
    context.container.register('list${entityNamePlural}Handler', () => list${entityNamePlural}Handler);
  }

  async start(): Promise<void> {
    // No startup logic needed
  }

  async stop(): Promise<void> {
    // No shutdown logic needed
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { 
      status: HealthStatus.UP,
      message: '${contextName} context is healthy'
    };
  }
}
`;
};

export const contextIndexTemplate = (data: TemplateData): string => {
  const { entityName, entityNamePlural, contextName = 'Unknown' } = data;

  const exports = [
    `export { ${entityName} } from './domain/entities/${entityName}.js';`,
    `export { ${entityName}Created } from './domain/events/${entityName}Created.js';`,
    `export type { ${entityName}Repository } from './domain/repositories/${entityName}Repository.js';`,
    '',
    `export { Create${entityName} } from './application/commands/Create${entityName}.js';`,
    `export { Create${entityName}Handler } from './application/commands/Create${entityName}Handler.js';`,
    `export { Update${entityName} } from './application/commands/Update${entityName}.js';`,
    `export { Update${entityName}Handler } from './application/commands/Update${entityName}Handler.js';`,
    `export { Delete${entityName} } from './application/commands/Delete${entityName}.js';`,
    `export { Delete${entityName}Handler } from './application/commands/Delete${entityName}Handler.js';`,
    '',
    `export { Get${entityName}ById } from './application/queries/Get${entityName}ById.js';`,
    `export { Get${entityName}ByIdHandler } from './application/queries/Get${entityName}ByIdHandler.js';`,
    `export { List${entityNamePlural} } from './application/queries/List${entityNamePlural}.js';`,
    `export { List${entityNamePlural}Handler } from './application/queries/List${entityNamePlural}Handler.js';`,
    '',
    `export { InMemory${entityName}Repository } from './infrastructure/persistence/InMemory${entityName}Repository.js';`,
    '',
    `export { ${contextName}ContextPlugin } from './${contextName}ContextPlugin.js';`,
  ];

  return exports.join('\n');
};
