---
id: entity-id
title: EntityId
sidebar_label: EntityId
---

# EntityId

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Type-safe entity identifier using phantom types to prevent mixing IDs of different entity types at compile time. EntityId extends ValueObject and wraps a UUID string, but the phantom type parameter makes IDs of different entities incompatible in the type system.

This prevents common bugs like passing a UserId where an OrderId is expected, catching these errors at compile time rather than runtime. EntityId is the foundation of type-safe entity identity in Stratix.

**Key Features:**
- Phantom types prevent ID mixing at compile time
- UUID-based unique identifiers
- Extends ValueObject for structural equality
- Zero runtime overhead (type-only phantom)
- Serialization support (toString, toJSON)
- Immutable by design

## Import

```typescript
import { EntityId } from '@stratix/primitives';
```

## Type Signature

```typescript
class EntityId<T extends string> extends ValueObject {
  private readonly _value: string;
  private readonly _brand!: T; // Phantom type

  static create<T extends string>(): EntityId<T>;
  static from<T extends string>(value: string): EntityId<T>;

  get value(): string;
  toString(): string;
  toJSON(): string;
}

// Type aliases for clarity
type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;
```

## Factory Methods

### create()

Creates a new EntityId with a random UUID.

**Signature:**
```typescript
static create<T extends string>(): EntityId<T>
```

**Type Parameters:**
- `T`: The entity type (e.g., 'User', 'Order')

**Returns:**
- `EntityId<T>`: A new EntityId with a random UUID

**Example:**
```typescript
const userId = EntityId.create<'User'>();
console.log(userId.value); // "550e8400-e29b-41d4-a716-446655440000"
```

### from()

Creates an EntityId from an existing string value. Useful when reconstructing entities from persistence.

**Signature:**
```typescript
static from<T extends string>(value: string): EntityId<T>
```

**Type Parameters:**
- `T`: The entity type

**Parameters:**
- `value` (`string`): The string representation of the ID (typically a UUID)

**Returns:**
- `EntityId<T>`: An EntityId instance wrapping the value

**Example:**
```typescript
const userId = EntityId.from<'User'>('550e8400-e29b-41d4-a716-446655440000');
```

## Properties

### value

**Type:** `string` (readonly)

The underlying string value of the EntityId (UUID).

**Example:**
```typescript
const id = EntityId.create<'User'>();
console.log(id.value); // "550e8400-e29b-41d4-a716-446655440000"
```

## Methods

### toString()

Returns the string representation of this EntityId.

**Signature:**
```typescript
toString(): string
```

**Returns:**
- `string`: The UUID string

**Example:**
```typescript
const id = EntityId.create<'User'>();
console.log(id.toString()); // "550e8400-e29b-41d4-a716-446655440000"
```

### toJSON()

Returns the JSON representation of this EntityId for serialization.

**Signature:**
```typescript
toJSON(): string
```

**Returns:**
- `string`: The UUID string

**Example:**
```typescript
const id = EntityId.create<'User'>();
JSON.stringify({ id }); // {"id":"550e8400-e29b-41d4-a716-446655440000"}
```

## Usage Examples

### Basic Type Safety

```typescript
import { EntityId } from '@stratix/primitives';

// Define type aliases for clarity
type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;

// Create IDs
const userId: UserId = EntityId.create<'User'>();
const orderId: OrderId = EntityId.create<'Order'>();

// Type-safe function
function getUser(id: UserId): User {
  // Implementation
}

getUser(userId);   // ✓ OK
getUser(orderId);  // ✗ Compile error: Type 'OrderId' is not assignable to type 'UserId'
```

### Entity with Typed ID

```typescript
import { Entity, EntityId } from '@stratix/primitives';

type UserId = EntityId<'User'>;

class User extends Entity<'User'> {
  private constructor(
    id: UserId,
    private name: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(name: string): User {
    const id = EntityId.create<'User'>();
    const now = new Date();
    return new User(id, name, now, now);
  }

  static reconstitute(id: string, name: string, createdAt: Date, updatedAt: Date): User {
    return new User(
      EntityId.from<'User'>(id),
      name,
      createdAt,
      updatedAt
    );
  }

  getName(): string {
    return this.name;
  }
}

// Usage
const user = User.create('John Doe');
console.log(user.id.value); // UUID string
```

### Repository with Typed IDs

