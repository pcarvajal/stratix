# @stratix/primitives

Building blocks for domain-driven design in TypeScript.

## Installation

```bash
pnpm add @stratix/primitives
```

## What's Included

- **Entity** - Base class with identity and timestamps
- **AggregateRoot** - Entity with domain event support
- **ValueObject** - Immutable value objects
- **EntityId** - Type-safe identifiers with phantom types
- **Result** - Type-safe error handling without exceptions
- **AIAgent** - Base class for AI agents as domain entities
- **Value Objects** - Money, Email, Currency, PhoneNumber

## Quick Example

```typescript
import { Entity, EntityId } from '@stratix/primitives';

type UserId = EntityId<'User'>;

class User extends Entity<'User'> {
  constructor(
    id: UserId,
    private email: string,
    private name: string
  ) {
    super(id, new Date(), new Date());
  }

  changeName(newName: string): void {
    this.name = newName;
    this.touch();
  }
}

const userId = EntityId.create<'User'>();
const user = new User(userId, 'user@example.com', 'John');
```

## Result Pattern

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

## AI Agent Base Class

```typescript
import { AIAgent, AgentResult } from '@stratix/primitives';

class MyAgent extends AIAgent<InputType, OutputType> {
  readonly name = 'My Agent';

  async execute(input: InputType): Promise<AgentResult<OutputType>> {
    // Implementation
    return AgentResult.success(output);
  }
}
```

## Value Objects

```typescript
import { Money, Currency } from '@stratix/primitives';

const price = Money.create(99.99, Currency.USD);
const discounted = price.multiply(0.8); // $79.99

console.log(price.format()); // "$99.99"
```

## License

MIT
