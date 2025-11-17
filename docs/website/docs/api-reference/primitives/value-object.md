---
id: value-object
title: ValueObject
sidebar_label: ValueObject
---

# ValueObject

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Base class for Value Objects in Domain-Driven Design. Value Objects are immutable objects that represent descriptive aspects of the domain with no conceptual identity. Unlike entities, two value objects are considered equal if all their attributes are equal, not based on identity.

Value Objects are fundamental building blocks in DDD for representing concepts like Money, Email, Address, or any domain concept that is defined by its attributes rather than a unique identity. They enforce immutability and provide structural equality out of the box.

**Key Features:**
- Immutable by design (readonly properties)
- Structural equality based on attribute values
- Supports nested value objects
- Handles arrays and complex equality
- Type-safe comparison
- Zero runtime overhead

## Import

```typescript
import { ValueObject } from '@stratix/primitives';
```

## Type Signature

```typescript
abstract class ValueObject {
  protected abstract getEqualityComponents(): unknown[];
  equals(other: ValueObject): boolean;
}
```

## Methods

### getEqualityComponents()

Abstract method that must be implemented by subclasses to return the components used for equality comparison. All components returned by this method will be compared when determining if two value objects are equal.

**Signature:**
```typescript
protected abstract getEqualityComponents(): unknown[]
```

**Returns:**
- `unknown[]`: Array of values used for equality comparison

**Visibility:** Protected (must be implemented by subclasses)

**Example:**
```typescript
class Email extends ValueObject {
  constructor(private readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()]; // Case-insensitive comparison
  }
}
```

### equals()

Compares this Value Object with another for structural equality. Two value objects are equal if they are of the same type and all equality components match.

**Signature:**
```typescript
equals(other: ValueObject): boolean
```

**Parameters:**
- `other` (`ValueObject`): The other value object to compare with

**Returns:**
- `boolean`: true if the value objects are equal, false otherwise

**Example:**
```typescript
const email1 = new Email('user@example.com');
const email2 = new Email('user@example.com');
const email3 = new Email('other@example.com');

console.log(email1.equals(email2)); // true
console.log(email1.equals(email3)); // false
```

## Usage Examples

### Basic Value Object

```typescript
import { ValueObject } from '@stratix/primitives';

class Email extends ValueObject {
  constructor(private readonly value: string) {
    super();
    if (!this.isValid(value)) {
      throw new Error('Invalid email format');
    }
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value.toLowerCase()];
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const email1 = new Email('user@example.com');
const email2 = new Email('USER@example.com'); // Case insensitive
const email3 = new Email('other@example.com');

console.log(email1.equals(email2)); // true (same email, different case)
console.log(email1.equals(email3)); // false (different emails)
```

### Complex Value Object with Multiple Properties

```typescript
class Address extends ValueObject {
  constructor(
    private readonly street: string,
    private readonly city: string,
    private readonly zipCode: string,
    private readonly country: string
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.street, this.city, this.zipCode, this.country];
  }

  // Getters for accessing properties
  getStreet(): string { return this.street; }
  getCity(): string { return this.city; }
  getZipCode(): string { return this.zipCode; }
  getCountry(): string { return this.country; }
}

// Usage
const address1 = new Address('123 Main St', 'New York', '10001', 'USA');
const address2 = new Address('123 Main St', 'New York', '10001', 'USA');
const address3 = new Address('456 Oak Ave', 'New York', '10002', 'USA');

console.log(address1.equals(address2)); // true
console.log(address1.equals(address3)); // false
```

### Nested Value Objects

```typescript
class Money extends ValueObject {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.amount, this.currency];
  }

  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  getAmount(): number { return this.amount; }
  getCurrency(): Currency { return this.currency; }
}

class Currency extends ValueObject {
  constructor(private readonly code: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.code];
  }

  getCode(): string { return this.code; }
}

// Usage
const usd = new Currency('USD');
const eur = new Currency('EUR');

const price1 = new Money(100, usd);
const price2 = new Money(100, usd);
const price3 = new Money(100, eur);

console.log(price1.equals(price2)); // true (same amount and currency)
console.log(price1.equals(price3)); // false (different currencies)
```

### Advanced: Value Object with Arrays

```typescript
class Tags extends ValueObject {
  constructor(private readonly values: readonly string[]) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.values];
  }

  has(tag: string): boolean {
    return this.values.includes(tag);
  }

  add(tag: string): Tags {
    if (this.has(tag)) {
      return this;
    }
    return new Tags([...this.values, tag]);
  }

  getValues(): readonly string[] {
    return this.values;
  }
}

// Usage
const tags1 = new Tags(['typescript', 'ddd', 'clean-code']);
const tags2 = new Tags(['typescript', 'ddd', 'clean-code']);
const tags3 = new Tags(['typescript', 'ddd']);

console.log(tags1.equals(tags2)); // true
console.log(tags1.equals(tags3)); // false

// Immutability: adding returns new instance
const tags4 = tags1.add('testing');
console.log(tags1.equals(tags4)); // false (tags1 unchanged)
```

### Integration Example: Using Value Objects in Entities

