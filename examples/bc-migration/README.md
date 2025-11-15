# Bounded Context Migration Example

This example demonstrates how to migrate from a **modular monolith** to **microservices** using Stratix's Bounded Contexts as Plugins pattern.

## The Promise

**"Cambios necesarios en el codigo de negocio: ZERO"**

Extract microservices from your monolith without rewriting domain code.

## Structure

```
bc-migration/
└── orders-service/          # Orders microservice (extracted)
```

The monolith is in: `packages/create-stratix/templates/modular-monolith`

## Comparison

### Modular Monolith

Located at: `packages/create-stratix/templates/modular-monolith`

```typescript
// src/index.ts
const app = await ApplicationBuilder.create()
  .useContext(new ProductsContextModule())
  .useContext(new OrdersContextModule())     // <- This context
  .useContext(new InventoryContextModule())
  .build();
```

3 contexts in one application.

### Orders Microservice

Located at: `examples/bc-migration/orders-service`

```typescript
// src/index.ts
const app = await ApplicationBuilder.create()
  // In production: distributed infrastructure
  // .usePlugin(new PostgresPlugin({ database: 'orders' }))
  // .usePlugin(new RabbitMQEventBusPlugin({ url: '...' }))

  .useContext(new OrdersContextModule())     // SAME context plugin
  .build();
```

Only Orders context, separate deployment.

## What Changed

### Files Copied
- `orders/` context directory (domain, application, infrastructure)
- ZERO modifications to any file in the context

### Files Created
- `src/index.ts` (new bootstrap for microservice)
- `package.json` (service-specific dependencies)
- `tsconfig.json` (TypeScript config)
- `README.md` (documentation)

### Files Modified
**NONE** in the OrdersContextModule or any of its layers.

## Running the Example

### 1. Run Modular Monolith

```bash
# Create project from template
pnpm create stratix my-monolith -- --template modular-monolith --pm pnpm

cd my-monolith
pnpm install
pnpm dev
```

Output shows all 3 contexts running:
```
Bounded Contexts loaded as modules:
  - Products: Manages product catalog
  - Orders: Manages customer orders
  - Inventory: Manages stock levels
```

### 2. Run Orders Microservice

```bash
# From workspace root
pnpm --filter @examples/orders-microservice dev
```

Output shows only Orders context:
```
Orders Microservice is running!

Bounded Context: Orders (extracted from monolith)

Code Changes Required: ZERO
  - OrdersContextModule: Identical to monolith version
  - Domain layer: Unchanged
  - Application layer: Unchanged
  - Infrastructure layer: Unchanged
```

## Migration Steps (Real Project)

### Step 1: Identify Context to Extract

Choose based on:
- Different scaling needs
- Different team ownership
- Different deployment cycle
- Different technology requirements

### Step 2: Create Microservice Project

```bash
mkdir orders-service
cd orders-service
npm init -y
npm install @stratix/runtime @stratix/primitives @stratix/abstractions
```

### Step 3: Copy Bounded Context

```bash
# Copy ONLY the context you're extracting
cp -r ../monolith/src/contexts/orders ./src/
```

### Step 4: Create main.ts

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { PostgresPlugin } from '@stratix/ext-postgres';
import { RabbitMQEventBusPlugin } from '@stratix/ext-rabbitmq';

// SAME OrdersContextModule
import { OrdersContextModule } from './orders/index.js';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQEventBusPlugin())
  .useContext(new OrdersContextModule())  // NO changes
  .build();
```

### Step 5: Deploy Microservice

Deploy orders-service as independent service.

### Step 6: Update Monolith

Remove Orders context from monolith:

```typescript
const app = await ApplicationBuilder.create()
  .useContext(new ProductsContextModule())
  // .useContext(new OrdersContextModule())  <- Removed
  .useContext(new InventoryContextModule())
  .build();
```

### Step 7: Communicate via Events

Contexts communicate via EventBus:
- Monolith → RabbitMQ
- Microservice → RabbitMQ

Events work identically, just different transport.

## Benefits

### 1. Zero Rewrite
- Domain code is portable
- Business logic unchanged
- Repositories unchanged
- Commands/Queries unchanged

### 2. Gradual Migration
- Extract one context at a time
- Test each extraction
- Rollback if needed
- Strangler Fig Pattern

### 3. Low Risk
- Small, incremental changes
- Domain logic proven in monolith
- Only infrastructure changes
- Easy to validate

### 4. Team Autonomy
- Different teams own different services
- Independent deployment cycles
- Technology choices per service
- Clear boundaries

## Anti-Patterns to Avoid

### Don't: Copy-Paste and Modify
```typescript
// WRONG: Copying and changing domain code
class OrderMicroservice extends Order {
  // Changes to business logic
}
```

### Do: Move as-is
```typescript
// CORRECT: Same code, different deployment
import { OrdersContextModule } from './orders/index.js';
```

### Don't: Shared Database
```typescript
// WRONG: Microservices sharing database
.usePlugin(new PostgresPlugin({ database: 'shared' }))
```

### Do: Separate Database
```typescript
// CORRECT: Each service has its own database
.usePlugin(new PostgresPlugin({ database: 'orders' }))
```

## Production Considerations

### Infrastructure Plugins

Replace in-memory implementations:

```typescript
// Development (monolith)
.usePlugin(new InMemoryEventBusPlugin())

// Production (microservices)
.usePlugin(new RabbitMQEventBusPlugin({
  url: process.env.RABBITMQ_URL
}))
```

### Database per Service

Each microservice gets its own database:

```typescript
// Orders service
.usePlugin(new PostgresPlugin({ database: 'orders_db' }))

// Products service
.usePlugin(new PostgresPlugin({ database: 'products_db' }))
```

### API Gateway

Add HTTP endpoints to microservices:

```typescript
.usePlugin(new FastifyPlugin({
  port: process.env.PORT || 3001
}))
```

## Learn More

- [Modular Monolith Pattern](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
- [Microservices Migration](https://martinfowler.com/articles/break-monolith-into-microservices.html)

## Summary

This example proves that Stratix enables **true portable Bounded Contexts**:

1. Start with modular monolith (3 contexts)
2. Extract one context to microservice
3. ZERO changes to domain code
4. Only infrastructure plugins change
5. Gradual, low-risk migration

**This is the killer feature of Stratix.**
