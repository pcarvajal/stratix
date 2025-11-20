# @stratix/db-redis

Redis plugin for Stratix applications with enterprise features.

## Installation

```bash
pnpm add @stratix/db-redis
```

## Features

- **Caching** - JSON serialization with TTL
- **Rate Limiting** - Sliding window algorithm
- **Distributed Locks** - Prevent race conditions
- **Session Management** - User sessions with TTL
- **Pub/Sub** - Real-time messaging
- **Sorted Sets** - Leaderboards and rankings
- **Queues** - Job processing and task queues
- **Health checks** - Ping and reconnection
- **Type-safe** - Full TypeScript support

## Quick Start

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { RedisPlugin } from '@stratix/db-redis';

const app = await ApplicationBuilder.create()
  .usePlugin(new RedisPlugin(), {
    url: 'redis://localhost:6379',
    cache: {
      prefix: 'myapp:',
      ttl: 3600
    }
  })
  .build();

await app.start();
```

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

## Caching

```typescript
const cache = app.resolve('redis:cache');

// Set and get with automatic JSON serialization
await cache.set('user:123', { name: 'John', email: 'john@example.com' }, 3600);
const user = await cache.get<User>('user:123');

// Remember pattern (cache-aside)
const user = await cache.remember('user:123', 3600, async () => {
  return await userRepository.findById('123');
});

// Batch operations
await cache.setMany([['key1', value1], ['key2', value2]]);
const values = await cache.getMany<User>(['key1', 'key2']);
```

## Rate Limiting

```typescript
import { RedisRateLimiter } from '@stratix/db-redis';

const limiter = new RedisRateLimiter(connection, {
  maxRequests: 100,
  windowSeconds: 60,
  keyPrefix: 'ratelimit:'
});

const result = await limiter.isAllowed('user:123');
if (!result.allowed) {
  throw new Error(`Rate limit exceeded. Try again at ${result.resetAt}`);
}

console.log(`Remaining: ${result.remaining}/${limiter.options.maxRequests}`);
```

## Distributed Locks

```typescript
import { RedisLock } from '@stratix/db-redis';

const lock = new RedisLock(connection);

// Automatic lock/unlock
await lock.withLock('resource:123', async () => {
  // Critical section - only one process can execute this
  await updateResource();
});

// Manual lock/unlock
const lockValue = await lock.acquire('resource:123', { ttl: 5000 });
try {
  await updateResource();
} finally {
  await lock.release('resource:123', lockValue);
}
```

## Session Management

```typescript
import { RedisSessionStore } from '@stratix/db-redis';

const sessions = new RedisSessionStore(connection, {
  ttl: 3600,
  prefix: 'session:'
});

// Create session
await sessions.set('session-id', { userId: '123', role: 'admin' });

// Get session
const data = await sessions.get('session-id');

// Update session
await sessions.update('session-id', { lastActivity: new Date() });

// Refresh TTL
await sessions.touch('session-id');

// Destroy session
await sessions.destroy('session-id');
```

## Pub/Sub

```typescript
import { RedisPubSub } from '@stratix/db-redis';

const pubsub = new RedisPubSub(publisherConn, subscriberConn);

// Subscribe to channel
await pubsub.subscribe<Notification>('notifications', (msg, channel) => {
  console.log(`Received on ${channel}:`, msg);
});

// Publish message
await pubsub.publish('notifications', {
  type: 'alert',
  text: 'New message',
  timestamp: new Date()
});

// Unsubscribe
await pubsub.unsubscribe('notifications');
```

## Sorted Sets (Leaderboards)

```typescript
import { RedisSortedSet } from '@stratix/db-redis';

const leaderboard = new RedisSortedSet(connection);

// Add scores
await leaderboard.add('game:scores', 100, 'player1');
await leaderboard.add('game:scores', 200, 'player2');

// Get top N
const top10 = await leaderboard.getTopN('game:scores', 10);
// [{ member: 'player2', score: 200 }, { member: 'player1', score: 100 }]

// Get rank
const rank = await leaderboard.getRank('game:scores', 'player1');
// 2

// Increment score
await leaderboard.incrementScore('game:scores', 'player1', 50);
```

## Queues

```typescript
import { RedisQueue } from '@stratix/db-redis';

const queue = new RedisQueue<Job>(connection, 'jobs');

// Producer
await queue.push({ id: '1', task: 'process-payment', data: {...} });

// Consumer (non-blocking)
const job = await queue.pop();
if (job) {
  await processJob(job);
}

// Worker (blocking)
while (true) {
  const job = await queue.blockingPop(30); // 30 second timeout
  if (job) {
    await processJob(job);
  }
}

// Queue size
const size = await queue.size();
```

## Exports

### Core
- `RedisPlugin` - Main plugin class
- `RedisConnection` - Connection wrapper
- `RedisCache` - Caching layer

### Rate Limiting
- `RedisRateLimiter` - Rate limiter
- `RateLimitOptions`, `RateLimitResult` - Types

### Locks
- `RedisLock` - Distributed lock
- `LockOptions` - Lock configuration

### Sessions
- `RedisSessionStore` - Session store
- `SessionData`, `SessionOptions` - Types

### Pub/Sub
- `RedisPubSub` - Pub/sub messaging

### Sorted Sets
- `RedisSortedSet` - Sorted set operations
- `ScoredMember` - Member with score

### Queues
- `RedisQueue<T>` - Type-safe queue

## Services Registered

- `redis:connection` - RedisConnection instance
- `redis:cache` - RedisCache instance
- `redis:client` - Native Redis client

## License

MIT
