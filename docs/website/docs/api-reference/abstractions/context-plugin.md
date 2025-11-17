---
id: context-plugin
title: ContextPlugin
sidebar_label: ContextPlugin
---

# ContextPlugin

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Extends Plugin interface to represent Bounded Contexts as portable plugins. ContextPlugins encapsulate complete domain modules (commands, queries, events, repositories) enabling architectural evolution from monolith to microservices without code changes.

**Key Features:**
- Bounded Context as plugin
- Auto-registration of CQRS components
- Repository registration
- Portable between deployments
- Single responsibility per context

## Import

```typescript
import type { ContextPlugin } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface ContextPlugin extends Plugin {
  getCommands(): CommandHandler<any>[];
  getQueries(): QueryHandler<any>[];
  getEventHandlers(): EventHandler<any>[];
  getRepositories(): Map<string, any>;
}
```

## Usage Examples

```typescript
class ProductsContextPlugin implements ContextPlugin {
  readonly metadata = {
    name: 'products',
    version: '1.0.0',
    description: 'Products bounded context'
  };

  getCommands() {
    return [new CreateProductHandler(), new UpdateStockHandler()];
  }

  getQueries() {
    return [new GetProductByIdHandler(), new ListProductsHandler()];
  }

  getEventHandlers() {
    return [new ProductCreatedHandler()];
  }

  getRepositories() {
    return new Map([['productRepository', new InMemoryProductRepository()]]);
  }
}

// Use in monolith
const app = await ApplicationBuilder.create()
  .usePlugin(new ProductsContextPlugin())
  .usePlugin(new OrdersContextPlugin())
  .build();

// Or extract to microservice (same code!)
const productService = await ApplicationBuilder.create()
  .usePlugin(new ProductsContextPlugin())
  .build();
```

## Best Practices

- **Do:** Keep contexts small and focused
- **Do:** Use for domain modules only
- **Do:** Make contexts independent
- **Don't:** Create dependencies between contexts

## Related Components

- [Plugin](./plugin.md) - Parent interface
- [BaseContextPlugin](../layer-3-runtime/base-context-plugin.md) - Base implementation

## See Also

- [Package README](../../../packages/abstractions/README.md)
- [CLAUDE.md - Context Plugin System](../../../CLAUDE.md#context-plugin-system)
