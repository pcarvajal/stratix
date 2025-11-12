# @stratix/primitives

Building blocks for domain-driven design in TypeScript.

## Installation

```bash
pnpm add @stratix/primitives
```

## What's Included

### Core Building Blocks

- **Entity** - Base class with identity and timestamps
- **AggregateRoot** - Entity with domain event support
- **ValueObject** - Immutable value objects base class
- **EntityId** - Type-safe identifiers with phantom types
- **Result** - Type-safe error handling without exceptions
- **DomainEvent** - Base interface for domain events
- **DomainError** - Base class for domain errors

### AI Agent Building Blocks

- **AIAgent** - Base class for AI agents as domain entities
- **StratixTool** - Base class for agent tools
- **LLMProvider** - Interface for LLM provider implementations
- **MemoryStore** - Interface for agent memory persistence

### Pre-built Value Objects

- **Money** - Monetary values with currency support
- **Currency** - ISO 4217 currency codes with metadata
- **Email** - Email address validation
- **PhoneNumber** - International phone numbers with country calling codes
- **URL** - URL validation and parsing
- **UUID** - UUID v4 generation and validation
- **DateRange** - Date ranges with validation
- **Percentage** - Percentage values (0-100)
- **Address** - Physical addresses with country support
- **CountryRegistry** - ISO 3166-1 country codes and metadata
- **CountryCallingCodeRegistry** - International dialing codes

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

### Money and Currency

```typescript
import { Money, Currency } from '@stratix/primitives';

const price = Money.create(99.99, Currency.USD);
const discounted = price.multiply(0.8); // $79.99
const total = price.add(discounted); // $179.99

console.log(price.format()); // "$99.99"
console.log(Currency.EUR.symbol); // "€"
```

### Email and URL

```typescript
import { Email, URL } from '@stratix/primitives';

const email = Email.create('user@example.com');
console.log(email.domain); // "example.com"

const url = URL.create('https://example.com/path');
console.log(url.protocol); // "https"
```

### PhoneNumber with Country Codes

```typescript
import { PhoneNumber } from '@stratix/primitives';

const phone = PhoneNumber.create('+1', '4155552671');
console.log(phone.format()); // "+1 415-555-2671"
console.log(phone.countryCode); // "+1"
```

### Date Ranges and Percentages

```typescript
import { DateRange, Percentage } from '@stratix/primitives';

const range = DateRange.create(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
console.log(range.durationInDays()); // 366

const discount = Percentage.create(15);
const finalPrice = price.multiply(discount.asDecimalComplement()); // 85% of price
```

### UUID Generation

```typescript
import { UUID } from '@stratix/primitives';

const id = UUID.generate();
console.log(id.value); // "550e8400-e29b-41d4-a716-446655440000"
```

## API Reference

For detailed API documentation, visit [Stratix Documentation](https://github.com/pcarvajal/stratix).

## License

MIT
