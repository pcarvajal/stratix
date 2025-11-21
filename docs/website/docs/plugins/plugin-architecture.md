---
sidebar_position: 1
title: Plugin Architecture
description: Understanding Stratix's plugin system
---

# Plugin Architecture

Stratix uses a **plugin-based architecture** for extensibility and modularity.

## Why Plugins?

- ✅ **Modularity** - Add only what you need
- ✅ **Extensibility** - Create custom plugins
- ✅ **Dependency Management** - Automatic plugin ordering
- ✅ **Lifecycle Management** - Initialize, start, stop hooks
- ✅ **Type Safety** - Strongly typed plugin contracts

## Plugin Interface

```typescript
import { Plugin, PluginContext } from '@stratix/core';

export interface Plugin {
  readonly metadata: PluginMetadata;
  
  initialize?(context: PluginContext): Promise<void>;
  start?(context: PluginContext): Promise<void>;
  stop?(): Promise<void>;
  healthCheck?(): Promise<HealthCheckResult>;
}
```

## Plugin Metadata

```typescript
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  optionalDependencies?: string[];
}
```

## Basic Plugin Example

```typescript
import { Plugin, PluginContext } from '@stratix/core';

export class MyPlugin implements Plugin {
  readonly metadata = {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My custom plugin'
  };

  async initialize(context: PluginContext): Promise<void> {
    console.log('Plugin initializing...');
    
    // Register services in container
    context.container.register('myService', () => new MyService());
  }

  async start(context: PluginContext): Promise<void> {
    console.log('Plugin starting...');
  }

  async stop(): Promise<void> {
    console.log('Plugin stopping...');
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: 'healthy',
      details: { uptime: process.uptime() }
    };
  }
}
```

## Plugin Lifecycle

```mermaid
graph LR
    A[Register] --> B[Initialize]
    B --> C[Start]
    C --> D[Running]
    D --> E[Stop]
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style E fill:#F44336
```

### 1. Register

```typescript
const app = await ApplicationBuilder.create()
  .usePlugin(new MyPlugin())
  .build();
```

### 2. Initialize

Called once during application startup:

```typescript
async initialize(context: PluginContext): Promise<void> {
  // Register services
  context.container.register('service', () => new Service());
  
  // Load configuration
  const config = context.getConfig<MyConfig>();
  
  // Set up resources
  this.connection = await createConnection(config);
}
```

### 3. Start

Called after all plugins are initialized:

```typescript
async start(context: PluginContext): Promise<void> {
  // Start servers
  await this.server.listen(3000);
  
  // Subscribe to events
  context.eventBus.subscribe('user.created', this.handleUserCreated);
}
```

### 4. Stop

Called during graceful shutdown:

```typescript
async stop(): Promise<void> {
  // Close connections
  await this.connection.close();
  
  // Stop servers
  await this.server.close();
}
```

## Plugin Dependencies

Plugins can depend on other plugins:

```typescript
export class DatabasePlugin implements Plugin {
  readonly metadata = {
    name: 'database',
    version: '1.0.0',
    dependencies: ['logger'] // Requires logger plugin
  };
}

export class CachePlugin implements Plugin {
  readonly metadata = {
    name: 'cache',
    version: '1.0.0',
    dependencies: ['database'], // Requires database plugin
    optionalDependencies: ['logger'] // Optional logger
  };
}
```

**Initialization order:**
1. `logger` (no dependencies)
2. `database` (depends on logger)
3. `cache` (depends on database)

## Plugin Context

The `PluginContext` provides access to:

```typescript
interface PluginContext {
  container: Container;
  logger: Logger;
  eventBus: EventBus;
  getConfig<T>(): T;
}
```

### Container

Register and resolve services:

```typescript
async initialize(context: PluginContext): Promise<void> {
  context.container.register('database', () => new Database());
  
  const db = context.container.resolve('database');
}
```

### Logger

Log messages:

```typescript
async start(context: PluginContext): Promise<void> {
  context.logger.info('Plugin started');
  context.logger.error('Error occurred', error);
}
```

### Event Bus

Publish and subscribe to events:

```typescript
async start(context: PluginContext): Promise<void> {
  context.eventBus.subscribe('user.created', async (event) => {
    context.logger.info('User created', event);
  });
}
```

### Configuration

Get plugin configuration:

```typescript
async initialize(context: PluginContext): Promise<void> {
  const config = context.getConfig<DatabaseConfig>();
  this.connection = await connect(config);
}
```

## Real-World Example: HTTP Plugin

```typescript
import { Plugin, PluginContext } from '@stratix/core';
import Fastify, { FastifyInstance } from 'fastify';

export interface HTTPPluginConfig {
  port: number;
  host?: string;
}

export class HTTPPlugin implements Plugin {
  readonly metadata = {
    name: 'http',
    version: '1.0.0',
    description: 'HTTP server plugin',
    dependencies: ['logger']
  };

  private server?: FastifyInstance;

  async initialize(context: PluginContext): Promise<void> {
    const config = context.getConfig<HTTPPluginConfig>();
    
    this.server = Fastify({
      logger: false // Use Stratix logger instead
    });

    // Register routes
    this.server.get('/health', async () => ({
      status: 'healthy'
    }));

    context.logger.info('HTTP plugin initialized');
  }

  async start(context: PluginContext): Promise<void> {
    const config = context.getConfig<HTTPPluginConfig>();
    
    await this.server!.listen({
      port: config.port,
      host: config.host || '0.0.0.0'
    });

    context.logger.info(`HTTP server listening on port ${config.port}`);
  }

  async stop(): Promise<void> {
    await this.server?.close();
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: this.server ? 'healthy' : 'unhealthy',
      details: {
        port: this.server?.server.address()
      }
    };
  }
}
```

## Best Practices

### 1. Clear Metadata

```typescript
readonly metadata = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'What this plugin does'
};
```

### 2. Declare Dependencies

```typescript
readonly metadata = {
  name: 'cache',
  dependencies: ['database'],
  optionalDependencies: ['logger']
};
```

### 3. Graceful Shutdown

```typescript
async stop(): Promise<void> {
  await this.connection?.close();
  await this.server?.close();
}
```

### 4. Health Checks

```typescript
async healthCheck(): Promise<HealthCheckResult> {
  try {
    await this.connection.ping();
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

## Next Steps

- **[Creating Plugins](./creating-plugins)** - Build your own
- **[Official Plugins](./official-plugins)** - Available plugins
- **[Plugin Configuration](./plugin-configuration)** - Configuration guide
