---
id: plugin-context
title: PluginContext
sidebar_label: PluginContext
---

# PluginContext

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.0

## Overview

Context passed to plugins during initialization. Provides access to DI container, logger, and plugin-specific configuration.

## Type Signature

```typescript
interface PluginContext {
  container: Container;
  logger: Logger;
  getConfig<T = unknown>(): T | undefined;
  getPlugin(name: string): Plugin | undefined;
}
```

## Usage

```typescript
class DatabasePlugin implements Plugin {
  async initialize(context: PluginContext): Promise<void> {
    // Access logger
    const logger = context.logger;
    logger.info('Initializing database plugin');

    // Get plugin config
    const config = context.getConfig<DatabaseConfig>();
    const database = new Database(config);

    // Register in container
    context.container.register('database', () => database, {
      lifetime: ServiceLifetime.SINGLETON
    });

    // Access other plugins
    const cachePlugin = context.getPlugin('cache');
  }
}
```

## See Also

- [Plugin](../../layer-2-abstractions/plugin.md)
- [Package README](../../../packages/runtime/README.md)
