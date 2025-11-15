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

Stratix provides production-ready value objects with validation and rich behavior.

### Money

Monetary values with currency support and arithmetic operations.

```typescript
import { Money, Currency } from '@stratix/primitives';

const price = Money.create(99.99, Currency.USD);
const discounted = price.multiply(0.8); // $79.99
const total = price.add(discounted); // $179.99

console.log(price.format()); // "$99.99"
console.log(Currency.EUR.symbol); // "€"
```

### Currency

ISO 4217 currency codes with metadata.

```typescript
import { Currency } from '@stratix/primitives';

console.log(Currency.USD.code); // "USD"
console.log(Currency.USD.symbol); // "$"
console.log(Currency.USD.name); // "United States Dollar"
console.log(Currency.USD.decimalPlaces); // 2
```

### Email

Email address validation with domain extraction.

```typescript
import { Email } from '@stratix/primitives';

const email = Email.create('user@example.com');
console.log(email.value); // 'user@example.com'
console.log(email.domain); // 'example.com'
console.log(email.localPart); // 'user'
```

### PhoneNumber

International phone numbers with country calling codes.

```typescript
import { PhoneNumber } from '@stratix/primitives';

const phone = PhoneNumber.create('+1', '4155552671');
console.log(phone.format()); // "+1 415-555-2671"
console.log(phone.countryCode); // "+1"
```

### URL

URL validation and parsing.

```typescript
import { URL } from '@stratix/primitives';

const url = URL.create('https://example.com/path');
console.log(url.protocol); // "https"
console.log(url.domain); // "example.com"
console.log(url.path); // "/path"
```

### UUID

UUID v4 generation and validation.

```typescript
import { UUID } from '@stratix/primitives';

const id = UUID.generate();
console.log(id.value); // "550e8400-e29b-41d4-a716-446655440000"

const parsed = UUID.create('550e8400-e29b-41d4-a716-446655440000');
console.log(UUID.isValid('invalid')); // false
```

### DateRange

Date ranges with overlap detection and duration calculations.

```typescript
import { DateRange } from '@stratix/primitives';

const range = DateRange.create(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(range.durationInDays()); // 366
console.log(range.contains(new Date('2024-06-15'))); // true
console.log(range.overlaps(otherRange)); // boolean
```

### Percentage

Percentage values with validation and conversion support.

```typescript
import { Percentage } from '@stratix/primitives';

const discountResult = Percentage.fromPercentage(15); // 15%
if (discountResult.isSuccess) {
  const discount = discountResult.value;
  console.log(discount.asPercentage()); // 15
  console.log(discount.asDecimal()); // 0.15
  console.log(discount.format()); // "15%"
}

// From decimal
const taxResult = Percentage.fromDecimal(0.085); // 8.5%
if (taxResult.isSuccess) {
  console.log(taxResult.value.asPercentage()); // 8.5
}
```

### Address

Physical addresses with country support.

```typescript
import { Address } from '@stratix/primitives';

const address = Address.create({
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'US'
});

console.log(address.format()); // "123 Main St, San Francisco, CA 94105, US"
```

## AI Agent Building Blocks

Stratix treats AI agents as first-class domain entities with their own base classes and supporting infrastructure.

### AIAgent

Base class for building AI agents as aggregate roots.

```typescript
import { AIAgent, AgentResult, AgentCapabilities } from '@stratix/primitives';
import type { AgentVersion, AgentCapability, ModelConfig } from '@stratix/primitives';

class CustomerSupportAgent extends AIAgent<SupportTicket, SupportResponse> {
  readonly name = 'Customer Support Agent';
  readonly description = 'Handles customer support tickets';
  readonly version: AgentVersion = { major: 1, minor: 0, patch: 0 };
  readonly capabilities: AgentCapability[] = [AgentCapabilities.CUSTOMER_SUPPORT, 'ticket_routing'];
  readonly model: ModelConfig = {
    provider: 'anthropic',
    model: 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 2000
  };

  async execute(ticket: SupportTicket): Promise<AgentResult<SupportResponse>> {
    // Implementation with LLM provider
    const response = await this.processTicket(ticket);

    return AgentResult.success(response, {
      model: this.model.model,
      cost: 0.02,
      tokensUsed: 1500,
      executionTime: 2500
    });
  }
}
```

### AgentResult

Type-safe result wrapper for agent executions with metadata tracking.

```typescript
import { AgentResult } from '@stratix/primitives';

// Success case
const result = AgentResult.success(
  { response: "Hello!", sentiment: "positive" },
  {
    model: "claude-3-sonnet",
    cost: 0.02,
    tokensUsed: 1500,
    executionTime: 2000
  }
);

if (result.isSuccess()) {
  console.log(result.data); // { response: "Hello!", sentiment: "positive" }
  console.log(result.metadata.cost); // 0.02
}

// Failure case
const failedResult = AgentResult.failure(
  new Error("API timeout"),
  { model: "gpt-4", stage: "execution" }
);

if (failedResult.isFailure()) {
  console.error(failedResult.error.message); // "API timeout"
}
```

### AgentContext

Execution context for agent runs.

```typescript
import type { AgentContext } from '@stratix/primitives';

const context: AgentContext = {
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production',
  metadata: {
    source: 'web',
    priority: 'high'
  }
};
```

### AgentMemory

Interface for agent memory persistence. The interface is in `@stratix/primitives` as it's a domain concept.

**Note:** The `InMemoryAgentMemory` implementation has been moved to `@stratix/impl-ai-agents`.

```typescript
import type { AgentMemory } from '@stratix/primitives';
import { InMemoryAgentMemory } from '@stratix/impl-ai-agents';

// Using the built-in implementation
const memory = new InMemoryAgentMemory();

// Or create a custom implementation
class RedisAgentMemory implements AgentMemory {
  async store(key: string, value: unknown, type: 'short' | 'long'): Promise<void> {
    // Store in Redis
  }

  async retrieve(key: string): Promise<unknown> {
    // Retrieve from Redis
  }

  async search(query: string, limit: number): Promise<unknown[]> {
    // Search in Redis
  }

  async clear(type: 'short' | 'long' | 'all'): Promise<void> {
    // Clear Redis
  }
}
```

### ExecutionTrace

Detailed execution tracing for debugging and observability.

```typescript
import type { ExecutionTrace } from '@stratix/primitives';

const trace: ExecutionTrace = {
  traceId: 'trace-789',
  steps: [
    { name: 'validate-input', duration: 10, success: true },
    { name: 'llm-call', duration: 2000, success: true },
    { name: 'format-response', duration: 5, success: true }
  ],
  totalDuration: 2015,
  success: true
};

const result = AgentResult.success(data, metadata).withTrace(trace);
```

## See Also

- [Entities Guide](../../core-concepts/entities.md)
- [Value Objects Guide](../../core-concepts/value-objects.md)
- [DDD Patterns](../../core-concepts/architecture.md)
