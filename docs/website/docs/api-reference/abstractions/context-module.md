---
id: context-module
title: ContextModule
sidebar_label: ContextModule
---

# ContextModule

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.3

## Overview

Interface for domain modules. ContextModule represents a complete domain module that encapsulates commands, queries, events, and repositories.

**Key Features:**
- Domain logic encapsulation
- Auto-registration of CQRS components
- Repository registration
- Portable between monolith and microservices
- Optional (manual registration still works)

## Import

```typescript
import type { ContextModule } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface ContextModule {
  readonly metadata: ModuleMetadata;
  readonly contextName: string;
  
  getCommands?(): CommandDefinition[];
  getQueries?(): QueryDefinition[];
  getEventHandlers?(): EventHandlerDefinition[];
  getRepositories?(): RepositoryDefinition[];
  
  initialize?(context: ModuleContext): Promise<void>;
  start?(): Promise<void>;
  stop?(): Promise<void>;
  healthCheck?(): Promise<HealthCheckResult>;
}
```

## Properties

### metadata

Module metadata including name, version, and dependencies.

```typescript
readonly metadata: ModuleMetadata;
```

**Type:** `ModuleMetadata`

**Example:**
```typescript
readonly metadata: ModuleMetadata = {
  name: 'products-context',
  version: '1.0.0',
  description: 'Products domain module',
  requiredPlugins: ['postgres'],
  requiredModules: []
};
```

### contextName

Human-readable name of the domain module.

```typescript
readonly contextName: string;
```

**Example:**
```typescript
readonly contextName = 'Products';
```

## Methods

### getCommands()

Returns command definitions for this module.

```typescript
getCommands?(): CommandDefinition[];
```

**Returns:** Array of command definitions (empty by default)

**Example:**
```typescript
getCommands() {
  return [
    {
      name: 'CreateProduct',
      commandType: CreateProductCommand,
      handler: new CreateProductHandler(this.productRepo)
    }
  ];
}
```

### getQueries()

Returns query definitions for this module.

```typescript
getQueries?(): QueryDefinition[];
```

**Returns:** Array of query definitions (empty by default)

### getEventHandlers()

Returns event handler definitions for this module.

```typescript
getEventHandlers?(): EventHandlerDefinition[];
```

**Returns:** Array of event handler definitions (empty by default)

### getRepositories()

Returns repository definitions for this module.

```typescript
getRepositories?(): RepositoryDefinition[];
```

**Returns:** Array of repository definitions (empty by default)

**Example:**
```typescript
getRepositories() {
  return [
    {
      token: 'productRepository',
      instance: new InMemoryProductRepository(),
      singleton: true
    }
  ];
}
```

## Usage Example

```typescript
import { BaseContextModule } from '@stratix/runtime';
import type { ModuleMetadata, ModuleContext, CommandDefinition } from '@stratix/abstractions';

export class ProductsModule extends BaseContextModule {
  readonly metadata: ModuleMetadata = {
    name: 'products-context',
    version: '1.0.0',
    requiredPlugins: ['postgres'],
    requiredModules: []
  };

  readonly contextName = 'Products';

  private productRepo!: ProductRepository;

  getRepositories(): RepositoryDefinition[] {
    return [
      {
        token: 'productRepository',
        instance: new InMemoryProductRepository(),
        singleton: true
      }
    ];
  }

  getCommands(): CommandDefinition[] {
    // Repositories are registered first, resolve lazily
    const repo = this.productRepo || this.context?.container.resolve('productRepository');
    
    return [
      {
        name: 'CreateProduct',
        commandType: CreateProductCommand,
        handler: new CreateProductHandler(repo!)
      }
    ];
  }

  getQueries(): QueryDefinition[] {
    const repo = this.productRepo || this.context?.container.resolve('productRepository');
    
    return [
      {
        name: 'GetProductById',
        queryType: GetProductByIdQuery,
        handler: new GetProductByIdHandler(repo!)
      }
    ];
  }

  async initialize(context: ModuleContext): Promise<void> {
    // Call super first to register repositories and CQRS components
    await super.initialize(context);
    
    // Then resolve for future use
    this.productRepo = context.container.resolve('productRepository');
  }
}
```

## Module vs Plugin

| Aspect | Plugin | Module |
|--------|--------|--------|
| Purpose | Infrastructure | Domain logic |
| Examples | Postgres, Redis, RabbitMQ | Products, Orders, Inventory |
| Dependencies | Other plugins | Plugins + other modules |
| Context Type | `PluginContext` | `ModuleContext` |
| Metadata Type | `PluginMetadata` | `ModuleMetadata` |
| Initialization | First | Second |

## See Also

- [BaseContextModule](../runtime/base-context-module.md) - Base implementation
- [ModuleContext](./module-context.md) - Module initialization context
- [Plugin](./plugin.md) - Plugin interface for infrastructure
