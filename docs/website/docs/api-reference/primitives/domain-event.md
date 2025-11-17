---
id: domain-event
title: DomainEvent
sidebar_label: DomainEvent
---

# DomainEvent

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Base interface for Domain Events in Domain-Driven Design. Domain Events represent something significant that happened in the domain that domain experts care about. They are immutable facts about the past and trigger side effects or eventual consistency across aggregates.

Domain Events enable loosely coupled, event-driven architectures where different parts of the system react to changes without direct dependencies. They are the foundation for event sourcing, CQRS, and microservices communication patterns.

**Key Features:**
- Immutable records of what happened
- Timestamp when event occurred
- Used for inter-aggregate communication
- Enable event sourcing patterns
- Foundation for eventual consistency
- Can be persisted to event store

## Import

```typescript
import type { DomainEvent } from '@stratix/primitives';
```

## Type Signature

```typescript
interface DomainEvent {
  readonly occurredAt: Date;
}
```

## Properties

### occurredAt

**Type:** `Date` (readonly)

The timestamp when this event occurred. This should be set to the exact moment the domain action was performed, not when the event is persisted or published.

**Example:**
```typescript
const event: UserCreatedEvent = {
  occurredAt: new Date(),
  userId: '123',
  email: 'user@example.com'
};
```

## Usage Examples

### Basic Domain Event

```typescript
import type { DomainEvent } from '@stratix/primitives';
import type { EntityId } from '@stratix/primitives';

interface UserCreatedEvent extends DomainEvent {
  readonly userId: string;
  readonly email: string;
  readonly name: string;
}

// Create event
const event: UserCreatedEvent = {
  occurredAt: new Date(),
  userId: '550e8400-e29b-41d4-a716-446655440000',
  email: 'john@example.com',
  name: 'John Doe'
};
```

### Events with Typed IDs

```typescript
import type { DomainEvent, EntityId } from '@stratix/primitives';

type OrderId = EntityId<'Order'>;
type CustomerId = EntityId<'Customer'>;

interface OrderPlacedEvent extends DomainEvent {
  readonly orderId: OrderId;
  readonly customerId: CustomerId;
  readonly total: number;
  readonly items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

const event: OrderPlacedEvent = {
  occurredAt: new Date(),
  orderId: EntityId.create<'Order'>(),
  customerId: EntityId.create<'Customer'>(),
  total: 299.99,
  items: [
    { productId: 'prod-1', quantity: 2, price: 99.99 },
    { productId: 'prod-2', quantity: 1, price: 99.99 }
  ]
};
```

### Recording Events in Aggregates

```typescript
import { AggregateRoot, EntityId } from '@stratix/primitives';
import type { DomainEvent } from '@stratix/primitives';

interface ProductCreatedEvent extends DomainEvent {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
}

interface StockDecreasedEvent extends DomainEvent {
  readonly productId: string;
  readonly quantity: number;
  readonly remainingStock: number;
}

class Product extends AggregateRoot<'Product'> {
  private constructor(
    id: EntityId<'Product'>,
    private name: string,
    private price: number,
    private stock: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(name: string, price: number, stock: number): Product {
    const id = EntityId.create<'Product'>();
    const now = new Date();
    const product = new Product(id, name, price, stock, now, now);

    // Record creation event
    product.record({
      occurredAt: now,
      productId: id.value,
      name,
      price
    } satisfies ProductCreatedEvent);

    return product;
  }

  decreaseStock(quantity: number): void {
    if (quantity > this.stock) {
      throw new Error('Insufficient stock');
    }

    this.stock -= quantity;
    this.touch();

    // Record stock change event
    this.record({
      occurredAt: new Date(),
      productId: this.id.value,
      quantity,
      remainingStock: this.stock
    } satisfies StockDecreasedEvent);
  }
}
```

### Publishing Events

