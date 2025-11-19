import type { TemplateData } from '../../types/index.js';

export const queryTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `import type { Query } from '@stratix/core';

export interface ${entityName}Query {
${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}
}

export class ${entityName} implements Query {
  constructor(public readonly data: ${entityName}Query) {}
}
`;
};

export const queryHandlerTemplate = (data: TemplateData, outputType: string): string => {
  const { entityName } = data;
  
  // Extract base type name without brackets or other syntax
  const baseTypeName = outputType.replace(/[[\]<>]/g, '');
  const needsTypeDefinition = outputType !== 'any' && outputType !== 'void' && !['string', 'number', 'boolean', 'unknown'].includes(baseTypeName);
  const typeDefinition = needsTypeDefinition 
    ? `\n// TODO: Define or import ${baseTypeName} type\ntype ${baseTypeName} = unknown;\n` 
    : '';

  return `import type { QueryHandler } from '@stratix/core';
import { Success, Failure, type Result } from '@stratix/core';
import { ${entityName} } from './${entityName}.js';
${typeDefinition}
export class ${entityName}Handler implements QueryHandler<${entityName}, Result<${outputType}, Error>> {
  async handle(query: ${entityName}): Promise<Result<${outputType}, Error>> {
    try {
      // TODO: Implement query logic
      console.log('Executing ${entityName}:', query.data);
      
      // Return dummy data for now
      return Success.create(${outputType.includes('[]') ? '[]' : '{}'} as ${outputType});
    } catch (error) {
      return Failure.create(
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}
`;
};
