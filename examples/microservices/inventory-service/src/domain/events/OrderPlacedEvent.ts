import { DomainEvent } from '@stratix/primitives';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export class OrderPlacedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: string,
    readonly customerId: string,
    readonly items: OrderItem[],
    readonly total: number
  ) {
    this.occurredAt = new Date();
  }
}
