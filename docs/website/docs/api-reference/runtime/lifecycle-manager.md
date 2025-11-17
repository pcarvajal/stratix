---
id: lifecycle-manager
title: LifecycleManager
sidebar_label: LifecycleManager
---

# LifecycleManager

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.0

## Overview

Manages plugin lifecycle phases: initialize → start → stop. Ensures plugins execute lifecycle methods in correct dependency order and tracks phase transitions.

## Type Signature

```typescript
enum LifecyclePhase {
  UNINITIALIZED, INITIALIZING, INITIALIZED,
  STARTING, STARTED, STOPPING, STOPPED
}

class LifecycleManager {
  constructor(registry: PluginRegistry);
  
  initializeAll(context: PluginContext): Promise<void>;
  startAll(): Promise<void>;
  stopAll(): Promise<void>;
  
  get currentPhase(): LifecyclePhase;
  getPluginPhase(pluginName: string): LifecyclePhase;
}
```

## Usage

```typescript
const manager = new LifecycleManager(registry);

// Initialize plugins
await manager.initializeAll(context);
console.log(manager.currentPhase); // INITIALIZED

// Start plugins
await manager.startAll();
console.log(manager.currentPhase); // STARTED

// Stop plugins (reverse order)
await manager.stopAll();
console.log(manager.currentPhase); // STOPPED
```

## Lifecycle Flow

1. **INITIALIZING**: Plugins register services in DI container
2. **INITIALIZED**: All plugins registered, ready to start
3. **STARTING**: Plugins connect to external resources
4. **STARTED**: Application fully operational
5. **STOPPING**: Plugins disconnecting (reverse order)
6. **STOPPED**: All plugins stopped gracefully

## See Also

- [ApplicationBuilder](./application-builder.md)
- [Package README](../../../packages/runtime/README.md)
