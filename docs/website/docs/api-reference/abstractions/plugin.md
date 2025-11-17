---
id: plugin
title: Plugin
sidebar_label: Plugin
---

# Plugin

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Plugin interface for extending Stratix applications. Plugins follow a lifecycle (initialize → start → stop) and can declare dependencies on other plugins. Foundation for modular, extensible architecture.

**Key Features:**
- Lifecycle management (initialize, start, stop)
- Dependency declaration and resolution
- Service registration in DI container
- Health check support
- Metadata (name, version, description)

## Import

```typescript
import type { Plugin, PluginMetadata, PluginContext } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface Plugin {
  readonly metadata: PluginMetadata;
  initialize?(context: PluginContext): Promise<void>;
  start?(): Promise<void>;
  stop?(): Promise<void>;
  healthCheck?(): Promise<HealthCheckResult>;
}

interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
}
```

## Usage Examples

### Basic Plugin

```typescript
class DatabasePlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'database',
    version: '1.0.0',
    description: 'PostgreSQL database connection',
    dependencies: ['logger']
  };

  private database?: Database;
  private logger?: Logger;

  async initialize(context: PluginContext): Promise<void> {
    this.logger = context.container.resolve<Logger>('logger');
    
    const config = context.getConfig<DatabaseConfig>();
    this.database = new Database(config);

    context.container.register('database', () => this.database!, {
      lifetime: ServiceLifetime.SINGLETON
    });

    this.logger.info('Database plugin initialized');
  }

  async start(): Promise<void> {
    await this.database!.connect();
    this.logger!.info('Database connected');
  }

  async stop(): Promise<void> {
    await this.database!.disconnect();
    this.logger!.info('Database disconnected');
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      await this.database!.ping();
      return { status: HealthStatus.UP };
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: error.message
      };
    }
  }
}
```

### Plugin with Dependencies

```typescript
class CQRSPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'cqrs',
    version: '1.0.0',
    description: 'CQRS command and query buses',
    dependencies: ['logger', 'eventBus']
  };

  async initialize(context: PluginContext): Promise<void> {
    const logger = context.container.resolve<Logger>('logger');
    const eventBus = context.container.resolve<EventBus>('eventBus');

    const commandBus = new InMemoryCommandBus(logger);
    const queryBus = new InMemoryQueryBus(logger);

    context.container.register('commandBus', () => commandBus);
    context.container.register('queryBus', () => queryBus);
  }
}
```

### Using Plugins

```typescript
const app = await ApplicationBuilder.create()
  .usePlugin(new LoggerPlugin())
  .usePlugin(new DatabasePlugin())
  .usePlugin(new CQRSPlugin())
  .build();

await app.start();

// Health checks
const dbHealth = await app.healthCheck('database');
console.log(dbHealth.status); // UP or DOWN

await app.stop();
```

## Best Practices

- **Do:** Declare dependencies explicitly
- **Do:** Register services in initialize()
- **Do:** Connect resources in start()
- **Do:** Clean up in stop()
- **Do:** Implement health checks
- **Don't:** Start resources in initialize()
- **Don't:** Forget to handle errors in health checks

## Related Components

- [ApplicationBuilder](../layer-3-runtime/application-builder.md) - Uses plugins
- [PluginContext](../layer-3-runtime/plugin-context.md) - Plugin initialization context

## See Also

- [Package README](../../../packages/abstractions/README.md)
