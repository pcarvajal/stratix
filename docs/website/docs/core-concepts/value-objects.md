# Value Objects

Value Objects are immutable objects that represent descriptive aspects of your domain with no conceptual identity.

## What is a Value Object?

A **Value Object** is defined by its attributes, not by an identity. Two value objects with the same attributes are considered equal.

### Key Characteristics

1. **Immutable**: Once created, values cannot be changed
2. **No Identity**: Equality is based on values, not ID
3. **Self-Validating**: Validation happens at creation time
4. **Side-Effect Free**: Methods don't modify state, they return new instances

## Creating Value Objects

### Basic Value Object

```typescript
import { ValueObject } from '@stratix/core';

interface EmailProps {
  value: string;
}

class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  static create(email: string): Result<Email, DomainError> {
    // Validation
    if (!email || email.trim().length === 0) {
      return Failure.create(new DomainError('EMPTY_EMAIL', 'Email cannot be empty'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Failure.create(new DomainError('INVALID_EMAIL_FORMAT', 'Invalid email format'));
    }

    return Success.create(new Email({ value: email.toLowerCase().trim() }));
  }

  equals(other: Email): boolean {
    return this.props.value === other.props.value;
  }
}
```

### Usage

```typescript
// Create email
const emailResult = Email.create('john@example.com');

if (!emailResult.isSuccess) {
  console.error(emailResult.error.message);
  return;
}

const email = emailResult.value;
console.log(email.value); // 'john@example.com'

// Equality
const email1 = Email.create('john@example.com').value;
const email2 = Email.create('john@example.com').value;

email1.equals(email2); // true
email1 === email2;     // false (different instances)
```

## Built-in Value Objects

Stratix provides production-ready value objects with validation and rich behavior:

### Money

Monetary values with currency support and arithmetic operations.

```typescript
import { Money, Currency } from '@stratix/core';

const price = Money.create(99.99, Currency.USD);
const tax = Money.create(10.00, Currency.USD);

const total = price.add(tax); // Money { amount: 109.99, currency: USD }
console.log(total.format()); // '$109.99'
console.log(total.isGreaterThan(price)); // true

const discount = price.multiply(0.1); // Money { amount: 9.99, currency: USD }

// Currency validation
const usd = Money.create(100, Currency.USD);
const eur = Money.create(100, Currency.EUR);

const mixed = usd.add(eur); // Throws error: Cannot add EUR to USD
```

### Currency

ISO 4217 currency codes with metadata.

```typescript
import { Currency } from '@stratix/core';

console.log(Currency.USD.code); // "USD"
console.log(Currency.USD.symbol); // "$"
console.log(Currency.USD.name); // "United States Dollar"
console.log(Currency.USD.decimalPlaces); // 2

console.log(Currency.EUR.symbol); // "€"
console.log(Currency.JPY.decimalPlaces); // 0
```

### Email

Email address validation with domain extraction.

```typescript
import { Email } from '@stratix/core';

const email = Email.create('user@example.com');
console.log(email.value); // 'user@example.com'
console.log(email.domain); // 'example.com'
console.log(email.localPart); // 'user'

// Validation
Email.create('invalid-email'); // Throws validation error
```

### PhoneNumber

International phone numbers with country calling codes.

```typescript
import { PhoneNumber } from '@stratix/core';

const phone = PhoneNumber.create('+1', '4155552671');
console.log(phone.format()); // "+1 415-555-2671"
console.log(phone.countryCode); // "+1"
console.log(phone.nationalNumber); // "4155552671"
```

### URL

URL validation and parsing.

```typescript
import { URL } from '@stratix/core';

const url = URL.create('https://example.com/path?query=value');
console.log(url.protocol); // "https"
console.log(url.domain); // "example.com"
console.log(url.path); // "/path"
console.log(url.queryString); // "query=value"
```

### UUID

UUID v4 generation and validation.

```typescript
import { UUID } from '@stratix/core';

const id = UUID.generate();
console.log(id.value); // "550e8400-e29b-41d4-a716-446655440000"

const parsed = UUID.create('550e8400-e29b-41d4-a716-446655440000');
console.log(UUID.isValid('550e8400-e29b-41d4-a716-446655440000')); // true
console.log(UUID.isValid('invalid')); // false
```

### DateRange

Date ranges with overlap detection and duration calculations.

```typescript
import { DateRange } from '@stratix/core';

const range = DateRange.create(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(range.durationInDays()); // 366
console.log(range.contains(new Date('2024-06-15'))); // true
console.log(range.overlaps(otherRange)); // boolean

// Create from now
const nextWeek = DateRange.fromNow(7); // 7 days from today
```

### Percentage

Percentage values with validation and conversion support.

```typescript
import { Percentage } from '@stratix/core';

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

// Apply to number
const applyResult = discount.applyTo(100);
if (applyResult.isSuccess) {
  console.log(applyResult.value); // 15 (15% of 100)
}

// Validation
const invalid = Percentage.fromPercentage(150);
console.log(invalid.isFailure); // true
```

### Address

