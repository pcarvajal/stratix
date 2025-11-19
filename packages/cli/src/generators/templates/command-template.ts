import type { TemplateData } from '../../types/index.js';

export const commandTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `import type { Command } from '@stratix/core';

export interface ${entityName}Command {
${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}
}

export class ${entityName} implements Command {
  constructor(public readonly data: ${entityName}Command) {}
}
`;
};

export const commandHandlerTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { CommandHandler } from '@stratix/core';
import { Success, Failure, type Result } from '@stratix/core';
import { ${entityName} } from './${entityName}.js';

export class ${entityName}Handler implements CommandHandler<${entityName}, Result<void, Error>> {
  async handle(command: ${entityName}): Promise<Result<void, Error>> {
    try {
      // TODO: Implement command logic
      console.log('Executing ${entityName}:', command.data);
      
      return Success.create(undefined);
    } catch (error) {
      return Failure.create(
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}
`;
};
