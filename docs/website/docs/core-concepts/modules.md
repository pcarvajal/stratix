# Modules

Stratix's killer feature: evolve from modular monolith to microservices without rewriting domain code.

## What are Modules?

**Modules** are self-contained units that encapsulate domain logic. Each module contains:
- Domain entities and value objects
- Application commands and queries
- Event handlers
- Repository interfaces

> **Note**: In Domain-Driven Design (DDD), modules are known as **Bounded Contexts**.

## The Problem

Traditional migration from monolith to microservices requires:
- Complete code rewrite for each service
- 2-3 months per service
- High risk of bugs and regressions
- Lost business logic during translation

## The Stratix Solution

**Modules are portable**. The same code runs in both monolith and microservices.

### Modular Monolith

```typescript
const app = await ApplicationBuilder.create()
  .useContext(new ProductsModule())
  .useContext(new OrdersModule())
  .useContext(new InventoryModule())
  .build();
```

All three modules in one application.

### Extract to Microservice

```typescript
// orders-service/src/index.ts
const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQEventBusPlugin())
  .useContext(new OrdersModule())  // SAME CODE
  .build();
```

**Zero changes** to OrdersModule, domain logic, repositories, or handlers.

## Creating a Module

Use the CLI generator:

```bash
stratix generate context Orders --props "customerId:string,total:number,status:string"
```

This generates a complete module with:

### Domain Layer
- `Order` entity (AggregateRoot)
- `OrderRepository` interface
- `OrderCreated` domain event

### Application Layer
- `CreateOrder` command + handler
- `GetOrderById` query + handler
- `ListOrders` query + handler

### Infrastructure Layer
- `InMemoryOrderRepository` implementation

### Module
- `OrdersModule` with auto-registration

## The BaseContextModule

All modules extend `BaseContextModule`:

```typescript
export class OrdersModule extends BaseContextModule {
  readonly metadata = {
    name: 'orders-context',
    version: '1.0.0',
    requiredPlugins: ['postgres'],
  };

  readonly contextName = 'Orders';

  getCommands(): CommandDefinition[] {
    return [
      {
        name: 'CreateOrder',
        commandType: CreateOrderCommand,
        handler: new CreateOrderHandler(this.orderRepository),
      },
    ];
  }

  getQueries(): QueryDefinition[] {
    return [
      {
        name: 'GetOrderById',
        queryType: GetOrderByIdQuery,
        handler: new GetOrderByIdHandler(this.orderRepository),
      },
    ];
  }

  getRepositories(): RepositoryDefinition[] {
    return [
      {
        token: 'orderRepository',
        instance: new InMemoryOrderRepository(),
        singleton: true,
      },
    ];
  }

  getEventHandlers(): EventHandlerDefinition[] {
    return [];
  }
}
```

### Auto-Registration

`BaseContextModule` automatically:
1. Registers repositories in DI container
2. Registers commands with command bus
3. Registers queries with query bus
4. Subscribes event handlers to event bus

**No manual wiring needed.**

## Migration Path

### Step 1: Start with Modular Monolith

```bash
npm create stratix my-app -- --template modular-monolith
```

Develop quickly with all contexts in one application.

### Step 2: Identify Context to Extract

Extract when you need:
- Independent scaling
- Different team ownership
- Separate deployment cycles
- Technology isolation

### Step 3: Create Microservice

```bash
mkdir orders-service
cd orders-service
npm init
```

### Step 4: Copy Module

```bash
cp -r ../my-app/src/contexts/orders ./src/
```

**Zero modifications to the module code.**

### Step 5: Create Bootstrap

```typescript
// orders-service/src/index.ts
import { OrdersModule } from './orders/index.js';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQEventBusPlugin())
  .useContext(new OrdersModule())  // Same module
  .build();

await app.start();
```

### Step 6: Update Monolith

Remove the extracted module:

```typescript
const app = await ApplicationBuilder.create()
  .useContext(new ProductsModule())
  // .useContext(new OrdersModule())  <- Removed
  .useContext(new InventoryModule())
  .build();
```

### Step 7: Deploy

Both services communicate via RabbitMQ events.

## What Changes

**Infrastructure only:**
- `main.ts` / bootstrap file
- Database plugins (Postgres, MongoDB, etc.)
- Event bus plugins (RabbitMQ vs In-Memory)
- Deployment configuration

## What Stays the Same

**Domain code:**
- Entities and aggregates
- Value objects
- Business rules
- Domain events
- Repository interfaces
- Commands and queries
- Handlers

## Example: Orders Module

See the complete implementation in the repository demonstrating:
- Modular monolith with 3 modules
- Extracted Orders microservice
- Side-by-side comparison

## Benefits

### Zero Rewrite
Domain code is portable. Copy and run.

### Gradual Migration
Extract one context at a time. Test each step.

### Low Risk
Domain logic proven in monolith. Only infrastructure changes.

### Team Autonomy
Different teams own different contexts. Independent deployments.

## Time Savings

**Traditional migration:** 2-3 months per service
**Stratix migration:** ~1 week per service

**ROI:** 80-85% time savings

## Best Practices

### 1. Start Modular
Always begin with modular monolith. Clear boundaries from day 1.

### 2. Extract Based on Data
Monitor metrics. Extract when bottlenecks appear, not by prediction.

### 3. Migrate Gradually
One context at a time. Validate each extraction.

### 4. Maintain Contracts
Domain events are the contract. Don't change event structure.

### 5. Database per Service
Each microservice gets its own database. No shared databases.

## Modules vs Plugins

| Aspect | Plugin | Module |
|--------|--------|--------|
| **Purpose** | Infrastructure (technical) | Domain (business logic) |
| **Examples** | Postgres, Redis, HTTP | Products, Orders, Inventory |
| **Dependencies** | Other plugins | Plugins + other modules |
| **Initialization** | First (low-level) | Second (high-level) |

## Anti-Patterns

### Don't: Copy and Modify
```typescript
// WRONG
class OrderMicroservice extends Order {
  // Different business rules
}
```

### Do: Move As-Is
```typescript
// CORRECT
import { OrdersModule } from './orders/index.js';
```

### Don't: Shared Database
```typescript
// WRONG
orders-service -> [shared_db] <- products-service
```

### Do: Separate Databases
```typescript
// CORRECT
orders-service -> [orders_db]
products-service -> [products_db]
```

## Next Steps

- Try the [modular-monolith template](../getting-started/quick-start.md)
- Learn about [CLI generators](../api-reference/tools/create-stratix.md)
