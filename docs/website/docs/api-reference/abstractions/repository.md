---
id: repository
title: Repository
sidebar_label: Repository
---

# Repository

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Generic repository interface for domain entities following DDD principles. Repositories represent collections of domain entities, not data access objects. Only `save()` is required - additional methods are optional based on use case.

**Key Features:**
- Minimal interface (only save required)
- Generic entity and ID types
- Optional query methods (findById, findAll, delete, exists)
- Implementation-agnostic persistence
- Domain-focused (not CRUD-focused)

## Import

```typescript
import type { Repository } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface Repository<T, ID = string> {
  save(entity: T): Promise<void>;
  findById?(id: ID): Promise<T | null>;
  findAll?(): Promise<T[]>;
  delete?(id: ID): Promise<void>;
  exists?(id: ID): Promise<boolean>;
}
```

## Usage Examples

### Minimal Repository

```typescript
class UserRepository implements Repository<User, EntityId<'User'>> {
  constructor(private db: Database) {}

  async save(user: User): Promise<void> {
    const data = this.toPersistence(user);
    await this.db.query(
      'INSERT INTO users ... ON CONFLICT (id) DO UPDATE ...',
      data
    );
  }

  private toPersistence(user: User) {
    return {
      id: user.id.value,
      email: user.email,
      name: user.name,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    };
  }
}
```

### Extended Repository

```typescript
interface UserRepository extends Repository<User, EntityId<'User'>> {
  findById(id: EntityId<'User'>): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findActive(): Promise<User[]>;
}

class PostgresUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // Implementation
  }

  async findById(id: EntityId<'User'>): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id.value]);
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return row ? this.toDomain(row) : null;
  }

  async findActive(): Promise<User[]> {
    const rows = await this.db.query('SELECT * FROM users WHERE active = true');
    return rows.map(row => this.toDomain(row));
  }

  private toDomain(row: any): User {
    return User.reconstitute(
      EntityId.from<'User'>(row.id),
      row.email,
      row.name,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
```

## Best Practices

- **Do:** Keep repositories focused on a single aggregate
- **Do:** Use save() for both insert and update
- **Do:** Define additional methods in extended interfaces
- **Do:** Map between domain and persistence models
- **Don't:** Expose database details in repository interface
- **Don't:** Use repositories for reporting queries (use query services)
- **Don't:** Implement findAll() for large datasets (use pagination)

## Related Components

- [Entity](../layer-1-primitives/entity.md) - Repository entities
- [AggregateRoot](../layer-1-primitives/aggregate-root.md) - Repository aggregates

## See Also

- [Package README](../../../packages/abstractions/README.md)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
