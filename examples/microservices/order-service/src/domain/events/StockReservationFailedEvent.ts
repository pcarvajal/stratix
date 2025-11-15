import { DomainEvent } from '@stratix/primitives';

export class StockReservationFailedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: string,
    readonly reason: string
  ) {
    this.occurredAt = new Date();
  }
}
