---
sidebar_position: 2
title: PostgreSQL
description: PostgreSQL integration
---

# PostgreSQL

PostgreSQL database integration for Stratix.

## Installation

```bash
stratix add @stratix/postgres
```

## Configuration

```typescript
import { PostgresPlugin } from '@stratix/postgres';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    pool: {
      min: 2,
      max: 10
    },
    ssl: process.env.NODE_ENV === 'production'
  }))
  .build();
```

## Repository Implementation

```typescript
export class PostgresProductRepository implements IProductRepository {
  constructor(private db: Database) {}

  async save(product: Product): Promise<void> {
    await this.db('products')
      .insert({
        id: product.id.toString(),
        name: product.name,
        price: product.price
      })
      .onConflict('id')
      .merge();
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db('products')
      .where({ id })
      .first();

    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: any): Product {
    return Product.create({
      name: row.name,
      price: row.price
    });
  }
}
```

## Migrations

```typescript
// migrations/001_create_products.ts
export async function up(db: Database): Promise<void> {
  await db.schema.createTable('products', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(db: Database): Promise<void> {
  await db.schema.dropTable('products');
}
```

## Next Steps

- **[Database Overview](./database-overview)** - Database basics
- **[Migrations](./migrations)** - Migration guide
