# @stratix/ext-mongodb

MongoDB plugin for Stratix applications.

## Installation

```bash
pnpm add @stratix/ext-mongodb
```

## Features

- Connection pooling
- Health checks
- Full MongoDB driver support
- Automatic reconnection

## Quick Example

```typescript
import { MongoDBPlugin } from '@stratix/ext-mongodb';

const app = await ApplicationBuilder.create()
  .usePlugin(new MongoDBPlugin({
    uri: 'mongodb://localhost:27017/mydb'
  }))
  .build();

await app.start();
```

## License

MIT
