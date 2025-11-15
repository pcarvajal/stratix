import { AggregateRoot, EntityId } from '@stratix/primitives';
import { OrderCreatedEvent } from '../events/OrderCreated.js';

export type OrderId = EntityId<'Order'>;

export interface OrderProps {
  customerId: string;
  total: number;
  status: string;
}

/**
 * Order aggregate root.
 *
 * Represents the main entity in the Orders bounded context.
 */
export class Order extends AggregateRoot<'Order'> {
  private _customerId: string;
  private _total: number;
  private _status: string;

  private constructor(id: OrderId, props: OrderProps, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this._customerId = props.customerId;
    this._total = props.total;
    this._status = props.status;
  }

  get customerId(): string {
    return this._customerId;
  }

  get total(): number {
    return this._total;
  }

  get status(): string {
    return this._status;
  }

  /**
   * Creates a new Order aggregate.
   */
  static create(props: OrderProps): Order {
    this.validateProps(props);

    const id = EntityId.create<'Order'>();
    const now = new Date();

    const order = new Order(id, props, now, now);

    // Raise domain event
    order.addDomainEvent(new OrderCreatedEvent(id, props.customerId, props.total, props.status));

    return order;
  }

  /**
   * Reconstructs a Order from persistence.
   */
  static from(id: OrderId, props: OrderProps, createdAt: Date, updatedAt: Date): Order {
    return new Order(id, props, createdAt, updatedAt);
  }

  /**
   * Validates Order properties.
   */
  private static validateProps(props: OrderProps): void {
    if (!props.customerId || props.customerId.trim() === '') {
      throw new Error('customerId cannot be empty');
    }
    if (typeof props.total !== 'number' || isNaN(props.total)) {
      throw new Error('total must be a valid number');
    }
    if (!props.status || props.status.trim() === '') {
      throw new Error('status cannot be empty');
    }
  }

  /**
   * Updates the Order.
   */
  update(props: Partial<OrderProps>): void {
    if (props.customerId !== undefined) {
      this._customerId = props.customerId;
    }
    if (props.total !== undefined) {
      this._total = props.total;
    }
    if (props.status !== undefined) {
      this._status = props.status;
    }
    this.touch();
  }
}
