---
id: base-context-plugin
title: BaseContextPlugin
sidebar_label: BaseContextPlugin
---

# BaseContextPlugin

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.0

## Overview

Base implementation for ContextPlugin. Automates registration of commands, queries, event handlers, and repositories during plugin initialization.

## Type Signature

```typescript
abstract class BaseContextPlugin implements ContextPlugin {
  abstract getCommands(): CommandHandler<any>[];
  abstract getQueries(): QueryHandler<any>[];
  abstract getEventHandlers(): EventHandler<any>[];
  abstract getRepositories(): Map<string, any>;
  
  initialize(context: PluginContext): Promise<void>;
}
```

## Usage

```typescript
class ProductsContextPlugin extends BaseContextPlugin {
  readonly metadata = {
    name: 'products',
    version: '1.0.0',
    description: 'Products bounded context'
  };

  getCommands() {
    return [
      new CreateProductHandler(this.productRepo),
      new UpdateStockHandler(this.productRepo)
    ];
  }

  getQueries() {
    return [
      new GetProductByIdHandler(this.productRepo),
      new ListProductsHandler(this.productRepo)
    ];
  }

  getEventHandlers() {
    return [new ProductCreatedHandler()];
  }

  getRepositories() {
    return new Map([
      ['productRepository', new PostgresProductRepository()]
    ]);
  }
}

// Auto-registration happens in initialize()
const app = await ApplicationBuilder.create()
  .useContext(new ProductsContextPlugin())
  .build();
```

## Auto-Registration

BaseContextPlugin automatically:
1. Registers all command handlers with CommandBus
2. Registers all query handlers with QueryBus
3. Registers all event handlers with EventBus
4. Registers all repositories in DI container

## See Also

- [ContextPlugin](../../layer-2-abstractions/context-plugin.md)
- [Package README](../../../packages/runtime/README.md)
