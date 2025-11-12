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
import { ValueObject } from '@stratix/primitives';

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

Stratix provides rich value objects out of the box:

### Email

```typescript
import { Email } from '@stratix/primitives';

const email = Email.create('user@example.com').value;
console.log(email.value);        // 'user@example.com'
console.log(email.domain);       // 'example.com'
console.log(email.localPart);    // 'user'
```

### Money

```typescript
import { Money } from '@stratix/primitives';

const price = Money.USD(99.99);
const tax = Money.USD(10.00);

const totalResult = price.add(tax);     // Result<Money, DomainError>
if (totalResult.isSuccess) {
  const total = totalResult.value;      // Money { amount: 109.99, currency: 'USD' }
  console.log(total.format());          // '$109.99'
  console.log(total.isGreaterThan(price)); // true
}

const discount = price.multiply(0.1);   // Money { amount: 9.99, currency: 'USD' }

// Currency validation
const usd = Money.USD(100);
const eur = Money.EUR(100);

const result = usd.add(eur);            // Result with error
if (result.isFailure) {
  console.log(result.error.message);    // 'Cannot add EUR to USD'
}
```

### DateRange

```typescript
import { DateRange } from '@stratix/primitives';

const start = new Date('2025-01-01');
const end = new Date('2025-12-31');

const range = DateRange.create(start, end).value;

console.log(range.contains(new Date('2025-06-15'))); // true
console.log(range.durationInDays());                 // 365
console.log(range.overlaps(otherRange));             // boolean
```

### EntityId

```typescript
import { EntityId } from '@stratix/primitives';

type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;

const userId = EntityId.create<'User'>();
console.log(userId.toString()); // 'usr_1a2b3c4d5e6f'

const orderId = EntityId.fromString<'Order'>('ord_abc123');
console.log(orderId.toString()); // 'ord_abc123'

// Type-safe - cannot compare different entity types
userId.equals(orderId); // TypeScript error
```

## Advanced Value Objects

### Complex Value Object: Address

```typescript
interface AddressProps {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

class Address extends ValueObject<AddressProps> {
  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get zipCode(): string {
    return this.props.zipCode;
  }

  get country(): string {
    return this.props.country;
  }

  static create(props: AddressProps): Result<Address, DomainError> {
    // Validate all fields
    if (!props.street || props.street.trim().length === 0) {
      return Failure.create(new DomainError('EMPTY_STREET', 'Street is required'));
    }

    if (!props.city || props.city.trim().length === 0) {
      return Failure.create(new DomainError('EMPTY_CITY', 'City is required'));
    }

    if (!props.zipCode || !/^\d{5}(-\d{4})?$/.test(props.zipCode)) {
      return Failure.create(new DomainError('INVALID_ZIP_CODE', 'Invalid zip code'));
    }

    return Success.create(new Address(props));
  }

  format(): string {
    return `${this.props.street}, ${this.props.city}, ${this.props.state} ${this.props.zipCode}, ${this.props.country}`;
  }

  equals(other: Address): boolean {
    return (
      this.props.street === other.props.street &&
      this.props.city === other.props.city &&
      this.props.state === other.props.state &&
      this.props.zipCode === other.props.zipCode &&
      this.props.country === other.props.country
    );
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