```typescript
import { EntityId, Result, Success, Failure } from '@stratix/primitives';

type UserId = EntityId<'User'>;

interface UserRepository {
  findById(id: UserId): Promise<Result<User, Error>>;
  save(user: User): Promise<Result<void, Error>>;
  delete(id: UserId): Promise<Result<void, Error>>;
}

class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findById(id: UserId): Promise<Result<User, Error>> {
    const user = this.users.get(id.value);
    if (!user) {
      return Failure.create(new Error('User not found'));
    }
    return Success.create(user);
  }

  async save(user: User): Promise<Result<void, Error>> {
    this.users.set(user.id.value, user);
    return Success.create(undefined);
  }

  async delete(id: UserId): Promise<Result<void, Error>> {
    this.users.delete(id.value);
    return Success.create(undefined);
  }
}

// Usage - type safety enforced
const userId = EntityId.create<'User'>();
const result = await repository.findById(userId); // ✓ OK

const orderId = EntityId.create<'Order'>();
// repository.findById(orderId); // ✗ Compile error
```

### Advanced: Multiple Entity Types

```typescript
import { EntityId, AggregateRoot } from '@stratix/primitives';

// Define all entity ID types
type OrderId = EntityId<'Order'>;
type CustomerId = EntityId<'Customer'>;
type ProductId = EntityId<'Product'>;
type OrderItemId = EntityId<'OrderItem'>;

class Order extends AggregateRoot<'Order'> {
  private items: OrderItem[] = [];

  private constructor(
    id: OrderId,
    private customerId: CustomerId, // Reference to Customer
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(customerId: CustomerId): Order {
    const id = EntityId.create<'Order'>();
    const now = new Date();
    return new Order(id, customerId, now, now);
  }

  addItem(productId: ProductId, quantity: number): void {
    const item = OrderItem.create(
      EntityId.create<'OrderItem'>(),
      this.id,      // OrderId
      productId,    // ProductId
      quantity
    );
    this.items.push(item);
    this.touch();
  }

  getCustomerId(): CustomerId {
    return this.customerId;
  }
}

class OrderItem {
  constructor(
    private id: OrderItemId,
    private orderId: OrderId,
    private productId: ProductId,
    private quantity: number
  ) {}

  static create(
    id: OrderItemId,
    orderId: OrderId,
    productId: ProductId,
    quantity: number
  ): OrderItem {
    return new OrderItem(id, orderId, productId, quantity);
  }
}

// Usage - all IDs type-checked
const customerId = EntityId.create<'Customer'>();
const productId = EntityId.create<'Product'>();

const order = Order.create(customerId);
order.addItem(productId, 2);

// Type errors caught at compile time:
// order.addItem(customerId, 2);  // ✗ Error: CustomerId is not ProductId
// order.addItem(order.id, 2);    // ✗ Error: OrderId is not ProductId
```

### Integration with Command Bus

```typescript
import { Command, CommandHandler } from '@stratix/abstractions';
import { EntityId, Result, Success, Failure } from '@stratix/primitives';

type UserId = EntityId<'User'>;

interface DeleteUserCommand extends Command {
  userId: UserId; // Type-safe ID in command
}

class DeleteUserHandler implements CommandHandler<DeleteUserCommand> {
  constructor(private repository: UserRepository) {}

  async execute(command: DeleteUserCommand): Promise<Result<void, Error>> {
    const result = await this.repository.findById(command.userId);
    if (result.isFailure) {
      return result;
    }

    return this.repository.delete(command.userId);
  }
}

// Usage - type safety in command creation
const command: DeleteUserCommand = {
  type: 'DeleteUser',
  userId: EntityId.from<'User'>('550e8400-e29b-41d4-a716-446655440000')
};

const result = await commandBus.execute(command);
```

## Best Practices

- **Do:** Use type aliases for clarity (`type UserId = EntityId<'User'>`)
- **Do:** Use `create()` for new entities, `from()` for reconstitution
- **Do:** Store only the `.value` in databases, reconstruct with `from()`
- **Do:** Use phantom types consistently across your domain
- **Do:** Keep entity type strings singular ('User', not 'Users')
- **Don't:** Mix IDs of different entity types
- **Don't:** Use plain strings for entity IDs
- **Don't:** Expose `.value` in domain logic (use the EntityId directly)
- **Don't:** Create custom ID classes when EntityId suffices

