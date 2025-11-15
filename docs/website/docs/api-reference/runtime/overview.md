# @stratix/runtime

Plugin system and application builder for Stratix.

## Installation

```bash
pnpm add @stratix/runtime
```

## What's Included

- **ApplicationBuilder** - Fluent API to configure your application
- **Application** - Main application class with lifecycle management
- **PluginRegistry** - Plugin registration and dependency resolution
- **LifecycleManager** - Plugin lifecycle management (initialize, start, stop)
- **DependencyGraph** - Automatic plugin ordering based on dependencies
- **DefaultPluginContext** - Context passed to plugins during initialization
- **Error Types** - Specialized errors for runtime operations

## Core Features

### Application Builder

Fluent API for configuring and building Stratix applications:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  .usePlugin(new DatabasePlugin())
  .usePlugin(new CachePlugin(), { ttl: 3600 })
  .build();

await app.start();
```

### Plugin Lifecycle

Plugins follow a three-phase lifecycle:

1. **Initialize** - Configure and register services
2. **Start** - Connect to external resources
3. **Stop** - Gracefully shutdown in reverse order

```typescript
import type { Plugin, PluginContext } from '@stratix/abstractions';

class DatabasePlugin implements Plugin {
  readonly metadata = {
    name: 'database',
    version: '1.0.0',
    dependencies: ['logger']
  };

  async initialize(context: PluginContext): Promise<void> {
    const config = context.getConfig();
    context.container.register('database', () => new Database(config));
  }

  async start(): Promise<void> {
    // Connect to database
  }

  async stop(): Promise<void> {
    // Disconnect from database
  }

  async healthCheck(): Promise<HealthCheckResult> {
    // Check database connection
  }
}
```

### Dependency Resolution

Plugins are automatically initialized in dependency order:

```typescript
// Even though registered out of order, plugins initialize correctly
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(apiPlugin)        // depends on database
  .usePlugin(databasePlugin)   // depends on logger
  .usePlugin(loggerPlugin)     // no dependencies
  .build();

// Initialization order: logger → database → api
```

### Health Checks

Built-in health monitoring for all plugins:

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new DatabasePlugin())
  .usePlugin(new CachePlugin())
  .build();

await app.start();

// Check overall application health
const health = await app.healthCheck();
console.log(health.status);  // UP, DEGRADED, or DOWN
console.log(health.details); // Individual plugin health status
```

### Plugin Configuration

Configure plugins before or after registration:

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(databasePlugin, { host: 'localhost', port: 5432 })
  .configurePlugin('cache', { ttl: 3600 })
  .build();
```

### Multiple Plugin Registration

Register multiple plugins at once:

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugins([
    new LoggerPlugin(),
    new DatabasePlugin(),
    new CachePlugin(),
    new ApiPlugin()
  ])
  .build();
```

## API Reference

### ApplicationBuilder

- `create()` - Creates a new ApplicationBuilder instance
- `useContainer(container)` - Sets the DI container (required)
- `useLogger(logger)` - Sets the logger (required)
- `usePlugin(plugin, config?)` - Registers a plugin with optional configuration
- `usePlugins(plugins)` - Registers multiple plugins
- `configurePlugin(name, config)` - Sets configuration for a plugin
- `build()` - Builds and initializes the application
- `pluginCount` - Returns the number of registered plugins

### Application

- `start()` - Starts all plugins in dependency order
- `stop()` - Stops all plugins in reverse dependency order
- `resolve<T>(token)` - Resolves a service from the DI container
- `getContainer()` - Gets the DI container
- `getPlugins()` - Gets all registered plugins
- `getPlugin(name)` - Gets a plugin by name
- `getLifecyclePhase()` - Gets the current lifecycle phase
- `healthCheck()` - Performs health checks on all plugins

### LifecyclePhase

Lifecycle phases enum:

- `UNINITIALIZED` - Before initialization
- `INITIALIZING` - During initialization
- `INITIALIZED` - After initialization, before start
- `STARTING` - During start
- `STARTED` - Running
- `STOPPING` - During shutdown
- `STOPPED` - After shutdown

### Error Types

- `RuntimeError` - Base error class
- `CircularDependencyError` - Circular dependency detected
- `MissingDependencyError` - Plugin dependency not found
- `DuplicatePluginError` - Plugin name already registered
- `PluginLifecycleError` - Plugin lifecycle method failed

## Example: Complete Application

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

// Build application
const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  .usePlugin(new PostgresPlugin(), {
    host: 'localhost',
    port: 5432,
    database: 'myapp'
  })
  .usePlugin(new RedisPlugin(), {
    host: 'localhost',
    port: 6379
  })
  .build();

// Start application
await app.start();

// Application is running
console.log('Phase:', app.getLifecyclePhase()); // STARTED

// Check health
const health = await app.healthCheck();
console.log('Health:', health.status);

// Access services via DI container
const database = app.resolve('database');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await app.stop();
  process.exit(0);
});
```

## See Also

- [Getting Started](../../getting-started/quick-start.md)
- [Core Concepts](../../core-concepts/architecture.md)
