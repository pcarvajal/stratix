---
id: base-context-module
title: BaseContextModule
sidebar_label: BaseContextModule
---

# BaseContextModule

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.3

## Overview

Base implementation for ContextModule. Automates registration of commands, queries, event handlers, and repositories during module initialization.

Subclasses only need to define metadata and implement getter methods. All wiring is handled automatically.

## Import

```typescript
import { BaseContextModule } from '@stratix/runtime';
```

## Type Signature

```typescript
abstract class BaseContextModule implements ContextModule {
  abstract readonly metadata: ModuleMetadata;
  abstract readonly contextName: string;
  
  protected context?: ModuleContext;
  
  getCommands(): CommandDefinition[];
  getQueries(): QueryDefinition[];
  getEventHandlers(): EventHandlerDefinition[];
  getRepositories(): RepositoryDefinition[];
  
  initialize(context: ModuleContext): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<HealthCheckResult>;
}
```

## Abstract Properties

### metadata

Module metadata that must be implemented by subclasses.

```typescript
abstract readonly metadata: ModuleMetadata;
```

**Example:**
```typescript
readonly metadata: ModuleMetadata = {
  name: 'products-context',
  version: '1.0.0',
  requiredPlugins: ['postgres'],
  requiredModules: []
};
```

### contextName

Human-readable name that must be implemented by subclasses.

```typescript
abstract readonly contextName: string;
```

**Example:**
```typescript
readonly contextName = 'Products';
```

## Methods

### getCommands()

Override to provide command definitions.

```typescript
getCommands(): CommandDefinition[]
```

**Returns:** Array of command definitions (empty by default)

### getQueries()

Override to provide query definitions.

```typescript
getQueries(): QueryDefinition[]
```

**Returns:** Array of query definitions (empty by default)

### getEventHandlers()

Override to provide event handler definitions.

```typescript
getEventHandlers(): EventHandlerDefinition[]
```

**Returns:** Array of event handler definitions (empty by default)

### getRepositories()

Override to provide repository definitions.

```typescript
getRepositories(): RepositoryDefinition[]
```

**Returns:** Array of repository definitions (empty by default)

### initialize()

Initializes the module. Can be overridden but should call `super.initialize()`.

```typescript
async initialize(context: ModuleContext): Promise<void>
```

**Automatic behavior:**
1. Registers all repositories in DI container
2. Registers all commands with command bus
3. Registers all queries with query bus
4. Subscribes all event handlers to event bus

## Usage Example

```typescript
import { BaseContextModule } from '@stratix/runtime';
import type { 
  ModuleMetadata, 
  ModuleContext,
  CommandDefinition,
  QueryDefinition,
  RepositoryDefinition 
} from '@stratix/abstractions';

export class ProductsModule extends BaseContextModule {
  readonly metadata: ModuleMetadata = {
    name: 'products-context',
    version: '1.0.0',
    description: 'Products domain module',
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
    // Repositories registered first, resolve lazily when needed
    const repo = this.productRepo || this.context?.container.resolve('productRepository');
    
    return [
      {
        name: 'CreateProduct',
        commandType: CreateProductCommand,
        handler: new CreateProductHandler(repo!)
      },
      {
        name: 'UpdateProduct',
        commandType: UpdateProductCommand,
        handler: new UpdateProductHandler(repo!)
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
      },
      {
        name: 'ListProducts',
        queryType: ListProductsQuery,
        handler: new ListProductsHandler(repo!)
      }
    ];
  }

  async initialize(context: ModuleContext): Promise<void> {
    // Call super to register repos, then CQRS components
    await super.initialize(context);
    
    // Now resolve for future use (optional)
    this.productRepo = context.container.resolve('productRepository');
  }
}
```

## Initialization Order

When `initialize()` is called:

1. **`super.initialize()` execution begins**
2. **Repositories registered** - Via `getRepositories()`, registered in container
3. **Commands registered** - Via `getCommands()`, handlers can resolve repos lazily
4. **Queries registered** - Via `getQueries()`, handlers can resolve repos lazily
5. **Event handlers subscribed** - Via `getEventHandlers()`
6. **Custom initialization** - Your code after `super.initialize()` completes

**Best Practice:** Resolve dependencies in `getCommands()`/`getQueries()` methods lazily, or after calling `super.initialize()`.

## Module Registration

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new PostgresPlugin())
  .useContext(new ProductsModule())
  .build();
```

## See Also

- [ContextModule](../abstractions/context-module.md) - Interface documentation
- [ModuleContext](../abstractions/module-context.md) - Module initialization context
- [ApplicationBuilder](./application-builder.md) - Building applications with modules
