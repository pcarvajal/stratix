# Monolith to Microservices Migration

Complete guide for migrating from modular monolith to microservices using Bounded Contexts as Modules.

## Overview

This example demonstrates Stratix's killer feature: extracting microservices from a monolith **without rewriting domain code**.

**The Promise:** Zero changes needed in business logic.

## The Setup

### Modular Monolith

Three Bounded Contexts in one application:

```typescript
// src/index.ts
const app = await ApplicationBuilder.create()
  .useContext(new ProductsContextModule())
  .useContext(new OrdersContextModule())
  .useContext(new InventoryContextModule())
  .build();
```

### Extracted Microservice

Orders context running as independent service:

```typescript
// src/index.ts
const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQEventBusPlugin())
  .useContext(new OrdersContextModule())  // SAME CODE
  .build();
```

## Running the Example

### 1. Modular Monolith

```bash
stratix new my-monolith -- --template modular-monolith
cd my-monolith
pnpm install
pnpm dev
```

Output shows all 3 contexts:

```
Bounded Contexts loaded as plugins:
  - Products: Manages product catalog
  - Orders: Manages customer orders
  - Inventory: Manages stock levels

Architecture: Modular Monolith
```

### 2. Orders Microservice

Create a new project with the extracted context and run it:

```bash
pnpm install
pnpm dev
```

Output shows only Orders:

```
Orders Microservice is running!

Bounded Context: Orders (extracted from monolith)

Code Changes Required: ZERO
  - OrdersContextModule: Identical
  - Domain layer: Unchanged
  - Application layer: Unchanged
  - Infrastructure layer: Unchanged
```

## What Changed

### Files Copied

Entire `orders/` context directory:
- `domain/` - Entities, value objects, repositories
- `application/` - Commands, queries, handlers
- `infrastructure/` - Repository implementations
- `OrdersContextModule.ts` - Module definition

**Modifications:** ZERO

### Files Created

New microservice files:
- `src/index.ts` - Bootstrap for microservice
- `package.json` - Service dependencies
- `tsconfig.json` - TypeScript config
- `README.md` - Documentation

### Files Modified

**NONE** in the OrdersContextModule or any domain/application code.

## Migration Steps (Real Project)

### Step 1: Identify Context

Choose based on:
- **Scaling needs** - Different traffic patterns
- **Team ownership** - Independent teams
- **Deployment cycle** - Different release schedules
- **Technology** - Needs different stack

Example: Extract Orders because:
- Peak traffic on Black Friday
- Sales team wants independent deploys
- Needs horizontal scaling

### Step 2: Create Microservice Project

```bash
mkdir orders-service
cd orders-service
npm init -y
npm install @stratix/runtime @stratix/primitives @stratix/abstractions
npm install @stratix/ext-postgres @stratix/ext-rabbitmq
```

### Step 3: Copy Context

```bash
cp -r ../monolith/src/contexts/orders ./src/
```

Copy the **entire context** without modifications.

### Step 4: Create Bootstrap

```typescript
// orders-service/src/index.ts
import { ApplicationBuilder } from '@stratix/runtime';
import { PostgresPlugin } from '@stratix/ext-postgres';
import { RabbitMQEventBusPlugin } from '@stratix/ext-rabbitmq';
import { OrdersContextModule } from './orders/index.js';

async function bootstrap() {
  const app = await ApplicationBuilder.create()
    // Distributed infrastructure
    .usePlugin(new PostgresPlugin({
      host: process.env.DB_HOST,
      database: 'orders_db',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }))
    .usePlugin(new RabbitMQEventBusPlugin({
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
    }))
    // Same module
    .useContext(new OrdersContextModule())
    .build();

  await app.start();
  console.log('Orders microservice running on port 3001');
}

bootstrap();
```

### Step 5: Deploy Microservice

```bash
pnpm build
pnpm start
```

### Step 6: Update Monolith

Remove Orders from monolith:

```typescript
// monolith/src/index.ts
const app = await ApplicationBuilder.create()
  // Add RabbitMQ for communication
  .usePlugin(new RabbitMQEventBusPlugin({
    url: process.env.RABBITMQ_URL,
  }))
  .useContext(new ProductsContextModule())
  // .useContext(new OrdersContextModule())  <- Removed
  .useContext(new InventoryContextModule())
  .build();
```

### Step 7: Verify Communication

Contexts communicate via events:

```
[Monolith]                    [RabbitMQ]           [Orders Service]
  Products  --ProductCreated--> Queue ---> OrdersEventHandler
                                Queue <---  OrderCreated
  Inventory <---OrderCreated---
```

