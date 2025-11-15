import { DomainEvent } from '@stratix/primitives';

export interface StockReservation {
  productId: string;
  quantity: number;
}

export class StockReservedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: string,
    readonly reservations: StockReservation[]
  ) {
    this.occurredAt = new Date();
  }
}
