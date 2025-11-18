import type { TemplateData } from '../../../types/index.js';

export const getByIdQueryTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `export interface Get${entityName}ByIdData {
  id: string;
}

export class Get${entityName}ById {
  constructor(public readonly data: Get${entityName}ByIdData) {}
}
`;
};

export const getByIdQueryHandlerTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { QueryHandler } from '@stratix/abstractions';
import { Result, EntityId } from '@stratix/primitives';
import { Get${entityName}ById } from './Get${entityName}ById.js';
import type { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Get${entityName}ByIdHandler implements QueryHandler<Get${entityName}ById, ${entityName} | null> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(query: Get${entityName}ById): Promise<Result<${entityName} | null>> {
    try {
      const id = EntityId.fromString<'${entityName}'>(query.data.id, '${entityName}');
      const entity = await this.repository.findById(id);
      
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Failed to get ${entityName}');
    }
  }
}
`;
};

export const listQueryTemplate = (data: TemplateData): string => {
  const { entityNamePlural } = data;

  return `export class List${entityNamePlural} {
  constructor(public readonly data: Record<string, never> = {}) {}
}
`;
};

export const listQueryHandlerTemplate = (data: TemplateData): string => {
  const { entityName, entityNamePlural } = data;

  return `import type { QueryHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { List${entityNamePlural} } from './List${entityNamePlural}.js';
import type { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class List${entityNamePlural}Handler implements QueryHandler<List${entityNamePlural}, ${entityName}[]> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(query: List${entityNamePlural}): Promise<Result<${entityName}[]>> {
    try {
      const entities = await this.repository.findAll();
      return Result.ok(entities);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Failed to list ${entityNamePlural}');
    }
  }
}
`;
};
