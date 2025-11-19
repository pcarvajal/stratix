# DefaultPluginContext

Default implementation of the `PluginContext` interface.

## Overview

`DefaultPluginContext` provides the context passed to plugins during their lifecycle phases. It gives plugins access to the dependency injection container, logger, and configuration.

## Class Definition

```typescript
class DefaultPluginContext implements PluginContext {
  constructor(
    public readonly container: Container,
    public readonly logger: Logger,
    private readonly config: Map<string, unknown>
  );

  getConfig<T = Record<string, unknown>>(): T;
  getService<T>(name: string): T | undefined;
}
```

## Properties

### container

```typescript
readonly container: Container
```

The dependency injection container for service resolution.

**Example:**
```typescript
const context = new DefaultPluginContext(container, logger, config);
console.log(context.container); // Container instance
```

### logger

```typescript
readonly logger: Logger
```

The application logger instance.

**Example:**
```typescript
context.logger.info('Plugin initialized');
```

## Methods

### getConfig()

```typescript
getConfig<T = Record<string, unknown>>(): T
```

Gets the configuration for the current plugin.

**Type Parameters:**
- `T` - The configuration type (default: `Record<string, unknown>`)

**Returns:** The plugin configuration or empty object if not found

**Example:**
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
}

class DatabasePlugin implements Plugin {
  async initialize(context: PluginContext): Promise<void> {
    const config = context.getConfig<DatabaseConfig>();
    console.log(`Connecting to ${config.host}:${config.port}`);
  }
}
```

### getService()

```typescript
getService<T>(name: string): T | undefined
```

Gets a service from the dependency injection container.

**Type Parameters:**
- `T` - The service type

**Parameters:**
- `name` - The service name/token

**Returns:** The service instance or `undefined` if not found

**Example:**
```typescript
class MyPlugin implements Plugin {
  async initialize(context: PluginContext): Promise<void> {
    const logger = context.getService<Logger>('logger');
    if (logger) {
      logger.info('Service found');
    }
  }
}
```

## Usage

### Basic Usage

```typescript
import { DefaultPluginContext } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/di-awilix';
import { ConsoleLogger } from '@stratix/core';

const container = new AwilixContainer();
const logger = new ConsoleLogger();
const config = new Map<string, unknown>();

config.set('database', {
  host: 'localhost',
  port: 5432,
  database: 'mydb',
});

const context = new DefaultPluginContext(container, logger, config);
```

### Plugin Configuration

```typescript
const context = new DefaultPluginContext(container, logger, config);

// Plugin gets its configuration automatically
class DatabasePlugin implements Plugin {
  metadata = {
    name: 'database',
    version: '1.0.0',
  };

  async initialize(context: PluginContext): Promise<void> {
    // Gets config for 'database' plugin
    const config = context.getConfig<DatabaseConfig>();
  }
}
```

### Service Resolution

```typescript
class ApiPlugin implements Plugin {
  async initialize(context: PluginContext): Promise<void> {
    // Get required service
    const db = context.getService<Database>('database');
    if (!db) {
      throw new Error('Database service not found');
    }

    // Get optional service
    const cache = context.getService<Cache>('cache');
    if (cache) {
      console.log('Cache available');
    }
  }
}
```

## Internal Methods

### setCurrentPluginName()

```typescript
setCurrentPluginName(name: string): void
```

Sets the current plugin name. Used internally by `LifecycleManager` to track which plugin is being initialized.

**Note:** This is an internal method marked with `@internal` and should not be called by plugin authors.

## Best Practices

### 1. Type-Safe Configuration

Always provide type parameters for configuration:

```typescript
interface MyConfig {
  apiKey: string;
  timeout: number;
}

const config = context.getConfig<MyConfig>();
// config is typed as MyConfig
```

### 2. Handle Missing Services

Check if services exist before using them:

```typescript
const service = context.getService<MyService>('my-service');
if (!service) {
  throw new Error('Required service not found');
}
```

### 3. Use Logger for Diagnostics

Use the context logger for consistent logging:

```typescript
context.logger.info('Initializing plugin');
context.logger.error('Failed to connect', error);
```

## Type Safety

`DefaultPluginContext` is fully type-safe:

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
}

// Type-safe configuration
const config = context.getConfig<DatabaseConfig>();
config.host; // string
config.port; // number

// Type-safe service resolution
const logger = context.getService<Logger>('logger');
if (logger) {
  logger.info('message'); // Type-safe Logger methods
}
```

## Error Handling

```typescript
class MyPlugin implements Plugin {
  async initialize(context: PluginContext): Promise<void> {
    try {
      const config = context.getConfig<MyConfig>();
      
      // Validate configuration
      if (!config.apiKey) {
        throw new Error('API key is required');
      }

      const service = context.getService<MyService>('my-service');
      if (!service) {
        throw new Error('Required service not found');
      }

      await service.initialize(config);
    } catch (error) {
      context.logger.error('Initialization failed', error);
      throw error;
    }
  }
}
```

## See Also

- [PluginContext Interface](../../abstractions/plugin.md#plugincontext)
- [ApplicationBuilder](./application-builder.md)
- [LifecycleManager](./lifecycle-manager.md)
- [Plugin System](../../abstractions/plugin.md)
