// @ts-nocheck
import { AggregateRoot, EntityId } from '@stratix/primitives';
import { OrderId, UserId, Money, OrderStatus } from '../../../../../shared/types/CommonTypes.js';
import { OrderCreatedEvent } from '../events/OrderCreatedEvent.js';
import { OrderItem } from '../value-objects/OrderItem.js';

export interface OrderProps {
  userId: UserId;
  items: OrderItem[];
  totalAmount: Money;
  status: OrderStatus;
}

export class Order extends AggregateRoot<'Order'> {
  private constructor(
    id: OrderId,
    private _userId: UserId,
    private _items: OrderItem[],
    private _totalAmount: Money,
    private _status: OrderStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get userId(): UserId {
    return this._userId;
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  get totalAmount(): Money {
    return this._totalAmount;
  }

  get status(): OrderStatus {
    return this._status;
  }

  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error(`Cannot confirm order with status: ${this._status}`);
    }
    this._status = OrderStatus.CONFIRMED;
    this.touch();
  }

  cancel(): void {
    if (this._status === OrderStatus.DELIVERED || this._status === OrderStatus.CANCELLED) {
      throw new Error(`Cannot cancel order with status: ${this._status}`);
    }
    this._status = OrderStatus.CANCELLED;
    this.touch();
  }

  ship(): void {
    if (this._status !== OrderStatus.PROCESSING) {
      throw new Error(`Cannot ship order with status: ${this._status}`);
    }
    this._status = OrderStatus.SHIPPED;
    this.touch();
  }

  static create(props: OrderProps, id?: OrderId): Order {
    const orderId = id ?? (EntityId.create<'Order'>() as OrderId);
    const now = new Date();
    const order = new Order(
      orderId,
      props.userId,
      props.items,
      props.totalAmount,
      props.status,
      now,
      now
    );

    order.record(new OrderCreatedEvent(orderId, props.userId, props.totalAmount));

    return order;
  }
}
