---
id: aggregate-root
title: AggregateRoot
sidebar_label: AggregateRoot
---

# AggregateRoot

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Base class for Aggregate Roots in Domain-Driven Design. An Aggregate Root is the entry point to an aggregate, which is a cluster of domain objects that can be treated as a single unit. The Aggregate Root ensures consistency of changes within the aggregate boundary and manages domain events.

Extends [Entity](./entity.md) with domain event management capabilities.

**Key Features:**
- Inherits all Entity features (identity, timestamps)
- Records and manages domain events
- Ensures aggregate boundary consistency
- Event sourcing support via domain events

## Import

```typescript
import { AggregateRoot, EntityId } from '@stratix/primitives';
import type { DomainEvent } from '@stratix/primitives';
```

## Type Signature

```typescript
abstract class AggregateRoot<T extends string> extends Entity<T> {
  protected record(event: DomainEvent): void;
  pullDomainEvents(): DomainEvent[];
  hasDomainEvents(): boolean;
}
```

## Methods

### record()

Records a domain event that occurred within this aggregate. Events are stored internally and can be retrieved later for publishing.

**Signature:**
```typescript
protected record(event: DomainEvent): void
```

**Visibility:** Protected (only accessible within subclasses)

**Parameters:**
- `event` (`DomainEvent`): The domain event to record

**Returns:** `void`

**Example:**
```typescript
class Order extends AggregateRoot<'Order'> {
  placeOrder(): void {
    this._status = 'placed';
    this.record(new OrderPlacedEvent(this.id));
    this.touch();
  }
}
```

### pullDomainEvents()

Retrieves and clears all domain events recorded by this aggregate. Typically called after the aggregate is persisted, to publish the events.

**Signature:**
```typescript
pullDomainEvents(): DomainEvent[]
```

**Returns:**
- `DomainEvent[]`: Array of all recorded domain events

**Side Effects:** Clears the internal domain events array

**Example:**
```typescript
await repository.save(order);
const events = order.pullDomainEvents();
await eventBus.publishAll(events);
```

### hasDomainEvents()

Checks if this aggregate has any recorded domain events.

**Signature:**
```typescript
hasDomainEvents(): boolean
```

**Returns:**
- `boolean`: `true` if there are pending domain events, `false` otherwise

## Usage Examples

### Basic Aggregate Root

```typescript
import { AggregateRoot, EntityId, DomainEvent } from '@stratix/primitives';

type OrderId = EntityId<'Order'>;

class OrderPlacedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly timestamp: Date = new Date()
  ) {
    super();
  }
}

class Order extends AggregateRoot<'Order'> {
  private constructor(
    id: OrderId,
    private _status: 'pending' | 'placed' | 'cancelled',
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(): Order {
    const id = EntityId.create<'Order'>();
    const now = new Date();
    return new Order(id, 'pending', now, now);
  }

  placeOrder(): void {
    if (this._status !== 'pending') {
      throw new Error('Order can only be placed when pending');
    }
    this._status = 'placed';
    this.record(new OrderPlacedEvent(this.id));
    this.touch();
  }

  get status(): string {
    return this._status;
  }
}
```

### Advanced Usage

```typescript
class PlaceOrderService {
  constructor(
    private orderRepository: OrderRepository,
    private eventBus: EventBus
  ) {}

  async execute(orderId: OrderId): Promise<Result<void>> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return Failure.create(new Error('Order not found'));
      }

      order.placeOrder();
      await this.orderRepository.save(order);

      const events = order.pullDomainEvents();
      await this.eventBus.publishAll(events);

      return Success.create(undefined);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

## Best Practices

- **Do:** Record domain events for all significant state changes
- **Do:** Pull and publish events after successful persistence
- **Do:** Keep aggregates small and focused
- **Do:** Use events for inter-aggregate communication
- **Don't:** Reference other aggregates directly (use IDs instead)
- **Don't:** Make aggregates too large
- **Don't:** Forget to call `pullDomainEvents()` after save

## Related Components

- [Entity](./entity.md) - Parent class
- [DomainEvent](./domain-event.md) - Base class for events
- [EntityId](./entity-id.md) - Typed identifiers

## See Also

- [Package README](../../../packages/primitives/README.md)
- [Core Concepts - Aggregates](../../website/docs/core-concepts/entities.md)
