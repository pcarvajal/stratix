---
id: event-bus
title: EventBus
sidebar_label: EventBus
---

# EventBus

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Event bus interface for publishing and subscribing to domain events. Enables loosely coupled, event-driven architecture where components react to domain changes without direct dependencies.

**Key Features:**
- Domain event publishing
- Event handler registration
- Asynchronous event processing
- Type-safe subscriptions
- Implementation-agnostic

## Import

```typescript
import type { EventBus, EventHandler } from '@stratix/abstractions';
import type { DomainEvent } from '@stratix/primitives';
```

## Type Signature

```typescript
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;
}

interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}
```

## Usage Examples

### Publishing Events

```typescript
class OrderService {
  constructor(
    private repository: OrderRepository,
    private eventBus: EventBus
  ) {}

  async placeOrder(orderId: EntityId<'Order'>): Promise<void> {
    const order = await this.repository.findById(orderId);
    order.place();

    await this.repository.save(order);

    const events = order.pullDomainEvents();
    await this.eventBus.publishAll(events);
  }
}
```

### Subscribing to Events

```typescript
class SendOrderConfirmationHandler implements EventHandler<OrderPlacedEvent> {
  constructor(private emailService: EmailService) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    await this.emailService.send({
      to: event.customerEmail,
      subject: 'Order Confirmation',
      body: `Order ${event.orderId} placed successfully`
    });
  }
}

// Register handler
eventBus.subscribe('OrderPlaced', new SendOrderConfirmationHandler(emailService));
```

## Best Practices

- **Do:** Publish events after persistence
- **Do:** Use specific event types
- **Do:** Keep handlers focused (single responsibility)
- **Do:** Handle errors in event handlers
- **Don't:** Publish events before persistence (inconsistency risk)
- **Don't:** Use events for request-response patterns

## Related Components

- [DomainEvent](../layer-1-primitives/domain-event.md) - Events interface
- [AggregateRoot](../layer-1-primitives/aggregate-root.md) - Records events

## See Also

- [Package README](../../../packages/abstractions/README.md)
