// @ts-nocheck
import { DomainEvent } from '@stratix/primitives';
import { OrderId, UserId, Money } from '../../../../../shared/types/CommonTypes.js';

export class OrderCreatedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: OrderId,
    readonly userId: UserId,
    readonly totalAmount: Money
  ) {
    this.occurredAt = new Date();
  }
}
