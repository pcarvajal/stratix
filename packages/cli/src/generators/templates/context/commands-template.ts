import type { TemplateData } from '../../../types/index.js';

export const createCommandTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `import type { Command } from '@stratix/core';

export interface Create${entityName}Data {
${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}
}

export class Create${entityName} implements Command {
  constructor(public readonly data: Create${entityName}Data) {}
}
`;
};

export const createCommandHandlerTemplate = (data: TemplateData): string => {
  const { entityName, entityNameCamel } = data;

  return `import type { CommandHandler } from '@stratix/core';
import { Success, Failure, type Result } from '@stratix/core';
import { Create${entityName} } from './Create${entityName}.js';
import { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Create${entityName}Handler implements CommandHandler<Create${entityName}, Result<${entityName}, Error>> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(command: Create${entityName}): Promise<Result<${entityName}, Error>> {
    try {
      const ${entityNameCamel} = ${entityName}.create(command.data);
      await this.repository.save(${entityNameCamel});
      
      return Success.create(${entityNameCamel});
    } catch (error) {
      return Failure.create(
        error instanceof Error ? error : new Error('Failed to create ${entityName}')
      );
    }
  }
}
`;
};

export const updateCommandTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `import type { Command } from '@stratix/core';

export interface Update${entityName}Data {
  id: string;
${props.map(p => `  ${p.name}?: ${p.type};`).join('\n')}
}

export class Update${entityName} implements Command {
  constructor(public readonly data: Update${entityName}Data) {}
}
`;
};

export const updateCommandHandlerTemplate = (data: TemplateData): string => {
  const { entityName, entityNameCamel } = data;

  return `import type { CommandHandler } from '@stratix/core';
import { Success, Failure, type Result, EntityId } from '@stratix/core';
import { Update${entityName} } from './Update${entityName}.js';
import { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Update${entityName}Handler implements CommandHandler<Update${entityName}, Result<${entityName}, Error>> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(command: Update${entityName}): Promise<Result<${entityName}, Error>> {
    try {
      const id = EntityId.from<'${entityName}'>(command.data.id);
      const ${entityNameCamel} = await this.repository.findById(id);
      
      if (!${entityNameCamel}) {
        return Failure.create(new Error('${entityName} not found'));
      }

      const { id: _, ...updateData } = command.data;
      ${entityNameCamel}.update(updateData);
      await this.repository.save(${entityNameCamel});
      
      return Success.create(${entityNameCamel});
    } catch (error) {
      return Failure.create(
        error instanceof Error ? error : new Error('Failed to update ${entityName}')
      );
    }
  }
}
`;
};

export const deleteCommandTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { Command } from '@stratix/core';

export interface Delete${entityName}Data {
  id: string;
}

export class Delete${entityName} implements Command {
  constructor(public readonly data: Delete${entityName}Data) {}
}
`;
};

export const deleteCommandHandlerTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { CommandHandler } from '@stratix/core';
import { Success, Failure, type Result, EntityId } from '@stratix/core';
import { Delete${entityName} } from './Delete${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Delete${entityName}Handler implements CommandHandler<Delete${entityName}, Result<void, Error>> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(command: Delete${entityName}): Promise<Result<void, Error>> {
    try {
      const id = EntityId.from<'${entityName}'>(command.data.id);
      const entity = await this.repository.findById(id);
      
      if (!entity) {
        return Failure.create(new Error('${entityName} not found'));
      }

      await this.repository.delete(id);
      return Success.create(undefined);
    } catch (error) {
      return Failure.create(
        error instanceof Error ? error : new Error('Failed to delete ${entityName}')
      );
    }
  }
}
`;
};
