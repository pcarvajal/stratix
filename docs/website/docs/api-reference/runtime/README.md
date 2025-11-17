---
id: runtime-overview
title: Runtime Overview
sidebar_label: Overview
---

# Layer 3 - Runtime

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.0

## Overview

Application bootstrap and plugin lifecycle management. Provides ApplicationBuilder for declarative app configuration and manages plugin initialization, startup, and shutdown.

## Core Components

### [ApplicationBuilder](./application-builder.md)
Fluent API for building applications with plugins and contexts.

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new DatabasePlugin())
  .useContext(new OrdersContextModule())
  .build();
```

### [Application](./application.md)
Running application instance with lifecycle and health checks.

```typescript
await app.start();
const health = await app.healthCheck('database');
await app.stop();
```

### [LifecycleManager](./lifecycle-manager.md)
Manages plugin lifecycle phases in dependency order.

### [DependencyGraph](./dependency-graph.md)
Topological sort for plugin dependencies.

### [PluginRegistry](./plugin-registry.md)
Registry for managing plugins and their dependencies.

### [BaseContextPlugin](./base-context-plugin.md)
Base implementation for bounded context plugins.

### [PluginContext](./plugin-context.md)
Context interface provided to plugins during initialization.

### [DefaultPluginContext](./default-plugin-context.md)
Default implementation of PluginContext.

### [RuntimeError](./runtime-error.md)
Error classes for runtime failures (circular dependencies, missing dependencies, etc.).

## Quick Start

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  .usePlugin(new PostgresPlugin())
  .usePlugin(new RabbitMQPlugin())
  .useContext(new ProductsContext())
  .useContext(new OrdersContext())
  .build();

await app.start();
console.log('Application running');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await app.stop();
  process.exit(0);
});
```

## Architecture

```
ApplicationBuilder
  ├─ validates configuration
  ├─ builds DependencyGraph
  ├─ creates LifecycleManager
  └─ returns Application

Application.start()
  ├─ LifecycleManager.initializeAll()
  │   └─ plugins initialized in dependency order
  └─ LifecycleManager.startAll()
      └─ plugins started in dependency order

Application.stop()
  └─ LifecycleManager.stopAll()
      └─ plugins stopped in reverse order
```

## Benefits

- **Declarative**: Configure with fluent API
- **Automatic**: Dependency resolution and ordering
- **Safe**: Lifecycle phases prevent errors
- **Portable**: Same config for monolith or microservice
- **Observable**: Health checks and status

## See Also

- [Package README](../../../packages/runtime/README.md)
- [Plugin System](../../layer-2-abstractions/plugin.md)