```typescript
import type { DomainEvent } from '@stratix/primitives';
import type { EventBus } from '@stratix/abstractions';

class OrderService {
  constructor(
    private repository: OrderRepository,
    private eventBus: EventBus
  ) {}

  async placeOrder(orderId: EntityId<'Order'>): Promise<Result<void, Error>> {
    // Load aggregate
    const order = await this.repository.findById(orderId);
    if (!order) {
      return Failure.create(new Error('Order not found'));
    }

    // Execute domain logic (records events)
    order.place();

    // Save aggregate
    await this.repository.save(order);

    // Pull and publish events
    const events: DomainEvent[] = order.pullDomainEvents();
    await this.eventBus.publishAll(events);

    return Success.create(undefined);
  }
}
```

### Event Handlers

```typescript
import type { DomainEvent } from '@stratix/primitives';
import type { EventHandler } from '@stratix/abstractions';

interface OrderPlacedEvent extends DomainEvent {
  readonly orderId: string;
  readonly customerId: string;
  readonly total: number;
}

class SendOrderConfirmationEmail implements EventHandler<OrderPlacedEvent> {
  readonly eventType = 'OrderPlaced';

  async handle(event: OrderPlacedEvent): Promise<void> {
    console.log(`Order placed at: ${event.occurredAt.toISOString()}`);
    console.log(`Order ID: ${event.orderId}`);
    console.log(`Customer ID: ${event.customerId}`);
    console.log(`Total: $${event.total}`);

    // Send email...
    await this.emailService.sendOrderConfirmation(
      event.customerId,
      event.orderId
    );
  }
}
```

### Advanced: Event Versioning

```typescript
import type { DomainEvent } from '@stratix/primitives';

// Version 1
interface UserCreatedEventV1 extends DomainEvent {
  readonly version: 1;
  readonly userId: string;
  readonly email: string;
}

// Version 2 (added name field)
interface UserCreatedEventV2 extends DomainEvent {
  readonly version: 2;
  readonly userId: string;
  readonly email: string;
  readonly name: string;
}

type UserCreatedEvent = UserCreatedEventV1 | UserCreatedEventV2;

// Handler supports multiple versions
class UserCreatedHandler implements EventHandler<UserCreatedEvent> {
  readonly eventType = 'UserCreated';

  async handle(event: UserCreatedEvent): Promise<void> {
    if (event.version === 1) {
      // Handle V1 event (no name)
      console.log(`User ${event.email} created`);
    } else if (event.version === 2) {
      // Handle V2 event (with name)
      console.log(`User ${event.name} (${event.email}) created`);
    }
  }
}
```

### Integration with Event Store

```typescript
import type { DomainEvent } from '@stratix/primitives';

interface StoredEvent {
  id: string;
  aggregateId: string;
  eventType: string;
  eventData: DomainEvent;
  occurredAt: Date;
  version: number;
}

class EventStore {
  private events: StoredEvent[] = [];

  async append(aggregateId: string, events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const stored: StoredEvent = {
        id: randomUUID(),
        aggregateId,
        eventType: event.constructor.name,
        eventData: event,
        occurredAt: event.occurredAt,
        version: this.getNextVersion(aggregateId)
      };
      this.events.push(stored);
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events
      .filter(e => e.aggregateId === aggregateId)
      .sort((a, b) => a.version - b.version)
      .map(e => e.eventData);
  }

  private getNextVersion(aggregateId: string): number {
    const current = this.events
      .filter(e => e.aggregateId === aggregateId)
      .length;
    return current + 1;
  }
}
```

## Best Practices

- **Do:** Name events in past tense (UserCreated, OrderPlaced, StockDecreased)
- **Do:** Make events immutable (readonly properties)
- **Do:** Include all relevant data needed by handlers
- **Do:** Set `occurredAt` to the exact moment of the action
- **Do:** Use specific event types rather than generic ones
- **Don't:** Include entire aggregates in events (use IDs instead)
- **Don't:** Modify events after creation
- **Don't:** Use events for request-response patterns (use commands instead)
- **Don't:** Include sensitive data unless necessary

