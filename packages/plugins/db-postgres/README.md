# @stratix/db-postgres

PostgreSQL plugin for Stratix applications.

## Installation

```bash
pnpm add @stratix/db-postgres
```

## Features

- Connection pooling with configurable pool size
- Transaction support via Unit of Work pattern
- Health checks with connection pool statistics
- SSL connection support
- Configurable timeouts and connection parameters
- Repository pattern support
- Read replica support (optional)

## Configuration

```typescript
interface PostgresConfig {
  connectionString: string;          // Required: PostgreSQL connection URL
  poolSize?: number;                 // Default: 10
  timeout?: number;                  // Default: 30000 (30s)
  ssl?: boolean;                     // Default: false
  idleTimeoutMillis?: number;        // Default: 10000 (10s)
  readReplicaConnectionString?: string;  // Optional: Read replica URL
}
```

## Quick Example

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { PostgresPlugin } from '@stratix/db-postgres';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin(), {
    connectionString: 'postgres://user:pass@localhost:5432/mydb',
    poolSize: 20,
    ssl: true,
    timeout: 30000
  })
  .build();

await app.start();

// Access the connection
const connection = app.resolve('postgres:connection');
const result = await connection.query('SELECT * FROM users');

// Create a Unit of Work for transactions
const createUnitOfWork = app.resolve('postgres:createUnitOfWork');
const uow = createUnitOfWork();

await uow.begin();
try {
  await uow.execute('INSERT INTO users (name) VALUES ($1)', ['John']);
  await uow.commit();
} catch (error) {
  await uow.rollback();
  throw error;
}
```

## Exports

- `PostgresPlugin` - Main plugin class
- `PostgresConfig` - Configuration interface
- `PostgresConnection` - Connection wrapper class
- `PostgresUnitOfWork` - Transaction management
- `PostgresRepository<T>` - Base repository class
- `DatabaseRow` - Type for database rows

## Services Registered

The plugin registers the following services in the DI container:

- `postgres:connection` - PostgresConnection instance
- `postgres:pool` - Native pg.Pool instance
- `postgres:createUnitOfWork` - Factory for creating UnitOfWork instances

## License

MIT
