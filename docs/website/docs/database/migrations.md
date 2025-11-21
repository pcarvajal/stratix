---
sidebar_position: 5
title: Migrations
description: Database migrations
---

# Migrations

Database schema migrations for Stratix.

## Creating Migrations

```bash
# Create migration file
mkdir -p migrations
touch migrations/001_create_products.ts
```

## Migration Structure

```typescript
import { Database } from '@stratix/postgres';

export async function up(db: Database): Promise<void> {
  await db.schema.createTable('products', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('stock').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });

  await db.schema.createTable('orders', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable();
    table.decimal('total', 10, 2).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(db: Database): Promise<void> {
  await db.schema.dropTable('orders');
  await db.schema.dropTable('products');
}
```

## Running Migrations

```typescript
import { runMigrations } from '@stratix/postgres';

await runMigrations(db, {
  directory: './migrations'
});
```

## Best Practices

### 1. Sequential Naming

```
migrations/
  001_create_products.ts
  002_add_categories.ts
  003_add_indexes.ts
```

### 2. Always Provide Down

```typescript
export async function down(db: Database): Promise<void> {
  // Rollback changes
}
```

### 3. Test Migrations

```bash
# Run migration
npm run migrate:up

# Rollback
npm run migrate:down

# Re-run
npm run migrate:up
```

## Next Steps

- **[Database Overview](./database-overview)** - Database basics
- **[PostgreSQL](./postgres)** - PostgreSQL integration