## Common Pitfalls

### Pitfall 1: Mutable Events

**Problem:**
```typescript
// BAD: Mutable event
interface BadEvent extends DomainEvent {
  occurredAt: Date; // Not readonly!
  userId: string;   // Not readonly!
}

const event: BadEvent = {
  occurredAt: new Date(),
  userId: '123'
};

event.userId = '456'; // Mutated! Breaks event immutability
```

**Solution:**
```typescript
// GOOD: Immutable event
interface GoodEvent extends DomainEvent {
  readonly occurredAt: Date;
  readonly userId: string;
}

const event: GoodEvent = {
  occurredAt: new Date(),
  userId: '123'
};

// event.userId = '456'; // Compile error
```

### Pitfall 2: Forgetting occurredAt

**Problem:**
```typescript
// BAD: Missing occurredAt
interface BadEvent extends DomainEvent {
  userId: string;
}

const event = { userId: '123' }; // Type error: missing occurredAt
```

**Solution:**
```typescript
// GOOD: Include occurredAt
interface GoodEvent extends DomainEvent {
  readonly userId: string;
}

const event: GoodEvent = {
  occurredAt: new Date(),
  userId: '123'
};
```

### Pitfall 3: Including Entire Aggregates

**Problem:**
```typescript
// BAD: Entire aggregate in event
interface BadEvent extends DomainEvent {
  order: Order; // Too much data!
}
```

**Solution:**
```typescript
// GOOD: Only necessary data
interface GoodEvent extends DomainEvent {
  readonly orderId: string;
  readonly total: number;
  readonly status: string;
  // Only include what handlers need
}
```

## Event Naming Conventions

### Good Event Names

- `UserCreated` - Past tense, specific
- `OrderPlaced` - Clear action
- `StockDecreased` - Descriptive
- `PaymentProcessed` - Domain language
- `EmailSent` - Simple and clear

### Avoid These Names

- `UserCreate` - Present tense (wrong)
- `OrderEvent` - Too generic
- `Updated` - Not specific enough
- `DataChanged` - Too vague

## Event Granularity

### Fine-Grained Events (Recommended)

```typescript
interface PriceChanged extends DomainEvent {
  readonly productId: string;
  readonly oldPrice: number;
  readonly newPrice: number;
}

interface StockUpdated extends DomainEvent {
  readonly productId: string;
  readonly oldStock: number;
  readonly newStock: number;
}
```

**Pros:** Precise, easy to handle, clear intent

### Coarse-Grained Events (Avoid)

```typescript
interface ProductUpdated extends DomainEvent {
  readonly productId: string;
  readonly changes: Record<string, unknown>; // Too generic
}
```

**Cons:** Handlers don't know what changed, hard to maintain

## Type Safety

DomainEvent is type-safe when using TypeScript:

```typescript
interface OrderPlacedEvent extends DomainEvent {
  readonly orderId: string;
  readonly total: number;
}

const event: OrderPlacedEvent = {
  occurredAt: new Date(),
  orderId: '123',
  total: 299.99
};

// TypeScript catches missing fields:
// const bad: OrderPlacedEvent = {
//   occurredAt: new Date()
// }; // Error: missing orderId and total
```

## Performance Considerations

- Events are lightweight (just data, no behavior)
- Immutability enables safe concurrent handling
- Consider event batching for high-throughput scenarios
- Event store queries can be optimized with indexes

## Related Components

- [AggregateRoot](./aggregate-root.md) - Records domain events
- [EventBus](../layer-2-abstractions/event-bus.md) - Publishes events
- [EventHandler](../layer-2-abstractions/event-bus.md) - Handles events

## See Also

- [Package README](../../../packages/primitives/README.md)
- [Core Concepts - Domain Events](../../website/docs/core-concepts/domain-events.md)
- [Core Concepts - Event-Driven Architecture](../../website/docs/core-concepts/event-driven.md)

