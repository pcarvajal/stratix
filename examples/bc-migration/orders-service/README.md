# Orders Microservice

This is an example of a Bounded Context extracted from the modular monolith.

## Key Point

**The OrdersContextModule code is IDENTICAL to the monolith version.**

Zero changes were needed in:
- Domain layer
- Application layer
- Infrastructure layer (repository implementation)

## What Changed

Only `src/index.ts` changed:
1. Removed other context plugins (Products, Inventory)
2. Kept ONLY OrdersContextModule
3. In production: would add distributed infrastructure plugins

## Production Setup

In production, you would add:

```typescript
import { PostgresPlugin } from '@stratix/ext-postgres';
import { RabbitMQEventBusPlugin } from '@stratix/ext-rabbitmq';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQEventBusPlugin({ url: 'amqp://localhost' }))
  .useContext(new OrdersContextModule())  // SAME plugin
  .build();
```

## Running

```bash
# Install dependencies (from workspace root)
pnpm install

# Run the microservice
pnpm --filter @examples/orders-microservice dev
```

## Architecture

```
Monolith (before):
  - ProductsContextModule
  - OrdersContextModule      <- This one
  - InventoryContextModule

Microservice (after):
  - OrdersContextModule      <- SAME plugin, different deployment
```

## Migration Process

1. Copy Orders context to new service
2. Update main.ts to use only Orders plugin
3. Deploy as separate service
4. NO changes to domain code required

This demonstrates the **Portable Bounded Context** pattern.