Physical addresses with country support.

```typescript
import { Address } from '@stratix/core';

const address = Address.create({
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'US'
});

console.log(address.street); // "123 Main St"
console.log(address.city); // "San Francisco"
console.log(address.format()); // "123 Main St, San Francisco, CA 94105, US"
```

### EntityId

Type-safe entity identifiers using phantom types.

```typescript
import { EntityId } from '@stratix/core';

type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;

const userId = EntityId.create<'User'>();
console.log(userId.toString()); // "550e8400-e29b-41d4-a716-446655440000"

const orderId = EntityId.fromString<'Order'>('550e8400-e29b-41d4-a716-446655440000');

// Type-safe - cannot mix different entity types
function processUser(id: UserId) { }
processUser(userId); // OK
processUser(orderId); // TypeScript error
```

## Creating Custom Value Objects

While Stratix provides many built-in value objects, you can create your own for domain-specific concepts.

### Complex Value Object: Price

A price that includes tax calculations and discount support.

```typescript
import { ValueObject } from '@stratix/core';
import { Money, Currency, Percentage } from '@stratix/core';

interface PriceProps {
  baseAmount: Money;
  taxRate: Percentage;
  discount?: Percentage;
}

class Price extends ValueObject<PriceProps> {
  get baseAmount(): Money {
    return this.props.baseAmount;
  }

  get taxRate(): Percentage {
    return this.props.taxRate;
  }

  get discount(): Percentage | undefined {
    return this.props.discount;
  }

  get taxAmount(): Money {
    return this.props.baseAmount.multiply(this.props.taxRate.asDecimal());
  }

  get discountAmount(): Money {
    if (!this.props.discount) {
      return Money.create(0, this.props.baseAmount.currency);
    }
    return this.props.baseAmount.multiply(this.props.discount.asDecimal());
  }

  get total(): Result<Money, DomainError> {
    const afterDiscountResult = this.props.baseAmount.subtract(this.discountAmount);
    if (afterDiscountResult.isFailure) {
      return afterDiscountResult;
    }

    return afterDiscountResult.value.add(this.taxAmount);
  }

  static create(
    baseAmount: Money,
    taxRate: Percentage,
    discount?: Percentage
  ): Price {
    return new Price({ baseAmount, taxRate, discount });
  }

  applyDiscount(discount: Percentage): Price {
    return new Price({
      baseAmount: this.props.baseAmount,
      taxRate: this.props.taxRate,
      discount
    });
  }

  protected getEqualityComponents(): unknown[] {
    return [
      this.props.baseAmount,
      this.props.taxRate,
      this.props.discount
    ];
  }
}

// Usage
const baseAmount = Money.create(100, Currency.USD);
const taxRate = Percentage.fromPercentage(8.5); // 8.5% tax

if (baseAmount.isSuccess && taxRate.isSuccess) {
  const price = Price.create(baseAmount.value, taxRate.value);
  const totalResult = price.total;

  if (totalResult.isSuccess) {
    console.log(totalResult.value.format()); // "$108.50"
  }

  const discount = Percentage.fromPercentage(10);
  if (discount.isSuccess) {
    const discounted = price.applyDiscount(discount.value);
    const discountedTotal = discounted.total;

    if (discountedTotal.isSuccess) {
      console.log(discountedTotal.value.format()); // "$97.65" (10% off, then tax)
    }
  }
}
```

### Composite Value Object: Name

```typescript
interface NameProps {
  firstName: string;
  lastName: string;
  middleName?: string;
}

class Name extends ValueObject<NameProps> {
  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get middleName(): string | undefined {
    return this.props.middleName;
  }

  get fullName(): string {
    const parts = [this.props.firstName];
    if (this.props.middleName) {
      parts.push(this.props.middleName);
    }
    parts.push(this.props.lastName);
    return parts.join(' ');
  }

  get initials(): string {
    const first = this.props.firstName[0];
    const last = this.props.lastName[0];
    return `${first}${last}`.toUpperCase();
  }

  static create(props: NameProps): Result<Name, DomainError> {
    if (!props.firstName || props.firstName.trim().length === 0) {
      return Failure.create(new DomainError('EMPTY_FIRST_NAME', 'First name is required'));
    }

    if (!props.lastName || props.lastName.trim().length === 0) {
      return Failure.create(new DomainError('EMPTY_LAST_NAME', 'Last name is required'));
    }

    return Success.create(new Name({
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),
      middleName: props.middleName?.trim()
    }));
  }

  equals(other: Name): boolean {
    return (
      this.props.firstName === other.props.firstName &&
      this.props.lastName === other.props.lastName &&
      this.props.middleName === other.props.middleName
    );
  }
}
```

## Value Objects vs Entities

| Aspect | Value Object | Entity |
|--------|--------------|--------|
| **Identity** | No identity | Has unique ID |
| **Equality** | Based on values | Based on ID |
| **Mutability** | Immutable | Mutable |
| **Lifecycle** | Created and discarded | Tracked over time |
| **Examples** | Email, Money, Address | User, Order, Product |

