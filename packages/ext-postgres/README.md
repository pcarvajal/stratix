# @stratix/ext-postgres

PostgreSQL plugin for Stratix applications.

## Installation

```bash
pnpm add @stratix/ext-postgres
```

## Features

- Connection pooling
- Transaction support
- Health checks
- Migration support (via external tools)

## Quick Example

```typescript
import { PostgresPlugin } from '@stratix/ext-postgres';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({
    host: 'localhost',
    port: 5432,
    database: 'mydb'
  }))
  .build();

await app.start();
```

## License

MIT