## Common Pitfalls

### Pitfall 1: Using Plain Strings

**Problem:**
```typescript
// BAD: No type safety
class User extends Entity<'User'> {
  constructor(private userId: string) { // Plain string!
    super(EntityId.from<'User'>(userId), new Date(), new Date());
  }
}

function getUser(id: string) { } // Accepts any string

getUser('not-a-valid-id'); // No compile error
getUser(orderId);          // No compile error
```

**Solution:**
```typescript
// GOOD: Type-safe IDs
type UserId = EntityId<'User'>;

class User extends Entity<'User'> {
  private constructor(
    id: UserId,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }
}

function getUser(id: UserId) { } // Only accepts UserId

// getUser('not-a-valid-id'); // ✗ Compile error
// getUser(orderId);           // ✗ Compile error
getUser(userId);               // ✓ OK
```

### Pitfall 2: Storing EntityId in Database

**Problem:**
```typescript
// BAD: Storing object in DB
await db.users.insert({
  id: entityId, // Object, not string!
  name: 'John'
});
```

**Solution:**
```typescript
// GOOD: Store the value
await db.users.insert({
  id: entityId.value, // String
  name: 'John'
});

// Reconstruct when loading
const row = await db.users.findOne({ id: userId.value });
const user = User.reconstitute(
  EntityId.from<'User'>(row.id),
  row.name,
  row.createdAt,
  row.updatedAt
);
```

### Pitfall 3: Forgetting Phantom Type

**Problem:**
```typescript
// BAD: No phantom type
const id = EntityId.create(); // EntityId<string>

// Now can be assigned to any entity type
function getUser(id: EntityId<'User'>) { }
getUser(id); // Compiles but no type safety!
```

**Solution:**
```typescript
// GOOD: Always specify phantom type
const userId = EntityId.create<'User'>();
const orderId = EntityId.create<'Order'>();

function getUser(id: EntityId<'User'>) { }
getUser(userId);   // ✓ OK
// getUser(orderId); // ✗ Compile error
```

## Phantom Types Explained

Phantom types are type parameters that don't appear in the runtime implementation but provide compile-time type safety:

```typescript
class EntityId<T extends string> extends ValueObject {
  private readonly _value: string;
  private readonly _brand!: T; // ← Phantom type (unused at runtime)
}
```

The `_brand` field:
- Never used at runtime
- Only exists for type checking
- Makes `EntityId<'User'>` incompatible with `EntityId<'Order'>`
- Has zero runtime cost

This technique is called "branding" or "phantom types" and is widely used in TypeScript for nominal typing.

## Type Safety Guarantees

```typescript
type UserId = EntityId<'User'>;
type OrderId = EntityId<'Order'>;

const userId: UserId = EntityId.create<'User'>();
const orderId: OrderId = EntityId.create<'Order'>();

// These all fail at compile time:
// const badId: UserId = orderId;           // ✗ Type error
// const badArray: UserId[] = [userId, orderId]; // ✗ Type error

function processUser(id: UserId) { }
// processUser(orderId); // ✗ Type error

// But equality still works (ValueObject):
const sameId = EntityId.from<'User'>(userId.value);
userId.equals(sameId); // true (same value)
```

## Serialization

EntityId implements JSON serialization:

```typescript
const user = {
  id: EntityId.create<'User'>(),
  name: 'John'
};

const json = JSON.stringify(user);
// {"id":"550e8400-e29b-41d4-a716-446655440000","name":"John"}

const parsed = JSON.parse(json);
const userId = EntityId.from<'User'>(parsed.id);
```

## Performance Considerations

- EntityId has zero runtime overhead (phantom type is compile-time only)
- Creating IDs is as fast as generating UUIDs
- Equality comparison is simple string comparison
- No memory overhead compared to plain strings
- Immutable, so safe to share without copying

## Related Components

- [Entity](./entity.md) - Base class using EntityId
- [AggregateRoot](./aggregate-root.md) - Aggregate roots with typed IDs
- [ValueObject](./value-object.md) - Parent class of EntityId
- [UUID](./uuid.md) - UUID value object (alternative)

## See Also

- [Package README](../../../packages/primitives/README.md)
- [Core Concepts - Entity Identity](../../website/docs/core-concepts/entities.md)
- [TypeScript - Nominal Typing](https://basarat.gitbook.io/typescript/main-1/nominaltyping)

