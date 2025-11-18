import type { TemplateData } from '../../types/index.js';

export const queryTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `export interface ${entityName}Query {
${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}
}

export class ${entityName} {
  constructor(public readonly data: ${entityName}Query) {}
}
`;
};

export const queryHandlerTemplate = (data: TemplateData, outputType: string): string => {
  const { entityName } = data;

  return `import type { QueryHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { ${entityName} } from './${entityName}.js';

export class ${entityName}Handler implements QueryHandler<${entityName}, ${outputType}> {
  async handle(query: ${entityName}): Promise<Result<${outputType}>> {
    try {
      // TODO: Implement query logic
      console.log('Executing ${entityName}:', query.data);
      
      // Return dummy data for now
      return Result.ok({} as ${outputType});
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
`;
};