### When to Use Value Objects

Use Value Objects when:
- The object represents a measurement, quantity, or description
- Equality is based on values, not identity
- You don't need to track changes over time
- Immutability is desirable

```typescript
// Good: Email as Value Object
class Email extends ValueObject<EmailProps> { }

// Bad: Email as Entity
class Email extends Entity<EmailProps, EmailId> { } // Email doesn't need an ID
```

### When to Use Entities

Use Entities when:
- The object has a lifecycle that you need to track
- Identity matters more than attributes
- The object changes over time

```typescript
// Good: User as Entity
class User extends Entity<UserProps, UserId> { }

// Bad: User as Value Object
class User extends ValueObject<UserProps> { } // User needs an ID
```

## Value Object Patterns

### 1. Validation at Creation

Always validate in the factory method:

```typescript
class Age extends ValueObject<{ value: number }> {
  static create(age: number): Result<Age, DomainError> {
    if (age < 0) {
      return Failure.create(new DomainError('NEGATIVE_AGE', 'Age cannot be negative'));
    }

    if (age > 150) {
      return Failure.create(new DomainError('UNREALISTIC_AGE', 'Age is not realistic'));
    }

    return Success.create(new Age({ value: age }));
  }
}
```

### 2. Transformation Methods

Return new instances instead of modifying:

```typescript
class Temperature extends ValueObject<{ celsius: number }> {
  get celsius(): number {
    return this.props.celsius;
  }

  get fahrenheit(): number {
    return (this.celsius * 9/5) + 32;
  }

  add(degrees: number): Temperature {
    return new Temperature({ celsius: this.celsius + degrees });
  }

  toFahrenheit(): Temperature {
    return new Temperature({ celsius: this.celsius });
  }
}
```

### 3. Rich Behavior

Add domain logic to value objects:

```typescript
class PhoneNumber extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  get areaCode(): string {
    return this.value.substring(0, 3);
  }

  get localNumber(): string {
    return this.value.substring(3);
  }

  format(): string {
    return `(${this.areaCode}) ${this.localNumber.substring(0, 3)}-${this.localNumber.substring(3)}`;
  }

  canReceiveSMS(): boolean {
    // Business logic
    return this.areaCode !== '800'; // Toll-free numbers can't receive SMS
  }

  static create(phone: string): Result<PhoneNumber, DomainError> {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length !== 10) {
      return Failure.create(new DomainError('INVALID_PHONE_LENGTH', 'Phone number must be 10 digits'));
    }

    return Success.create(new PhoneNumber({ value: cleaned }));
  }
}
```

## Testing Value Objects

```typescript
import { describe, it, expect } from 'vitest';

describe('Email', () => {
  it('should create valid email', () => {
    const result = Email.create('user@example.com');

    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('user@example.com');
  });

  it('should reject invalid email', () => {
    const result = Email.create('invalid-email');

    expect(result.isSuccess).toBe(false);
    expect(result.error.message).toBe('Invalid email format');
  });

  it('should normalize email', () => {
    const result = Email.create('  USER@EXAMPLE.COM  ');

    expect(result.value.value).toBe('user@example.com');
  });

  it('should compare emails by value', () => {
    const email1 = Email.create('user@example.com').value;
    const email2 = Email.create('user@example.com').value;

    expect(email1.equals(email2)).toBe(true);
  });
});

describe('Money', () => {
  it('should add money of same currency', () => {
    const price = Money.USD(10);
    const tax = Money.USD(2);

    const result = price.add(tax);

    expect(result.isSuccess).toBe(true);
    expect(result.value.amount).toBe(12);
    expect(result.value.currency.code).toBe('USD');
  });

  it('should not add different currencies', () => {
    const usd = Money.USD(10);
    const eur = Money.EUR(10);

    const result = usd.add(eur);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('Cannot add');
  });

  it('should format money', () => {
    const price = Money.USD(99.99);

    expect(price.format()).toBe('$99.99');
  });
});
```

## Best Practices

### 1. Make Value Objects Immutable

```typescript
// Good: Immutable
class Email extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }
}

// Bad: Mutable
class Email extends ValueObject<{ value: string }> {
  setValue(value: string): void {
    this.props.value = value; // Don't mutate!
  }
}
```

### 2. Use Factory Methods

```typescript
// Good: Factory method with validation
static create(email: string): Result<Email, DomainError> {
  // validation...
  return Success.create(new Email({ value: email }));
}

// Bad: Direct constructor
const email = new Email({ value: 'unchecked@example.com' });
```

### 3. Express Domain Concepts

```typescript
// Good: Domain concept
class OrderTotal extends ValueObject<{ amount: Money }> {
  includesTax(): boolean {
    return this.amount.isGreaterThan(Money.USD(0));
  }
}

// Bad: Primitive obsession
let orderTotal: number = 99.99;
```

## Next Steps

- [Entities & Aggregates](./entities.md) - Learn about entities
- [CQRS](./cqrs.md) - Commands and queries
- [Architecture](./architecture.md) - Understand the plugin system