```typescript
import { Entity, EntityId } from '@stratix/primitives';

class User extends Entity<'User'> {
  private constructor(
    id: EntityId<'User'>,
    private readonly email: Email,
    private readonly address: Address,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(email: string, address: Address): User {
    return new User(
      EntityId.create<'User'>(),
      new Email(email),
      address,
      new Date(),
      new Date()
    );
  }

  changeAddress(newAddress: Address): void {
    if (this.address.equals(newAddress)) {
      return; // No change needed
    }
    // In real implementation, create new User instance or use mutable pattern
    this.touch();
  }

  getEmail(): Email {
    return this.email;
  }

  getAddress(): Address {
    return this.address;
  }
}
```

## Best Practices

- **Do:** Make all properties readonly to enforce immutability
- **Do:** Validate input in the constructor and throw if invalid
- **Do:** Implement getters for accessing internal properties
- **Do:** Return new instances for "modification" operations (immutability)
- **Do:** Use value objects for domain concepts without identity
- **Don't:** Expose mutable properties or setters
- **Don't:** Use value objects for things that need identity (use Entity instead)
- **Don't:** Perform expensive computations in getEqualityComponents()
- **Don't:** Include transient or computed values in equality components

## Common Pitfalls

### Pitfall 1: Mutable Value Objects

**Problem:**
```typescript
// BAD: Mutable value object
class BadMoney extends ValueObject {
  constructor(public amount: number) { // Not readonly!
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.amount];
  }
}

const money = new BadMoney(100);
money.amount = 200; // Mutated! Breaks value object semantics
```

**Solution:**
```typescript
// GOOD: Immutable value object
class GoodMoney extends ValueObject {
  constructor(private readonly amount: number) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.amount];
  }

  add(other: GoodMoney): GoodMoney {
    return new GoodMoney(this.amount + other.amount);
  }

  getAmount(): number {
    return this.amount;
  }
}
```

### Pitfall 2: Missing Validation

**Problem:**
```typescript
// BAD: No validation
class BadEmail extends ValueObject {
  constructor(private readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }
}

const invalid = new BadEmail('not-an-email'); // Accepted!
```

**Solution:**
```typescript
// GOOD: Validate in constructor
class GoodEmail extends ValueObject {
  constructor(private readonly value: string) {
    super();
    if (!this.isValid(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }
}
```

### Pitfall 3: Comparing Wrong Types

**Problem:**
```typescript
const email = new Email('user@example.com');
const address = new Address('123 Main St', 'NYC', '10001', 'USA');

// BAD: Comparing different types (runtime error or false)
email.equals(address as any);
```

**Solution:**
```typescript
// GOOD: Type-safe comparison
if (email instanceof Email && other instanceof Email) {
  email.equals(other); // Type-safe
}

// Or use branded types
type EmailValue = Email & { __brand: 'Email' };
type AddressValue = Address & { __brand: 'Address' };
```

## Value Object Design Guidelines

### When to Use Value Objects

Use Value Objects when:
- The concept has no identity in your domain
- Two instances with the same attributes are interchangeable
- The object is immutable
- Equality is based on attributes, not identity

Examples: Money, Email, Address, DateRange, Percentage

### When NOT to Use Value Objects

Don't use Value Objects when:
- The concept needs a unique identity
- You need to track changes over time
- The object has lifecycle operations

Examples: User, Order, Product (use Entity instead)

### Equality Semantics

Value Objects use structural equality:
```typescript
// Entities: Identity-based equality
const user1 = User.create('john@example.com');
const user2 = User.create('john@example.com');
user1.equals(user2); // false (different IDs)

// Value Objects: Structural equality
const email1 = new Email('john@example.com');
const email2 = new Email('john@example.com');
email1.equals(email2); // true (same value)
```

## Performance Considerations

- Equality comparison is O(n) where n is the number of equality components
- Nested value objects increase comparison complexity
- Arrays in equality components require full array comparison
- Consider caching hash codes for frequently compared value objects
- Immutability enables safe sharing without defensive copying

## Type Safety

ValueObject provides type-safe equality:
```typescript
const email = new Email('user@example.com');
const money = new Money(100, new Currency('USD'));

// TypeScript prevents this at compile time:
// email.equals(money); // Error: Type mismatch

// Runtime check also prevents incorrect comparisons
// Returns false instead of throwing
```

## Built-in Value Objects

Stratix includes several production-ready value objects:

- `Money` - Monetary amounts with currency
- `Email` - Email addresses with validation
- `UUID` - Universally unique identifiers
- `URL` - Web addresses with validation
- `PhoneNumber` - Phone numbers with country codes
- `Address` - Physical addresses
- `DateRange` - Date intervals
- `Percentage` - Percentage values (0-100)
- `Currency` - Currency codes (ISO 4217)
- `CountryCallingCode` - International calling codes

See individual documentation for usage details.

## Related Components

- [Entity](./entity.md) - Identity-based domain objects
- [Money](./money.md) - Built-in money value object
- [Currency](./currency.md) - Built-in currency value object
- [EntityId](./entity-id.md) - Type-safe identifiers

## See Also

- [Package README](../../../packages/primitives/README.md)
- [Core Concepts - Value Objects](../../website/docs/core-concepts/value-objects.md)
- [Built-in Value Objects](../../../packages/primitives/src/value-objects/)

