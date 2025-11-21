---
sidebar_position: 6
title: Dependency Injection
description: Container abstraction and service lifetimes in Stratix
---

# Dependency Injection

Stratix uses **Dependency Injection** (DI) to manage dependencies and promote loose coupling, testability, and maintainability.

## The Container Abstraction

Stratix provides a **Container** interface that abstracts the DI implementation:

```typescript
import { Container } from '@stratix/core';

interface Container {
  register<T>(
    token: string,
    factory: Factory<T>,
    options?: RegisterOptions
  ): void;
  
  resolve<T>(token: string): T;
  
  has(token: string): boolean;
}
```

This allows you to use any DI container (Awilix, TSyringe, InversifyJS, etc.) or even build your own.

## Service Lifetimes

Stratix supports three service lifetimes:

```typescript
import { ServiceLifetime } from '@stratix/core';

enum ServiceLifetime {
  SINGLETON = 'SINGLETON',     // One instance for the entire application
  SCOPED = 'SCOPED',          // One instance per scope (e.g., per request)
  TRANSIENT = 'TRANSIENT'     // New instance every time
}
```

### Singleton

**One instance** for the entire application lifecycle:

```typescript
container.register(
  'database',
  () => new Database(config),
  { lifetime: ServiceLifetime.SINGLETON }
);

// Same instance every time
const db1 = container.resolve('database');
const db2 = container.resolve('database');
console.log(db1 === db2); // true
```

**Use for:**
- ✅ Database connections
- ✅ Configuration
- ✅ Caches
- ✅ Loggers

### Scoped

**One instance per scope** (e.g., per HTTP request):

```typescript
container.register(
  'unitOfWork',
  () => new UnitOfWork(database),
  { lifetime: ServiceLifetime.SCOPED }
);

// Same instance within a scope
const scope = container.createScope();
const uow1 = scope.resolve('unitOfWork');
const uow2 = scope.resolve('unitOfWork');
console.log(uow1 === uow2); // true

// Different instance in different scope
const scope2 = container.createScope();
const uow3 = scope2.resolve('unitOfWork');
console.log(uow1 === uow3); // false
```

**Use for:**
- ✅ Unit of Work
- ✅ Request-scoped services
- ✅ Transaction managers

### Transient

**New instance** every time:

```typescript
container.register(
  'emailService',
  () => new EmailService(config),
  { lifetime: ServiceLifetime.TRANSIENT }
);

// Different instance every time
const email1 = container.resolve('emailService');
const email2 = container.resolve('emailService');
console.log(email1 === email2); // false
```

**Use for:**
- ✅ Stateful services
- ✅ Services with per-operation state
- ✅ Lightweight objects

## Using Awilix (Recommended)

Stratix recommends **Awilix** as the DI container:

```bash
npm install @stratix/di-awilix
```

### Basic Setup

```typescript
import { AwilixContainer } from '@stratix/di-awilix';
import { ServiceLifetime } from '@stratix/core';

const container = new AwilixContainer();

// Register services
container.register(
  'database',
  () => new PostgresDatabase(config),
  { lifetime: ServiceLifetime.SINGLETON }
);

container.register(
  'productRepository',
  (c) => new PostgresProductRepository(c.resolve('database')),
  { lifetime: ServiceLifetime.SINGLETON }
);

container.register(
  'createProductHandler',
  (c) => new CreateProductHandler(
    c.resolve('productRepository'),
    c.resolve('eventBus')
  ),
  { lifetime: ServiceLifetime.TRANSIENT }
);

// Resolve services
const handler = container.resolve('createProductHandler');
```

## Registration Patterns

### Constructor Injection

```typescript
export class CreateProductHandler {
  constructor(
    private productRepository: IProductRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: CreateProductCommand): Promise<Result<Product>> {
    // Use injected dependencies
    const product = new Product(/* ... */);
    await this.productRepository.save(product);
    await this.eventBus.publish(new ProductCreatedEvent(product.id));
    return Success.create(product);
  }
}

// Register with dependencies
container.register(
  'createProductHandler',
  (c) => new CreateProductHandler(
    c.resolve('productRepository'),
    c.resolve('eventBus')
  )
);
```

### Factory Functions

```typescript
// Simple factory
container.register(
  'logger',
  () => new ConsoleLogger()
);

// Factory with configuration
container.register(
  'database',
  () => new Database({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME
  })
);

// Factory with dependencies
container.register(
  'userService',
  (c) => new UserService(
    c.resolve('userRepository'),
    c.resolve('emailService'),
    c.resolve('logger')
  )
);
```

## Plugin Integration

Plugins can register services in the container:

