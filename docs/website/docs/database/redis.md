---
sidebar_position: 4
title: Redis
description: Redis caching and pub/sub
---

# Redis

Redis integration for caching and pub/sub.

## Installation

```bash
stratix add @stratix/redis
```

## Configuration

```typescript
import { RedisPlugin } from '@stratix/redis';

const app = await ApplicationBuilder.create()
  .usePlugin(new RedisPlugin({
    host: 'localhost',
    port: 6379
  }))
  .build();
```

## Caching

```typescript
export class CachedProductRepository implements IProductRepository {
  constructor(
    private repository: IProductRepository,
    private redis: Redis
  ) {}

  async findById(id: string): Promise<Product | null> {
    // Check cache
    const cached = await this.redis.get(`product:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const product = await this.repository.findById(id);
    
    // Cache result
    if (product) {
      await this.redis.setex(
        `product:${id}`,
        3600,
        JSON.stringify(product)
      );
    }

    return product;
  }
}
```

## Pub/Sub

```typescript
// Publisher
await redis.publish('product.created', JSON.stringify({
  id: product.id,
  name: product.name
}));

// Subscriber
redis.subscribe('product.created', (message) => {
  const event = JSON.parse(message);
  console.log('Product created:', event);
});
```

## Next Steps

- **[Database Overview](./database-overview)** - Database basics
- **[PostgreSQL](./postgres)** - PostgreSQL integration
