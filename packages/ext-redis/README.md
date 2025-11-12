# @stratix/ext-redis

Redis plugin for Stratix applications.

## Installation

```bash
pnpm add @stratix/ext-redis
```

## Features

- Connection pooling
- Health checks
- Automatic reconnection
- Full Redis commands support

## Quick Example

```typescript
import { RedisPlugin } from '@stratix/ext-redis';

const app = await ApplicationBuilder.create()
  .usePlugin(new RedisPlugin({
    host: 'localhost',
    port: 6379
  }))
  .build();

await app.start();
```

## License

MIT
