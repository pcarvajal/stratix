import type { TemplateData } from '../../types/index.js';

export const commandTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `export interface ${entityName}Command {
${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}
}

export class ${entityName} {
  constructor(public readonly data: ${entityName}Command) {}
}
`;
};

export const commandHandlerTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { CommandHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { ${entityName} } from './${entityName}.js';

export class ${entityName}Handler implements CommandHandler<${entityName}, void> {
  async handle(command: ${entityName}): Promise<Result<void>> {
    try {
      // TODO: Implement command logic
      console.log('Executing ${entityName}:', command.data);
      
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
`;
};
