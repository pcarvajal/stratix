# Stratix Modular Monolith Template

A production-ready modular monolith demonstrating **Bounded Contexts as Plugins** pattern.

This template shows how to build applications that can evolve from monolith to microservices **without rewriting domain code**.

## Architecture

This template implements **3 Bounded Contexts** as portable plugins:

- **Products Context**: Product catalog management
- **Orders Context**: Order processing
- **Inventory Context**: Stock management

Each context is:
- Self-contained (domain, application, infrastructure layers)
- Portable (works in monolith or microservice)
- Auto-wired (ContextPlugin handles registration)

## Project Structure

```
src/
├── contexts/
│   ├── products/
│   │   ├── domain/
│   │   │   ├── entities/Product.ts
│   │   │   ├── repositories/ProductRepository.ts
│   │   │   └── events/ProductCreated.ts
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   └── queries/
│   │   ├── infrastructure/
│   │   │   └── persistence/InMemoryProductRepository.ts
│   │   ├── ProductsContextPlugin.ts    # Auto-wiring
│   │   └── index.ts
│   ├── orders/
│   │   └── ... (same structure)
│   └── inventory/
│       └── ... (same structure)
└── index.ts  # Application bootstrap
```

## Getting Started

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## How It Works

### Monolith Configuration (Current)

```typescript
// src/index.ts
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)

  // All 3 contexts in one application
  .usePlugin(new ProductsContextPlugin())
  .usePlugin(new OrdersContextPlugin())
  .usePlugin(new InventoryContextPlugin())

  .build();
```

### What is a Context Plugin?

Each `ContextPlugin` encapsulates:
- Domain entities and business rules
- Commands and queries (CQRS)
- Event handlers
- Repository implementations

The `BaseContextPlugin` automatically:
1. Registers all commands with CommandBus
2. Registers all queries with QueryBus
3. Subscribes event handlers to EventBus
4. Registers repositories in DI container

**Zero boilerplate needed!**

## Migrating to Microservices

### Step 1: Extract One Context

Create new project for Orders microservice:

```bash
mkdir orders-service
cd orders-service
npm init -y
npm install @stratix/runtime @stratix/primitives @stratix/abstractions
```

### Step 2: Copy the Context

```bash
# Copy ONLY the Orders context
cp -r ../modular-monolith/src/contexts/orders ./src/contexts/
```

### Step 3: Change Infrastructure (NOT Domain Code)

```typescript
// orders-service/src/index.ts
import { ApplicationBuilder } from '@stratix/runtime';
import { PostgresPlugin } from '@stratix/ext-postgres';
import { RabbitMQEventBusPlugin } from '@stratix/ext-rabbitmq';

// SAME OrdersContextPlugin - ZERO changes
import { OrdersContextPlugin } from './contexts/orders/index.js';

const app = await ApplicationBuilder.create()
  // Different infrastructure
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQEventBusPlugin({ url: 'amqp://localhost' }))

  // SAME context plugin
  .usePlugin(new OrdersContextPlugin())

  .build();
```

### Step 4: Update Monolith

Remove Orders context from monolith:

```typescript
// modular-monolith/src/index.ts
const app = await ApplicationBuilder.create()
  .usePlugin(new ProductsContextPlugin())
  // .usePlugin(new OrdersContextPlugin())  <- Removed
  .usePlugin(new InventoryContextPlugin())
  .build();
```

### Result: Zero Domain Code Changes

The `OrdersContextPlugin` works unchanged because:
- Domain logic depends on abstractions (Repository interface)
- Infrastructure is injected via DI
- Communication happens via EventBus abstraction

## Available Commands

### Development

- `npm run dev` - Start with hot reload
- `npm run build` - Build for production
- `npm start` - Start production build
- `npm test` - Run tests
- `npm run typecheck` - Type check
- `npm run lint` - Lint code

### Adding New Features

```bash
# Add new command to existing context
cd src/contexts/products
stratix g command UpdateProduct --input "id:string,price:number"

# Add new query
stratix g query GetProductByName --input "name:string" --output "product:Product"

# Add new bounded context
stratix g context Customers --props "name:string,email:string"
```

Then register the new context:

```typescript
import { CustomersContextPlugin } from './contexts/customers/index.js';

const app = await ApplicationBuilder.create()
  // ...
  .usePlugin(new CustomersContextPlugin())  // New context
  .build();
```

## Key Benefits

### 1. Start Simple (Monolith)

- One deployment
- Shared memory EventBus
- Fast development
- Easy debugging

### 2. Scale When Needed (Microservices)

- Extract bounded contexts individually
- Distributed EventBus (RabbitMQ, Kafka)
- Independent scaling
- Independent deployment

### 3. Zero Rewrite

- Domain code is portable
- Only change infrastructure plugins
- Gradual migration (Strangler Fig Pattern)
- Low risk

## Architecture Patterns

This template demonstrates:

- **Domain-Driven Design**: Bounded Contexts, Aggregates, Value Objects
- **CQRS**: Separate command and query models
- **Hexagonal Architecture**: Domain independent of infrastructure
- **Event-Driven**: Contexts communicate via events
- **Plugin System**: Contexts as portable plugins

## Inter-Context Communication

Contexts communicate via **Domain Events**:

```typescript
// Products context publishes event
product.addDomainEvent(new ProductCreated(product.id, product.name));

// Inventory context listens to event
class ProductCreatedHandler implements EventHandler<ProductCreated> {
  async handle(event: ProductCreated) {
    // Create inventory record for new product
  }
}
```

Events work the same in monolith (in-memory) or microservices (distributed).

## Production Considerations

### When to Extract a Context

Extract to microservice when:
- Context has different scaling needs
- Context is developed by different team
- Context has different deployment cycle
- Context needs different technology stack

### How to Replace Infrastructure

1. **Database**: Replace InMemory with Postgres/MongoDB
   ```typescript
   .usePlugin(new PostgresPlugin({ database: 'products' }))
   ```

2. **EventBus**: Replace InMemory with RabbitMQ/Kafka
   ```typescript
   .usePlugin(new RabbitMQEventBusPlugin({ url: '...' }))
   ```

3. **HTTP Server** (optional): Add REST API
   ```typescript
   .usePlugin(new FastifyPlugin({ port: 3000 }))
   ```

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
- [Modular Monolith](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)

## License

MIT
