# @stratix/di-awilix

Powerful dependency injection container for Stratix using Awilix.

## Installation

```bash
pnpm add @stratix/di-awilix
```

## Features

- Three service lifetimes: singleton, scoped, and transient
- Factory functions and class registration
- Scoped containers for request/session isolation
- Automatic disposal of resources
- Type-safe service resolution
- Convenience API for common scenarios
- Direct Awilix API access for advanced use cases

## Quick Example

```typescript
import { AwilixContainer } from '@stratix/di-awilix';
import { ServiceLifetime } from '@stratix/core';

const container = new AwilixContainer();

// Register a singleton service
container.register('logger', () => new ConsoleLogger(), {
  lifetime: ServiceLifetime.SINGLETON
});

// Resolve services
const logger = container.resolve('logger');
```

## Service Lifetimes

### Singleton

Created once and shared across all resolutions.

```typescript
container.register('config', () => new AppConfig(), {
  lifetime: ServiceLifetime.SINGLETON
});

// Or using convenience method
container.singleton('config', new AppConfig());
```

### Scoped

Created once per scope (e.g., per HTTP request).

```typescript
container.register('requestId', () => crypto.randomUUID(), {
  lifetime: ServiceLifetime.SCOPED
});

// Or using convenience method
container.scoped('requestId', () => crypto.randomUUID());
```

### Transient

Created every time it's resolved.

```typescript
container.register('timestamp', () => new Date(), {
  lifetime: ServiceLifetime.TRANSIENT
});

// Or using convenience method
container.transient('timestamp', () => new Date());
```

## Convenience API

### Singleton Registration

```typescript
// Register a value
container.singleton('apiKey', process.env.API_KEY);

// Register a factory
container.singleton('database', () => new Database());
```

### Class Registration

```typescript
class UserService {
  constructor(private database: Database) {}
}

// Auto-wire constructor dependencies
container.registerClass(UserService, {
  token: 'userService',
  lifetime: ServiceLifetime.SINGLETON
});
```

### Batch Registration

```typescript
container.registerAll({
  logger: ConsoleLogger,
  database: () => new Database(),
  config: appConfig,
});
```

### Safe Resolution

```typescript
// Returns undefined if not found
const service = container.tryResolve('optionalService');

if (service) {
  // Use service
}
```

## Scoped Containers

Create isolated scopes for request-specific services:

```typescript
// Register a scoped service
container.scoped('userId', () => extractUserId());

// Create a scope per request
app.use(async (req, res, next) => {
  const scope = container.createScope();

  try {
    const userId = scope.resolve('userId');
    // Process request
  } finally {
    await scope.dispose();
  }
});
```

## Dependency Injection

```typescript
class OrderService {
  constructor(
    private database: Database,
    private logger: Logger,
    private eventBus: EventBus
  ) {}
}

// Register dependencies
container.singleton('database', () => new Database());
container.singleton('logger', () => new ConsoleLogger());
container.singleton('eventBus', () => new InMemoryEventBus());

// Register service with factory that resolves dependencies
container.registerClass(OrderService, {
  token: 'orderService'
});

// Resolve fully wired service
const orderService = container.resolve<OrderService>('orderService');
```

## Advanced Usage

### Direct Awilix API

For advanced scenarios, access Awilix directly:

```typescript
import * as awilix from 'awilix';

container.registerAwilix({
  userService: awilix.asClass(UserService)
    .singleton()
    .inject(() => ({ customDep: 'value' }))
});
```

### Resource Disposal

Services with a `dispose()` method are automatically cleaned up:

```typescript
class DatabaseConnection {
  async dispose() {
    await this.client.close();
  }
}

container.singleton('db', () => new DatabaseConnection());

// Later
await container.dispose(); // Calls dispose() on all services
```

## Integration with Stratix

The AwilixContainer implements the `Container` interface from `@stratix/core`:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/di-awilix';

const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(logger)
  .build();
```

## API Reference

### Container Methods

- `register<T>(token, factory, options?)` - Register a service
- `resolve<T>(token)` - Resolve a service
- `has<T>(token)` - Check if service is registered
- `createScope()` - Create a new scoped container
- `dispose()` - Dispose container and all services

### Convenience Methods

- `singleton<T>(token, value | factory)` - Register singleton
- `scoped<T>(token, factory)` - Register scoped service
- `transient<T>(token, factory)` - Register transient service
- `registerClass<T>(classType, options?)` - Register class with auto-wiring
- `registerAll(services)` - Register multiple services
- `tryResolve<T>(token)` - Safely resolve service

### Advanced Methods

- `registerAwilix(registrations)` - Use native Awilix API
- `getAwilixContainer()` - Access internal Awilix container

## License

MIT
