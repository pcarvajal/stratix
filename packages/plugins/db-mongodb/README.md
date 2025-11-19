# @stratix/db-mongodb

MongoDB plugin for Stratix applications.

## Installation

```bash
pnpm add @stratix/db-mongodb
```

## Features

- Connection pooling with configurable pool size
- Transaction support on replica sets
- Health checks with database ping
- Repository pattern support
- Full MongoDB driver support
- Automatic reconnection
- Configurable server selection timeout

## Configuration

```typescript
interface MongoConfig {
  connectionString: string;         // Required: MongoDB connection URL
  database: string;                 // Required: Database name
  maxPoolSize?: number;             // Default: 10
  serverSelectionTimeoutMS?: number; // Default: 30000 (30s)
  options?: MongoClientOptions;     // Additional MongoDB options
}
```

## Quick Example

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { MongoPlugin } from '@stratix/db-mongodb';

const app = await ApplicationBuilder.create()
  .usePlugin(new MongoPlugin(), {
    connectionString: 'mongodb://localhost:27017',
    database: 'mydb',
    maxPoolSize: 20
  })
  .build();

await app.start();

// Access the connection
const connection = app.resolve('mongo:connection');
const usersCollection = connection.collection('users');
await usersCollection.insertOne({ name: 'John Doe' });

// Create a Unit of Work for transactions (requires replica set)
const createUnitOfWork = app.resolve('mongo:createUnitOfWork');
const uow = createUnitOfWork();

await uow.begin();
try {
  const users = uow.collection('users');
  await users.insertOne({ name: 'Jane Doe' });
  await uow.commit();
} catch (error) {
  await uow.rollback();
  throw error;
}
```

## Exports

- `MongoPlugin` - Main plugin class
- `MongoConfig` - Configuration interface
- `MongoConnection` - Connection wrapper class
- `MongoUnitOfWork` - Transaction management
- `MongoRepository<T>` - Base repository class
- `MongoDocument` - Type for MongoDB documents

## Services Registered

The plugin registers the following services in the DI container:

- `mongo:connection` - MongoConnection instance
- `mongo:client` - Native MongoClient instance
- `mongo:createUnitOfWork` - Factory for creating UnitOfWork instances

## License

MIT
