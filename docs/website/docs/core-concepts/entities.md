# Entities & Aggregates

Learn how to model your domain with Entities and Aggregates in Stratix.

## What is an Entity?

An **Entity** is an object with a unique identity that persists over time. Two entities are considered the same if they have the same identity, even if their properties differ.

### Example: User Entity

```typescript
import { Entity, EntityId } from '@stratix/core';

type UserId = EntityId<'User'>;

interface UserProps {
  email: string;
  name: string;
  verified: boolean;
}

class User extends Entity<UserId> {
  private constructor(
    id: UserId,
    private _email: string,
    private _name: string,
    private _verified: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get verified(): boolean {
    return this._verified;
  }

  verify(): void {
    this._verified = true;
    this.touch();
  }

  static create(props: UserProps, id?: UserId): User {
    const userId = id ?? EntityId.create<'User'>();
    const now = new Date();
    return new User(userId, props.email, props.name, props.verified, now, now);
  }
}
```

### Key Characteristics

1. **Identity**: Entities have a unique identifier (EntityId)
2. **Mutable**: Entity properties can change over time
3. **Equality**: Two entities are equal if their IDs are equal

```typescript
const user1 = User.create({ email: 'john@example.com', name: 'John', verified: false }, userId);
const user2 = User.create({ email: 'john@example.com', name: 'John', verified: true }, userId);

user1.equals(user2); // true - same ID
```

## What is an Aggregate?

An **Aggregate** is a cluster of domain objects (entities and value objects) that are treated as a single unit. The aggregate has a root entity called the **Aggregate Root**.

### Aggregate Rules

1. **Consistency Boundary**: All invariants are enforced within the aggregate
2. **Transactional Boundary**: Changes to an aggregate are atomic
3. **External References**: External entities reference the aggregate by its ID only
4. **Internal Changes**: Only the aggregate root can modify internal entities

### Example: Order Aggregate

```typescript
import { AggregateRoot, Entity, EntityId, DomainEvent } from '@stratix/core';

type OrderId = EntityId<'Order'>;
type OrderItemId = EntityId<'OrderItem'>;

interface OrderItemProps {
  productId: string;
  quantity: number;
  price: number;
}

class OrderItem extends Entity<OrderItemId> {
  private constructor(
    id: OrderItemId,
    private _productId: string,
    private _quantity: number,
    private _price: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get productId(): string {
    return this._productId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get price(): number {
    return this._price;
  }

  get total(): number {
    return this._quantity * this._price;
  }

  static create(props: OrderItemProps): OrderItem {
    const now = new Date();
    return new OrderItem(EntityId.create<'OrderItem'>(), props.productId, props.quantity, props.price, now, now);
  }
}

class OrderPlacedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: OrderId,
    readonly total: number
  ) {
    this.occurredAt = new Date();
  }
}

type OrderStatus = 'draft' | 'placed' | 'shipped' | 'delivered';

class Order extends AggregateRoot<'Order'> {
  private constructor(
    id: OrderId,
    private _customerId: string,
    private _items: OrderItem[],
    private _status: OrderStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get customerId(): string {
    return this._customerId;
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get total(): number {
    return this._items.reduce((sum, item) => sum + item.total, 0);
  }

  addItem(productId: string, quantity: number, price: number): void {
    if (this._status !== 'draft') {
      throw new Error('Cannot add items to a placed order');
    }

    const item = OrderItem.create({ productId, quantity, price });
    this._items.push(item);
    this.touch();
  }

  removeItem(itemId: OrderItemId): void {
    if (this._status !== 'draft') {
      throw new Error('Cannot remove items from a placed order');
    }

    this._items = this._items.filter(item => !item.id.equals(itemId));
    this.touch();
  }

  placeOrder(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot place an empty order');
    }

    if (this._status !== 'draft') {
      throw new Error('Order has already been placed');
    }

    this._status = 'placed';
    this.record(new OrderPlacedEvent(this.id, this.total));
    this.touch();
  }

  static create(customerId: string): Order {
    const now = new Date();
    return new Order(EntityId.create<'Order'>(), customerId, [], 'draft', now, now);
  }
}
```

## Domain Events

Aggregates emit **Domain Events** to communicate changes to other parts of the system.

### Creating Domain Events

```typescript
import { DomainEvent, EntityId } from '@stratix/core';

type OrderId = EntityId<'Order'>;

class OrderPlacedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: OrderId,
    readonly total: number
  ) {
    this.occurredAt = new Date();
  }
}
```

### Emitting Events

```typescript
class Order extends AggregateRoot<'Order'> {
  placeOrder(): void {
    // ... validation logic

    this._status = 'placed';

    // Emit domain event
    this.record(new OrderPlacedEvent(this.id, this.total));
    this.touch();
  }
}
```

### Accessing Events

```typescript
const order = Order.create('customer-123');
order.addItem('product-1', 2, 10.00);
order.placeOrder();

// Get and clear domain events (typically done after save)
const events = order.pullDomainEvents();
// [OrderPlacedEvent { orderId: '...', total: 20.00, occurredAt: ... }]
```

