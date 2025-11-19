import { NamingUtils } from '../../utils/naming.js';

export function generateRepositoryInterface(entityName: string): string {

  return `import type { EntityId } from '@stratix/core';
import type { ${entityName} } from '../entities/${entityName}.js';

export interface ${entityName}Repository {
  save(entity: ${entityName}): Promise<void>;
  findById(id: EntityId<'${entityName}'>): Promise<${entityName} | null>;
  findAll(): Promise<${entityName}[]>;
  delete(id: EntityId<'${entityName}'>): Promise<void>;
}
`;
}

export function generateInMemoryRepository(entityName: string): string {
  const entityCamel = NamingUtils.toCamelCase(entityName);

  return `import type { EntityId } from '@stratix/core';
import type { ${entityName}Repository } from '../../domain/repositories/${entityName}Repository.js';
import type { ${entityName} } from '../../domain/entities/${entityName}.js';

export class InMemory${entityName}Repository implements ${entityName}Repository {
  private ${entityCamel}s: Map<string, ${entityName}> = new Map();

  async save(${entityCamel}: ${entityName}): Promise<void> {
    this.${entityCamel}s.set(${entityCamel}.id.toString(), ${entityCamel});
  }

  async findById(id: EntityId<'${entityName}'>): Promise<${entityName} | null> {
    return this.${entityCamel}s.get(id.toString()) ?? null;
  }

  async findAll(): Promise<${entityName}[]> {
    return Array.from(this.${entityCamel}s.values());
  }

  async delete(id: EntityId<'${entityName}'>): Promise<void> {
    this.${entityCamel}s.delete(id.toString());
  }
}
`;
}
