---
id: primitives-overview
title: Primitives Overview
sidebar_label: Overview
---

# Layer 1: Primitives

> **Package:** `@stratix/primitives`
> **Layer:** Foundation Layer
> **Status:** Stable

## Overview

The primitives layer provides the foundational building blocks for implementing Domain-Driven Design (DDD) in Stratix applications. These are pure TypeScript classes and types with no external dependencies, designed to be extended by your domain entities and value objects.

## Core Principles

- **Immutability**: Value objects are immutable by design
- **Identity**: Entities have unique identifiers with type safety via phantom types
- **Explicit Errors**: Use Result pattern instead of throwing exceptions
- **Domain Events**: Aggregate roots track and emit domain events
- **Type Safety**: Leverage TypeScript's type system for compile-time guarantees

## Package Contents

### Core DDD Building Blocks

- [Entity](./entity.md) - Base class for domain entities with identity
- [AggregateRoot](./aggregate-root.md) - Base class for aggregate roots with domain events
- [ValueObject](./value-object.md) - Base class for immutable value objects
- [EntityId](./entity-id.md) - Typed entity identifiers using phantom types
- [DomainEvent](./domain-event.md) - Base class for domain events
- [DomainService](./domain-service.md) - Base class for domain services
- [DomainError](./domain-error.md) - Base error class for domain errors

### Patterns

- [Result](./result.md) - Result pattern for explicit error handling (Success/Failure)
- [Specification](./specification.md) - Specification pattern for composable business rules

### Built-in Value Objects

- [Money](./money.md) - Money value object with currency support
- [Currency](./currency.md) - Currency enumeration (ISO 4217)
- [Email](./email.md) - Validated email addresses
- [UUID](./uuid.md) - Universally Unique Identifiers
- Plus: `PhoneNumber`, `Address`, `URL`, `DateRange`, `Percentage`

### Original Built-in Value Objects

- [Money](./money.md) - Money value object with currency support
- [Currency](./currency.md) - Currency enumeration (ISO 4217)

### AI Agent Primitives

- [AI Agent Base Class](./ai-agents/ai-agent.md) - Base class for AI agents as domain entities
- [Stratix Tool](./ai-agents/stratix-tool.md) - Tool entities for agent capabilities
- [Agent Context](./ai-agents/agent-context.md) - Execution context for agent runs
- [AI Agent Types](./ai-agents/types.md) - Type definitions for AI agent system

## Installation

```bash
npm install @stratix/primitives
# or
pnpm add @stratix/primitives
# or
yarn add @stratix/primitives
```

## Quick Start

### Creating an Entity

```typescript
import { Entity, EntityId } from '@stratix/primitives';

type UserId = EntityId<'User'>;

interface UserProps {
  name: string;
  email: string;
}

class User extends Entity<'User'> {
  private constructor(
    id: UserId,
    private _name: string,
    private _email: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  static create(props: UserProps, id?: UserId): User {
    const userId = id ?? EntityId.create<'User'>();
    const now = new Date();
    return new User(userId, props.name, props.email, now, now);
  }
}
```

### Creating a Value Object

```typescript
import { ValueObject } from '@stratix/primitives';

interface EmailProps {
  value: string;
}

class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Email {
    // Validation logic
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return new Email({ value: email });
  }
}
```

### Using Result Pattern

```typescript
import { Result, Success, Failure } from '@stratix/primitives';

function divideNumbers(a: number, b: number): Result<number> {
  if (b === 0) {
    return Failure.create(new Error('Division by zero'));
  }
  return Success.create(a / b);
}

const result = divideNumbers(10, 2);

if (result.isSuccess) {
  console.log('Result:', result.value); // 5
} else {
  console.error('Error:', result.error.message);
}
```

### Creating an Aggregate Root with Events

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
  private _status: 'pending' | 'placed' | 'completed';

  static create(id?: OrderId): Order {
    const orderId = id ?? EntityId.create<'Order'>();
    const now = new Date();
    return new Order(orderId, 'pending', now, now);
  }

  placeOrder(): void {
    this._status = 'placed';
    this.record(new OrderPlacedEvent(this.id));
    this.touch();
  }

  get status(): string {
    return this._status;
  }
}
```

## Architecture

The primitives layer sits at the bottom of the Stratix architecture:

```
┌─────────────────────────┐
│   Extensions (Layer 5)  │
├─────────────────────────┤
│ Implementations (L4)    │
├─────────────────────────┤
│   Runtime (Layer 3)     │
├─────────────────────────┤
│  Abstractions (Layer 2) │
├─────────────────────────┤
│  PRIMITIVES (Layer 1)   │ ← You are here
└─────────────────────────┘
```

## Dependencies

**None.** This package has zero runtime dependencies to maintain maximum portability.

## Type Safety Features

### Phantom Types for Entity IDs

```typescript
type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;

// TypeScript prevents mixing IDs of different entity types:
function getUserById(id: UserId): User { /* ... */ }

const userId: UserId = EntityId.create<'User'>();
const orderId: OrderId = EntityId.create<'Order'>();

getUserById(userId);   // ✓ OK
getUserById(orderId);  // ✗ TypeScript error!
```

### Value Object Equality

```typescript
const email1 = Email.create('user@example.com');
const email2 = Email.create('user@example.com');
const email3 = Email.create('other@example.com');

email1.equals(email2); // true (same value)
email1.equals(email3); // false (different value)
```

## Best Practices

### Entities
- **Do** use private constructors with static factory methods
- **Do** use phantom types for EntityId to prevent ID mixing
- **Do** make properties private and expose via getters
- **Don't** allow entities to be created in invalid states

### Value Objects
- **Do** validate in the constructor or factory method
- **Do** make them immutable (no setters)
- **Do** implement meaningful equality checks
- **Don't** include identity fields (they have no ID)

### Aggregate Roots
- **Do** record domain events for state changes
- **Do** enforce business rules and invariants
- **Do** keep aggregates small and focused
- **Don't** reference other aggregates by object (use IDs instead)

### Result Pattern
- **Do** use Result for domain logic that can fail
- **Do** check `isSuccess` before accessing `value`
- **Don't** throw exceptions in domain logic (use Result instead)
- **Don't** mix throwing and Result patterns in the same codebase

## Performance Considerations

- **Entity Comparison**: Uses ID comparison (O(1))
- **Value Object Comparison**: Deep equality check (O(n) where n is number of properties)
- **Domain Events**: Events stored in array, no performance impact unless hundreds of events
- **Memory**: Minimal overhead, base classes add ~3-4 properties per instance

## Migration from Other Frameworks

### From Plain TypeScript Classes

```typescript
// Before (Plain TS)
class User {
  constructor(public id: string, public name: string) {}
}

// After (Stratix)
class User extends Entity<'User'> {
  private constructor(
    id: UserId,
    private _name: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(name: string, id?: UserId): User {
    const userId = id ?? EntityId.create<'User'>();
    const now = new Date();
    return new User(userId, name, now, now);
  }

  get name(): string {
    return this._name;
  }
}
```

## See Also

- [Package Source Code](https://github.com/pcarvajal/stratix/tree/main/packages/primitives)
- [Core Concepts - Entities](../../website/docs/core-concepts/entities.md)
- [Core Concepts - Value Objects](../../website/docs/core-concepts/value-objects.md)
- [Examples](https://github.com/pcarvajal/stratix/tree/main/examples)