## Entity Best Practices

### 1. Keep Entities Focused

Each entity should represent a single concept in your domain.

```typescript
// Good: Focused entity
class User extends Entity<UserId> {
  verify(): void { /* ... */ }
  changeEmail(email: Email): void { /* ... */ }
}

// Bad: God entity
class User extends Entity<UserId> {
  verify(): void { /* ... */ }
  placeOrder(): void { /* ... */ }  // Order responsibility
  addToCart(): void { /* ... */ }   // Cart responsibility
}
```

### 2. Encapsulate Business Logic

Don't expose setters. Use meaningful methods instead.

```typescript
// Good: Intention-revealing method
class User extends Entity<UserId> {
  changeEmail(newEmail: Email): void {
    if (this._verified) {
      this.record(new EmailChangedEvent(this.id, newEmail));
    }
    this._email = newEmail;
    this._verified = false;
    this.touch();
  }
}

// Bad: Direct property access
// Private fields prevent this anti-pattern
```

### 3. Validate Invariants

Ensure your entity is always in a valid state.

```typescript
class Order extends AggregateRoot<'Order'> {
  placeOrder(): void {
    // Validate invariants
    if (this._items.length === 0) {
      throw new Error('Cannot place an empty order');
    }

    if (this.total < 0) {
      throw new Error('Order total cannot be negative');
    }

    this._status = 'placed';
    this.touch();
  }
}
```

### 4. Use Factory Methods

Provide static factory methods for creating entities.

```typescript
class Order extends AggregateRoot<'Order'> {
  static create(customerId: string): Order {
    const now = new Date();
    return new Order(EntityId.create<'Order'>(), customerId, [], 'draft', now, now);
  }

  static fromPrimitives(
    id: string,
    customerId: string,
    items: Array<{ productId: string; quantity: number; price: number }>,
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date
  ): Order {
    const orderItems = items.map(item => OrderItem.create(item));

    return new Order(
      EntityId.from<'Order'>(id),
      customerId,
      orderItems,
      status,
      createdAt,
      updatedAt
    );
  }
}
```

## Aggregate Design Guidelines

### 1. Keep Aggregates Small

Smaller aggregates are easier to understand and perform better.

```typescript
// Good: Small, focused aggregate
class Order extends AggregateRoot<'Order'> {
  // Contains only order items, not customer or product details
}

// Bad: Large aggregate
class Order extends AggregateRoot<'Order'> {
  // Contains customer, products, shipping address, payment details...
}
```

### 2. Reference by ID

External entities should be referenced by ID only.

```typescript
// Good: Reference by ID
interface OrderProps {
  customerId: string;  // Reference to Customer aggregate
  items: OrderItem[];
}

// Bad: Embed entire entity
interface OrderProps {
  customer: Customer;  // Embedded Customer aggregate
  items: OrderItem[];
}
```

### 3. One Aggregate per Transaction

Modify only one aggregate per transaction.

```typescript
// Good: Single aggregate
async function placeOrder(orderId: OrderId): Promise<Result<void>> {
  const order = await orderRepository.findById(orderId);
  order.placeOrder();
  await orderRepository.save(order);
  return Success.create(undefined);
}

// Bad: Multiple aggregates
async function placeOrder(orderId: OrderId): Promise<Result<void>> {
  const order = await orderRepository.findById(orderId);
  const customer = await customerRepository.findById(order.customerId);

  order.placeOrder();
  customer.incrementOrderCount(); // Modifying two aggregates!

  await orderRepository.save(order);
  await customerRepository.save(customer);
  return Success.create(undefined);
}
```

Use domain events for cross-aggregate consistency:

```typescript
// Better: Use events for cross-aggregate updates
class OrderPlacedEventHandler {
  async handle(event: OrderPlacedEvent): Promise<void> {
    const customer = await customerRepository.findById(event.customerId);
    customer.incrementOrderCount();
    await customerRepository.save(customer);
  }
}
```

## Testing Entities

```typescript
import { describe, it, expect } from 'vitest';
import { EntityId } from '@stratix/core';

describe('Order', () => {
  it('should create a draft order', () => {
    const order = Order.create('customer-123');

    expect(order.status).toBe('draft');
    expect(order.items).toHaveLength(0);
  });

  it('should add items to draft order', () => {
    const order = Order.create('customer-123');

    order.addItem('product-1', 2, 10.00);

    expect(order.items).toHaveLength(1);
    expect(order.total).toBe(20.00);
  });

  it('should not add items to placed order', () => {
    const order = Order.create('customer-123');
    order.addItem('product-1', 1, 10.00);
    order.placeOrder();

    expect(() => order.addItem('product-2', 1, 5.00))
      .toThrow('Cannot add items to a placed order');
  });

  it('should emit event when order is placed', () => {
    const order = Order.create('customer-123');
    order.addItem('product-1', 2, 10.00);

    order.placeOrder();

    const events = order.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrderPlacedEvent);
  });
});
```

## Next Steps

- [Value Objects](./value-objects.md) - Learn about immutable value objects
- [CQRS](./cqrs.md) - Commands and queries pattern
