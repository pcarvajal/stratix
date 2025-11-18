---
id: application-builder
title: ApplicationBuilder
sidebar_label: ApplicationBuilder
---

# ApplicationBuilder

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.0

## Overview

Fluent API for building Stratix applications. Provides declarative configuration of container, logger, plugins, and bounded contexts. Handles dependency resolution and lifecycle management automatically.

**Key Features:**
- Fluent builder pattern
- Plugin registration and configuration
- Domain modules
- Automatic dependency resolution
- Lifecycle management
- Type-safe configuration

## Import

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
```

## Type Signature

```typescript
class ApplicationBuilder {
  static create(): ApplicationBuilder;
  
  useContainer(container: Container): this;
  useLogger(logger: Logger): this;
  usePlugin(plugin: Plugin, config?: unknown): this;
  usePlugins(plugins: Plugin[]): this;
  useContext(contextModule: ContextModule): this;
  
  build(): Promise<Application>;
}
```

## Usage Examples

### Basic Application

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  .usePlugin(new DatabasePlugin())
  .usePlugin(new EventBusPlugin())
  .build();

await app.start();
// Application running...
await app.stop();
```

### With Plugin Configuration

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new PostgresPlugin(), {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'secret'
  })
  .usePlugin(new RedisPlugin(), {
    host: 'localhost',
    port: 6379
  })
  .build();
```

### With Domain Modules

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  // Infrastructure
  .usePlugin(new PostgresPlugin())
  .usePlugin(new RabbitMQPlugin())
  // Domain Modules
  .useContext(new ProductsContextModule())
  .useContext(new OrdersContextModule())
  .useContext(new CustomersContextModule())
  .build();

await app.start();
```

### Microservice Configuration

```typescript
// Orders microservice
const ordersService = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQPlugin())
  .useContext(new OrdersContextModule()) // Only orders module
  .build();

// Products microservice
const productsService = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new PostgresPlugin({ database: 'products' }))
  .usePlugin(new RabbitMQPlugin())
  .useContext(new ProductsContextModule()) // Only products module
  .build();
```

### Full Stack Application

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  
  // Infrastructure plugins
  .usePlugin(new PostgresPlugin(dbConfig))
  .usePlugin(new RedisPlugin(redisConfig))
  .usePlugin(new RabbitMQPlugin(mqConfig))
  
  // CQRS
  .usePlugin(new CQRSPlugin())
  
  // HTTP API
  .usePlugin(new FastifyHTTPPlugin({
    port: 3000,
    cors: { origin: true }
  }))
  
  // Auth & Validation
  .usePlugin(new AuthPlugin(authConfig))
  .usePlugin(new ValidationPlugin())
  
  // Domain Modules
  .useContext(new UsersContextModule())
  .useContext(new ProductsContextModule())
  .useContext(new OrdersContextModule())
  
  .build();

await app.start();
console.log('Application started on port 3000');
```

## Builder Methods

### create()

Creates a new ApplicationBuilder instance.

```typescript
const builder = ApplicationBuilder.create();
```

### useContainer()

Sets the dependency injection container.

**Required:** Must be called before build()

```typescript
builder.useContainer(new AwilixContainer());
```

### useLogger()

Sets the logger instance.

**Required:** Must be called before build()

```typescript
builder.useLogger(new ConsoleLogger());
```

### usePlugin()

Registers a plugin with optional configuration.

```typescript
builder.usePlugin(new DatabasePlugin(), { host: 'localhost' });
```

### usePlugins()

Registers multiple plugins at once.

```typescript
builder.usePlugins([
  new LoggerPlugin(),
  new DatabasePlugin(),
  new CachePlugin()
]);
```

### useContext()

Registers a domain module.

```typescript
builder.useContext(new OrdersContextModule());
```

### build()

Builds and returns the Application instance.

**Returns:** `Promise<Application>`

```typescript
const app = await builder.build();
```

## Build Process

When `build()` is called:

1. **Validate**: Checks container and logger are set
2. **Resolve Dependencies**: Uses DependencyGraph to sort plugins
3. **Initialize Plugins**: Calls initialize() in dependency order
4. **Register Contexts**: Registers CQRS handlers from contexts
5. **Create Application**: Returns configured Application instance

## Best Practices

- **Do:** Register infrastructure plugins before domain modules
- **Do:** Use plugin configs for environment-specific settings
- **Do:** Keep builder chain readable (one plugin/module per line)
- **Do:** Register dependencies before dependents
- **Don't:** Call build() multiple times on same builder
- **Don't:** Forget to set container and logger

## Error Handling

```typescript
try {
  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .usePlugin(new DatabasePlugin())
    .build();
} catch (error) {
  if (error instanceof CircularDependencyError) {
    console.error('Circular dependency:', error.cycle);
  } else if (error instanceof MissingDependencyError) {
    console.error('Missing dependency:', error.missing);
  }
}
```

## Related Components

- [Application](./application.md) - Built application instance
- [LifecycleManager](./lifecycle-manager.md) - Plugin lifecycle
- [DependencyGraph](./dependency-graph.md) - Dependency resolution
- [BaseContextModule](./base-context-module.md) - Base class for domain modules

## See Also

- [Plugin](../abstractions/plugin.md) - Plugin interface
- [ContextModule](../abstractions/context-module.md) - Module interface
