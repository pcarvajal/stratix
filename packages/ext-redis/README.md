# @stratix/ext-redis

Redis plugin for Stratix applications.

## Installation

```bash
pnpm add @stratix/ext-redis
```

## Features

- Automatic reconnection
- Health checks with ping
- Built-in caching layer with TTL support
- Key namespacing via prefix
- Full Redis commands support via native client
- Type-safe cache operations

## Configuration

```typescript
interface RedisConfig {
  url: string;                    // Required: Redis connection URL
  options?: RedisClientOptions;   // Additional Redis client options
  cache?: {
    prefix?: string;              // Optional: Key prefix for namespacing
    ttl?: number;                 // Optional: Default TTL in seconds
  };
}
```

## Quick Example

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { RedisPlugin } from '@stratix/ext-redis';

const app = await ApplicationBuilder.create()
  .usePlugin(new RedisPlugin(), {
    url: 'redis://localhost:6379',
    cache: {
      prefix: 'myapp:',
      ttl: 3600  // 1 hour default TTL
    }
  })
  .build();

await app.start();

// Use the cache
const cache = app.resolve('redis:cache');
await cache.set('user:123', { name: 'John Doe', email: 'john@example.com' }, 300);
const user = await cache.get('user:123');

// Use the native client for advanced operations
const client = app.resolve('redis:client');
await client.hSet('hash:key', 'field', 'value');
```

## Exports

- `RedisPlugin` - Main plugin class
- `RedisConfig` - Configuration interface
- `RedisConnection` - Connection wrapper class
- `RedisCache` - High-level caching layer
- `CacheOptions` - Cache operation options

## Services Registered

The plugin registers the following services in the DI container:

- `redis:connection` - RedisConnection instance
- `redis:cache` - RedisCache instance for high-level operations
- `redis:client` - Native Redis client for low-level operations

## License

MIT
