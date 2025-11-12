# @stratix/primitives

Foundation types and base classes for building domain models with Domain-Driven Design patterns.

## Installation

```bash
pnpm add @stratix/primitives
```

## Core Types

### EntityId

Type-safe entity identifiers using phantom types.

```typescript
import { EntityId } from '@stratix/primitives';

type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;

const userId = EntityId.create<'User'>(); // Type: UserId
const orderId = EntityId.fromString('123e4567-e89b-12d3-a456-426614174000'); // Type: EntityId<any>
```

**API**:
- `EntityId.create<T>()`: Create a new unique identifier
- `EntityId.fromString(id: string)`: Create from existing UUID string
- `.toString()`: Get the UUID as a string
- `.equals(other: EntityId)`: Compare two identifiers

### AggregateRoot

Base class for domain aggregates with event sourcing support.

```typescript
import { AggregateRoot, EntityId, DomainEvent } from '@stratix/primitives';

type UserId = EntityId<'User'>;

class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super();
  }
}

class User extends AggregateRoot<'User'> {
  private constructor(
    id: UserId,
    private _email: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get email(): string {
    return this._email;
  }

  updateEmail(email: string): void {
    this._email = email;
    this.touch(); // Updates updatedAt timestamp
  }

  static create(email: string): User {
    const now = new Date();
    const id = EntityId.create<'User'>();
    const user = new User(id, email, now, now);
    user.record(new UserCreatedEvent(id.toString(), email));
    return user;
  }
}
```

**Properties**:
- `id: EntityId<T>`: Unique identifier
- `createdAt: Date`: Creation timestamp
- `updatedAt: Date`: Last update timestamp

**Methods**:
- `record(event: DomainEvent)`: Record a domain event
- `pullDomainEvents()`: Get and clear all recorded events
- `touch()`: Update the updatedAt timestamp

### ValueObject

Base class for immutable value objects with structural equality.

```typescript
import { ValueObject } from '@stratix/primitives';

interface MoneyProps {
  amount: number;
  currency: string;
}

class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money({ amount: this.amount + other.amount, currency: this.currency });
  }

  static create(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    return new Money({ amount, currency });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.props.amount, this.props.currency];
  }
}
```

**Methods**:
- `equals(other: ValueObject)`: Structural equality comparison
- `getEqualityComponents()`: Override to define equality logic

## Result Pattern

Explicit error handling without exceptions.

```typescript
import { Result, Success, Failure } from '@stratix/primitives';

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Failure.create(new Error('Division by zero'));
  }
  return Success.create(a / b);
}

const result = divide(10, 2);

if (result.isSuccess) {
  console.log(result.value); // 5
} else {
  console.error(result.error.message);
}
```

**API**:
- `Success.create<T>(value: T)`: Create a success result
- `Failure.create(error: Error)`: Create a failure result
- `result.isSuccess`: Check if result is successful
- `result.isFailure`: Check if result is a failure
- `result.value`: Get the value (only available on success)
- `result.error`: Get the error (only available on failure)

## Domain Events

```typescript
import { DomainEvent } from '@stratix/primitives';

class OrderPlacedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number
  ) {
    super();
  }
}

// Domain events have an occurredAt timestamp automatically set
const event = new OrderPlacedEvent('order-1', 'customer-1', 100);
console.log(event.occurredAt); // Date
```

## Built-in Value Objects

### Money

```typescript
import { Money } from '@stratix/primitives';

const usd = Money.USD(100); // $100.00
const eur = Money.EUR(50);  // €50.00

const total = usd.add(Money.USD(50)); // $150.00
const doubled = usd.multiply(2);      // $200.00
```

### Email

```typescript
import { Email } from '@stratix/primitives';

const email = Email.create('user@example.com');
console.log(email.value); // 'user@example.com'

// Validation happens in create()
Email.create('invalid-email'); // throws Error
```

## See Also

- [Entities Guide](../../core-concepts/entities.md)
- [Value Objects Guide](../../core-concepts/value-objects.md)
- [DDD Patterns](../../core-concepts/architecture.md)
