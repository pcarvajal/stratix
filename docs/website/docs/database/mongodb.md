---
sidebar_position: 3
title: MongoDB
description: MongoDB integration
---

# MongoDB

MongoDB integration for Stratix.

## Installation

```bash
stratix add @stratix/mongodb
```

## Configuration

```typescript
import { MongoDBPlugin } from '@stratix/mongodb';

const app = await ApplicationBuilder.create()
  .usePlugin(new MongoDBPlugin({
    url: process.env.MONGODB_URL!,
    database: 'myapp'
  }))
  .build();
```

## Repository Implementation

```typescript
export class MongoProductRepository implements IProductRepository {
  constructor(private db: Db) {}

  async save(product: Product): Promise<void> {
    await this.db.collection('products').updateOne(
      { _id: product.id.toString() },
      {
        $set: {
          name: product.name,
          price: product.price,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await this.db.collection('products')
      .findOne({ _id: id });

    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: any): Product {
    return Product.create({
      name: doc.name,
      price: doc.price
    });
  }
}
```

## Next Steps

- **[Database Overview](./database-overview)** - Database basics
- **[PostgreSQL](./postgres)** - PostgreSQL integration