## Infrastructure Changes

### In-Memory → Postgres

If needed, update repository:

```typescript
// orders/infrastructure/PostgresOrderRepository.ts
export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly db: Database) {}

  async save(order: Order): Promise<void> {
    await this.db.query(
      'INSERT INTO orders (id, customer_id, total, status) VALUES ($1, $2, $3, $4)',
      [order.id.value, order.customerId, order.total, order.status]
    );
  }

  async findById(id: OrderId): Promise<Order | null> {
    const row = await this.db.queryOne(
      'SELECT * FROM orders WHERE id = $1',
      [id.value]
    );
    return row ? Order.from(/* ... */) : null;
  }
}
```

Update module:

```typescript
// OrdersContextModule.ts
getRepositories(): RepositoryDefinition[] {
  return [
    {
      token: 'orderRepository',
      instance: new PostgresOrderRepository(this.db),  // Changed
      singleton: true,
    },
  ];
}
```

**Domain and Application layers:** Still unchanged.

## Production Considerations

### Database per Service

```typescript
// Orders service
.usePlugin(new PostgresPlugin({ database: 'orders_db' }))

// Products service
.usePlugin(new PostgresPlugin({ database: 'products_db' }))
```

### Event Bus

Replace in-memory with distributed:

```typescript
// Development (monolith)
.usePlugin(new InMemoryEventBusPlugin())

// Production (microservices)
.usePlugin(new RabbitMQEventBusPlugin({
  url: process.env.RABBITMQ_URL
}))
```

### API Gateway

Add HTTP endpoints:

```typescript
.usePlugin(new FastifyPlugin({
  port: process.env.PORT || 3001
}))
```

### Health Checks

Built into ContextModule:

```typescript
const health = await app.healthCheck('orders');
console.log(health.status); // UP or DOWN
```

## Benefits

### 1. Zero Rewrite
- Domain code portable
- Business logic unchanged
- Repositories unchanged
- Commands/Queries unchanged

### 2. Gradual Migration
- Extract one context at a time
- Test each extraction
- Rollback if needed
- Strangler Fig Pattern

### 3. Low Risk
- Small incremental changes
- Domain logic proven in monolith
- Only infrastructure changes
- Easy to validate

### 4. Team Autonomy
- Different teams own services
- Independent deployment cycles
- Technology choices per service
- Clear boundaries

## Time Comparison

### Without Stratix
Per service extraction:
- Analysis: 1 week
- Rewrite domain: 2-3 weeks
- Testing: 1-2 weeks
- Deploy: 1 week

**Total:** 5-7 weeks per service

### With Stratix
Per service extraction:
- Copy context: 15 minutes
- Create bootstrap: 1 hour
- Configure infrastructure: 2-3 hours
- Testing: 2-3 days
- Deploy: 1 day

**Total:** ~1 week per service

**Savings:** 80-85% time reduction

## Checklist

### Before Extraction
- [ ] Bounded Context clearly defined
- [ ] Metrics show real need
- [ ] Integration tests exist
- [ ] Domain events documented
- [ ] Team trained

### During Extraction
- [ ] Context copied unchanged
- [ ] Bootstrap created
- [ ] Infrastructure configured
- [ ] Health checks implemented
- [ ] Logging with correlation IDs

### After Extraction
- [ ] Microservice deployed
- [ ] Monolith updated
- [ ] Event communication verified
- [ ] Metrics monitored
- [ ] Documentation updated

## Anti-Patterns

### Don't: Copy-Paste and Modify

```typescript
// WRONG
class OrderMicroservice extends Order {
  // Changes to business logic
}
```

### Do: Move As-Is

```typescript
// CORRECT
import { OrdersContextModule } from './orders/index.js';
```

### Don't: Shared Database

```typescript
// WRONG
orders-service -> [shared_db] <- products-service
```

### Do: Database per Service

```typescript
// CORRECT
orders-service -> [orders_db]
products-service -> [products_db]
```

### Don't: Synchronous Calls

```typescript
// WRONG
const product = await fetch('http://products-service/api/products/123');
```

### Do: Asynchronous Events

```typescript
// CORRECT
eventBus.publish(new OrderCreatedEvent(order.id));
```

## Learn More

- [Bounded Contexts as Modules](../core-concepts/bounded-contexts.md)
- [Modular Monolith Pattern](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)

## Source Code

The modular monolith template is available via `stratix CLI`:
- Modular monolith: Use `--template modular-monolith`
- Complete implementation with 3 bounded contexts
- Migration guide included in template
- Bounded Contexts for domain/business logic modules
