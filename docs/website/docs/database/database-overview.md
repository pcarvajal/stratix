---
sidebar_position: 1
title: Database Overview
description: Database integration with Stratix
---

# Database Overview

Stratix supports multiple databases through plugins.

## Available Database Plugins

- **@stratix/postgres** - PostgreSQL
- **@stratix/mongodb** - MongoDB
- **@stratix/redis** - Redis

## Repository Pattern

Stratix uses the Repository pattern for data access:

```typescript
export interface IProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  delete(id: string): Promise<void>;
}
```

## PostgreSQL Example

```typescript
import { PostgresPlugin } from '@stratix/postgres';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'password'
  }))
  .build();
```

## Repository Implementation

```typescript
export class PostgresProductRepository implements IProductRepository {
  constructor(private db: Database) {}

  async save(product: Product): Promise<void> {
    await this.db('products').insert({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      created_at: product.createdAt,
      updated_at: product.updatedAt
    });
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db('products')
      .where({ id })
      .first();

    if (!row) return null;

    return Product.create({
      name: row.name,
      price: row.price
    });
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.db('products').select('*');
    return rows.map(row => Product.create({
      name: row.name,
      price: row.price
    }));
  }

  async delete(id: string): Promise<void> {
    await this.db('products').where({ id }).delete();
  }
}
```

## Transactions

```typescript
async createOrder(order: Order): Promise<void> {
  await this.db.transaction(async (trx) => {
    // Save order
    await trx('orders').insert({
      id: order.id.toString(),
      total: order.total
    });

    // Save order items
    for (const item of order.items) {
      await trx('order_items').insert({
        order_id: order.id.toString(),
        product_id: item.productId,
        quantity: item.quantity
      });
    }
  });
}
```

## Next Steps

- **[PostgreSQL](./postgres)** - PostgreSQL integration
- **[MongoDB](./mongodb)** - MongoDB integration
- **[Migrations](./migrations)** - Database migrations
