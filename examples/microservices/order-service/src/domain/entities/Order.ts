import { AggregateRoot, EntityId, DomainEvent } from '@stratix/primitives';

export type OrderId = EntityId<'Order'>;

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'failed' | 'completed';

export class OrderPlacedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: OrderId,
    readonly customerId: string,
    readonly items: OrderItem[],
    readonly total: number
  ) {
    this.occurredAt = new Date();
  }
}

export class Order extends AggregateRoot<'Order'> {
  private constructor(
    id: OrderId,
    private _customerId: string,
    private _items: OrderItem[],
    private _status: OrderStatus,
    private _total: number,
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
    return this._total;
  }

  confirm(): void {
    if (this._status !== 'pending') {
      throw new Error('Only pending orders can be confirmed');
    }
    this._status = 'confirmed';
    this.touch();
  }

  fail(): void {
    if (this._status !== 'pending') {
      throw new Error('Only pending orders can be failed');
    }
    this._status = 'failed';
    this.touch();
  }

  complete(): void {
    if (this._status !== 'confirmed') {
      throw new Error('Only confirmed orders can be completed');
    }
    this._status = 'completed';
    this.touch();
  }

  static create(customerId: string, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const now = new Date();
    const orderId = EntityId.create<'Order'>();

    const order = new Order(orderId, customerId, items, 'pending', total, now, now);
    order.record(new OrderPlacedEvent(orderId, customerId, items, total));

    return order;
  }

  static fromPrimitives(
    id: string,
    customerId: string,
    items: OrderItem[],
    status: OrderStatus,
    total: number,
    createdAt: Date,
    updatedAt: Date
  ): Order {
    return new Order(
      EntityId.from<'Order'>(id),
      customerId,
      items,
      status,
      total,
      createdAt,
      updatedAt
    );
  }
}
