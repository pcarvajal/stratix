---
id: entity
title: Entity
sidebar_label: Entity
---

# Entity

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Base class for domain entities in Domain-Driven Design. Entities are objects with a distinct identity that persists over time, regardless of changes to their attributes. Two entities are considered equal if they have the same ID, even if their other properties differ.

**Key Features:**
- Unique identity using phantom types for type safety
- Automatic timestamp tracking (createdAt, updatedAt)
- Identity-based equality comparison
- Protected `touch()` method for updating timestamps

## Import

```typescript
import { Entity, EntityId } from '@stratix/primitives';
```

## Type Signature

```typescript
abstract class Entity<T extends string> {
  protected constructor(
    id: EntityId<T>,
    createdAt: Date,
    updatedAt: Date
  );

  get id(): EntityId<T>;
  get createdAt(): Date;
  get updatedAt(): Date;

  protected touch(): void;
  equals(other: Entity<T>): boolean;
}
```

## Constructor

The constructor is `protected` to enforce the factory pattern. Subclasses should provide static factory methods for entity creation.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | `EntityId<T>` | Yes | Unique identifier for the entity |
| createdAt | `Date` | Yes | Timestamp when the entity was created |
| updatedAt | `Date` | Yes | Timestamp when the entity was last updated |

## Properties

### id

**Type:** `EntityId<T>` (readonly)

The unique identifier of the entity. Uses phantom types to prevent mixing IDs of different entity types at compile time.

**Example:**
```typescript
const user = User.create({ name: 'John' });
console.log(user.id); // EntityId<'User'>
```

### createdAt

**Type:** `Date` (readonly)

Timestamp when the entity was first created. This value never changes.

**Example:**
```typescript
const user = User.create({ name: 'John' });
console.log(user.createdAt); // 2025-01-17T10:30:00.000Z
```

### updatedAt

**Type:** `Date` (readonly via getter, mutable internally)

Timestamp when the entity was last modified. Updated automatically when `touch()` is called.

**Example:**
```typescript
const user = User.create({ name: 'John' });
user.changeName('Jane');
console.log(user.updatedAt); // Updated to current time
```

## Methods

### touch()

Updates the `updatedAt` timestamp to the current time. Should be called in any method that modifies the entity's state.

**Signature:**
```typescript
protected touch(): void
```

**Visibility:** Protected (only accessible within subclasses)

**Example:**
```typescript
class User extends Entity<'User'> {
  changeName(newName: string): void {
    this._name = newName;
    this.touch(); // Update timestamp
  }
}
```

### equals()

Compares this entity with another for equality based on identity (ID comparison).

**Signature:**
```typescript
equals(other: Entity<T>): boolean
```

**Parameters:**
- `other` (`Entity<T>`): The other entity to compare with

**Returns:**
- `boolean`: `true` if both entities have the same ID, `false` otherwise

**Example:**
```typescript
const user1 = User.create({ name: 'John' });
const user2 = User.create({ name: 'John' });
const user3 = user1;

user1.equals(user2); // false (different IDs)
user1.equals(user3); // true (same ID)
```

## Usage Examples

### Basic Entity Implementation

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

  changeName(newName: string): void {
    this._name = newName;
    this.touch(); // Update updatedAt timestamp
  }

  changeEmail(newEmail: string): void {
    // Validation logic here
    this._email = newEmail;
    this.touch();
  }
}
```

### Entity with Business Logic

```typescript
import { Entity, EntityId } from '@stratix/primitives';

type ProductId = EntityId<'Product'>;

class Product extends Entity<'Product'> {
  private constructor(
    id: ProductId,
    private _name: string,
    private _price: number,
    private _stock: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(props: { name: string; price: number; stock: number }): Product {
    if (props.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (props.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const id = EntityId.create<'Product'>();
    const now = new Date();
    return new Product(id, props.name, props.price, props.stock, now, now);
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (this._stock < quantity) {
      throw new Error('Insufficient stock');
    }

    this._stock -= quantity;
    this.touch();
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    this._stock += quantity;
    this.touch();
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }

    this._price = newPrice;
    this.touch();
  }

  isAvailable(): boolean {
    return this._stock > 0;
  }

  get stock(): number {
    return this._stock;
  }

  get price(): number {
    return this._price;
  }
}
```

### Reconstituting Entities from Database

```typescript
class User extends Entity<'User'> {
  // ... existing code ...

  // Factory method for reconstituting from database
  static reconstitute(
    id: UserId,
    props: UserProps,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, props.name, props.email, createdAt, updatedAt);
  }
}

// Usage in repository
class UserRepository {
  async findById(id: UserId): Promise<User | null> {
    const row = await db.query('SELECT * FROM users WHERE id = $1', [id.toString()]);
    if (!row) return null;

    return User.reconstitute(
      EntityId.from<'User'>(row.id),
      { name: row.name, email: row.email },
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}
```

## Best Practices

- **Do:** Use private constructors and static factory methods (`create()`)
- **Do:** Call `touch()` in methods that modify state
- **Do:** Use phantom types for EntityId to prevent ID mixing
- **Do:** Make properties private and expose via getters
- **Do:** Validate business rules in factory methods
- **Don't:** Allow entities to be created in invalid states
- **Don't:** Expose setters (use specific business methods instead)
- **Don't:** Forget to call `touch()` after state changes

## Common Pitfalls

### Pitfall 1: Forgetting to Call touch()

**Problem:**
```typescript
class User extends Entity<'User'> {
  changeName(newName: string): void {
    this._name = newName;
    // Forgot to call touch()!
  }
}
```

**Solution:**
```typescript
class User extends Entity<'User'> {
  changeName(newName: string): void {
    this._name = newName;
    this.touch(); // Always update timestamp
  }
}
```

### Pitfall 2: Comparing Entities with ===

**Problem:**
```typescript
const user1 = User.create({ name: 'John' });
const user2 = user1;

if (user1 === user2) { // Works, but...
  // This only works for same reference
}
```

**Solution:**
```typescript
const user1 = User.create({ name: 'John' });
const user2 = await repository.findById(user1.id);

if (user1.equals(user2)) { // Use equals() method
  // This works even if different object instances
}
```

### Pitfall 3: Mixing Entity IDs of Different Types

**Problem (prevented by TypeScript):**
```typescript
type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;

function getUser(id: UserId): User { /* ... */ }

const orderId: OrderId = EntityId.create<'Order'>();
getUser(orderId); // TypeScript error: Type 'OrderId' is not assignable to 'UserId'
```

## Type Safety

Entity uses phantom types to prevent mixing IDs of different entity types:

```typescript
type UserId = EntityId<'User'>;
type ProductId = EntityId<'Product'>;

const userId: UserId = EntityId.create<'User'>();
const productId: ProductId = EntityId.create<'Product'>();

// TypeScript prevents this at compile time:
function assignUserProduct(user: User, productId: UserId) {
  // ...
}

assignUserProduct(user, productId); // Error: ProductId not assignable to UserId
```

## Performance Considerations

- **ID Comparison**: O(1) - uses string comparison internally
- **Memory Overhead**: Minimal - adds 3 properties per instance (id, createdAt, updatedAt)
- **Timestamp Updates**: Very fast - just reassigns Date object

## Related Components

- [EntityId](./entity-id.md) - Typed entity identifiers
- [AggregateRoot](./aggregate-root.md) - Entities that emit domain events
- [ValueObject](./value-object.md) - Objects without identity

## See Also

- [Package README](../../../packages/primitives/README.md)
- [Core Concepts - Entities](../../website/docs/core-concepts/entities.md)

