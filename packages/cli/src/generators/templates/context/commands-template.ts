import type { TemplateData } from '../../../types/index.js';

export const createCommandTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `export interface Create${entityName}Data {
${props.map(p => `  ${p.name}: ${p.type};`).join('\n')}
}

export class Create${entityName} {
  constructor(public readonly data: Create${entityName}Data) {}
}
`;
};

export const createCommandHandlerTemplate = (data: TemplateData): string => {
  const { entityName, entityNameCamel } = data;

  return `import type { CommandHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { Create${entityName} } from './Create${entityName}.js';
import { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Create${entityName}Handler implements CommandHandler<Create${entityName}, ${entityName}> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(command: Create${entityName}): Promise<Result<${entityName}>> {
    try {
      const ${entityNameCamel} = ${entityName}.create(command.data);
      await this.repository.save(${entityNameCamel});
      
      return Result.ok(${entityNameCamel});
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Failed to create ${entityName}');
    }
  }
}
`;
};

export const updateCommandTemplate = (data: TemplateData): string => {
  const { entityName, props } = data;

  return `import { EntityId } from '@stratix/primitives';

export interface Update${entityName}Data {
  id: string;
${props.map(p => `  ${p.name}?: ${p.type};`).join('\n')}
}

export class Update${entityName} {
  constructor(public readonly data: Update${entityName}Data) {}
}
`;
};

export const updateCommandHandlerTemplate = (data: TemplateData): string => {
  const { entityName, entityNameCamel } = data;

  return `import type { CommandHandler } from '@stratix/abstractions';
import { Result, EntityId } from '@stratix/primitives';
import { Update${entityName} } from './Update${entityName}.js';
import { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Update${entityName}Handler implements CommandHandler<Update${entityName}, ${entityName}> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(command: Update${entityName}): Promise<Result<${entityName}>> {
    try {
      const id = EntityId.fromString<'${entityName}'>(command.data.id, '${entityName}');
      const ${entityNameCamel} = await this.repository.findById(id);
      
      if (!${entityNameCamel}) {
        return Result.fail('${entityName} not found');
      }

      const { id: _, ...updateData } = command.data;
      ${entityNameCamel}.update(updateData);
      await this.repository.save(${entityNameCamel});
      
      return Result.ok(${entityNameCamel});
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Failed to update ${entityName}');
    }
  }
}
`;
};

export const deleteCommandTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `export interface Delete${entityName}Data {
  id: string;
}

export class Delete${entityName} {
  constructor(public readonly data: Delete${entityName}Data) {}
}
`;
};

export const deleteCommandHandlerTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { CommandHandler } from '@stratix/abstractions';
import { Result, EntityId } from '@stratix/primitives';
import { Delete${entityName} } from './Delete${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Delete${entityName}Handler implements CommandHandler<Delete${entityName}, void> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(command: Delete${entityName}): Promise<Result<void>> {
    try {
      const id = EntityId.fromString<'${entityName}'>(command.data.id, '${entityName}');
      const entity = await this.repository.findById(id);
      
      if (!entity) {
        return Result.fail('${entityName} not found');
      }

      await this.repository.delete(id);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Failed to delete ${entityName}');
    }
  }
}
`;
};
