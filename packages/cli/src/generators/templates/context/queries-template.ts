import type { TemplateData } from '../../../types/index.js';

export const getByIdQueryTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { Query } from '@stratix/abstractions';

export interface Get${entityName}ByIdData {
  id: string;
}

export class Get${entityName}ById implements Query {
  constructor(public readonly data: Get${entityName}ByIdData) {}
}
`;
};

export const getByIdQueryHandlerTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { QueryHandler } from '@stratix/abstractions';
import { Success, Failure, type Result, EntityId } from '@stratix/primitives';
import { Get${entityName}ById } from './Get${entityName}ById.js';
import type { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class Get${entityName}ByIdHandler implements QueryHandler<Get${entityName}ById, Result<${entityName} | null, Error>> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(query: Get${entityName}ById): Promise<Result<${entityName} | null, Error>> {
    try {
      const id = EntityId.from<'${entityName}'>(query.data.id);
      const entity = await this.repository.findById(id);
      
      return Success.create(entity);
    } catch (error) {
      return Failure.create(
        error instanceof Error ? error : new Error('Failed to get ${entityName}')
      );
    }
  }
}
`;
};

export const listQueryTemplate = (data: TemplateData): string => {
  const { entityNamePlural } = data;

  return `import type { Query } from '@stratix/abstractions';

export class List${entityNamePlural} implements Query {
  constructor(public readonly data: Record<string, never> = {}) {}
}
`;
};

export const listQueryHandlerTemplate = (data: TemplateData): string => {
  const { entityName, entityNamePlural } = data;

  return `import type { QueryHandler } from '@stratix/abstractions';
import { Success, Failure, type Result } from '@stratix/primitives';
import { List${entityNamePlural} } from './List${entityNamePlural}.js';
import type { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class List${entityNamePlural}Handler implements QueryHandler<List${entityNamePlural}, Result<${entityName}[], Error>> {
  constructor(private readonly repository: ${entityName}Repository) {}

  async handle(): Promise<Result<${entityName}[], Error>> {
    try {
      const entities = await this.repository.findAll();
      return Success.create(entities);
    } catch (error) {
      return Failure.create(
        error instanceof Error ? error : new Error('Failed to list ${entityNamePlural}')
      );
    }
  }
}
`;
};