```typescript
import { Plugin, PluginContext } from '@stratix/core';

export class PostgresPlugin implements Plugin {
  readonly metadata = {
    name: 'postgres',
    version: '1.0.0'
  };

  async initialize(context: PluginContext): Promise<void> {
    const config = context.getConfig<PostgresConfig>();
    
    // Register database connection
    context.container.register(
      'database',
      () => new PostgresDatabase(config),
      { lifetime: ServiceLifetime.SINGLETON }
    );

    // Register repositories
    context.container.register(
      'productRepository',
      (c) => new PostgresProductRepository(c.resolve('database')),
      { lifetime: ServiceLifetime.SINGLETON }
    );
  }
}
```

## Application Setup

### With ApplicationBuilder

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/di-awilix';

const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  
  // Plugins register their services
  .usePlugin(new PostgresPlugin({ /* config */ }))
  .usePlugin(new FastifyHTTPPlugin({ port: 3000 }))
  
  .build();

// Resolve services
const database = app.resolve('database');
const productRepository = app.resolve('productRepository');
```

### Manual Setup

```typescript
const container = new AwilixContainer();

// Register infrastructure
container.register('logger', () => new ConsoleLogger());
container.register('database', () => new PostgresDatabase(config));

// Register repositories
container.register(
  'productRepository',
  (c) => new PostgresProductRepository(c.resolve('database'))
);

// Register command handlers
container.register(
  'createProductHandler',
  (c) => new CreateProductHandler(
    c.resolve('productRepository'),
    c.resolve('eventBus')
  )
);

// Register command bus
const commandBus = new InMemoryCommandBus();
commandBus.register(
  CreateProductCommand,
  container.resolve('createProductHandler')
);

container.register('commandBus', () => commandBus);
```

## Testing with DI

### Mock Dependencies

```typescript
describe('CreateProductHandler', () => {
  it('should create product', async () => {
    // Create mock repository
    const mockRepository: IProductRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    };

    // Create mock event bus
    const mockEventBus: EventBus = {
      publish: jest.fn(),
      subscribe: jest.fn()
    };

    // Inject mocks
    const handler = new CreateProductHandler(
      mockRepository,
      mockEventBus
    );

    // Test
    const result = await handler.handle(
      new CreateProductCommand('Laptop', 999.99, 10)
    );

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalled();
  });
});
```

### Test Container

```typescript
describe('Integration Tests', () => {
  let container: Container;

  beforeEach(() => {
    container = new AwilixContainer();

    // Register test dependencies
    container.register('database', () => new InMemoryDatabase());
    container.register(
      'productRepository',
      (c) => new InMemoryProductRepository()
    );
  });

  it('should create product', async () => {
    const handler = container.resolve('createProductHandler');
    const result = await handler.handle(command);
    expect(result.isSuccess).toBe(true);
  });
});
```

## Best Practices

### 1. Depend on Abstractions

```typescript
// ✅ Good: Depends on interface
export class CreateProductHandler {
  constructor(private repository: IProductRepository) {}
}

// ❌ Bad: Depends on concrete class
export class CreateProductHandler {
  constructor(private repository: PostgresProductRepository) {}
}
```

### 2. Use Constructor Injection

```typescript
// ✅ Good: Constructor injection
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private emailService: EmailService
  ) {}
}

// ❌ Bad: Property injection
export class UserService {
  @Inject()
  private userRepository!: IUserRepository;
}
```

### 3. Register at Application Startup

```typescript
// ✅ Good: Register during startup
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .usePlugin(new PostgresPlugin())
  .build();

// ❌ Bad: Register during request
app.get('/products', async () => {
  container.register('productRepository', ...); // Don't do this!
});
```

### 4. Use Appropriate Lifetimes

```typescript
// ✅ Good: Singleton for stateless services
container.register('logger', () => new Logger(), {
  lifetime: ServiceLifetime.SINGLETON
});

// ✅ Good: Transient for stateful services
container.register('emailBuilder', () => new EmailBuilder(), {
  lifetime: ServiceLifetime.TRANSIENT
});

// ❌ Bad: Singleton for stateful service
container.register('requestContext', () => new RequestContext(), {
  lifetime: ServiceLifetime.SINGLETON // Will share state!
});
```

## Advanced Patterns

### Conditional Registration

```typescript
if (process.env.NODE_ENV === 'production') {
  container.register('logger', () => new ProductionLogger());
} else {
  container.register('logger', () => new ConsoleLogger());
}
```

### Decorators

```typescript
// Base service
container.register('productRepository', () => new PostgresProductRepository());

// Wrap with caching
const baseRepo = container.resolve('productRepository');
container.register(
  'productRepository',
  () => new CachedProductRepository(baseRepo, cache)
);
```

### Factory Pattern

```typescript
container.register(
  'repositoryFactory',
  (c) => ({
    createProductRepository: () => c.resolve('productRepository'),
    createOrderRepository: () => c.resolve('orderRepository')
  })
);
```

## Next Steps

- **[Architecture Overview](./architecture-overview)** - Hexagonal architecture
- **[Plugin System](../plugins/plugin-architecture)** - Plugin development
- **[CQRS](./cqrs)** - Command and query handlers
