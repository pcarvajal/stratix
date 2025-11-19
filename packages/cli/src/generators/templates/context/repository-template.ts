import type { TemplateData } from '../../../types/index.js';

export const repositoryInterfaceTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import type { Repository } from '@stratix/core';
import type { ${entityName} } from '../entities/${entityName}.js';
import { EntityId } from '@stratix/core';

export interface ${entityName}Repository extends Repository<${entityName}, EntityId<'${entityName}'>> {
  findById(id: EntityId<'${entityName}'>): Promise<${entityName} | null>;
  findAll(): Promise<${entityName}[]>;
  save(entity: ${entityName}): Promise<void>;
  delete(id: EntityId<'${entityName}'>): Promise<void>;
}
`;
};

export const inMemoryRepositoryTemplate = (data: TemplateData): string => {
  const { entityName } = data;

  return `import { EntityId } from '@stratix/core';
import type { ${entityName} } from '../../domain/entities/${entityName}.js';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';

export class InMemory${entityName}Repository implements ${entityName}Repository {
  private entities = new Map<string, ${entityName}>();

  async findById(id: EntityId<'${entityName}'>): Promise<${entityName} | null> {
    return this.entities.get(id.toString()) || null;
  }

  async findAll(): Promise<${entityName}[]> {
    return Array.from(this.entities.values());
  }

  async save(entity: ${entityName}): Promise<void> {
    this.entities.set(entity.id.toString(), entity);
  }

  async delete(id: EntityId<'${entityName}'>): Promise<void> {
    this.entities.delete(id.toString());
  }
}
`;
};
