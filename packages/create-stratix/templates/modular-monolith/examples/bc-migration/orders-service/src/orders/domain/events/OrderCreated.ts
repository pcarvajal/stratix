import { DomainEvent } from '@stratix/primitives';
import type { OrderId } from '../entities/Order.js';

/**
 * Domain event fired when a Order is created.
 */
export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: string,
    public readonly total: number,
    public readonly status: string
  ) {
    super();
  }
}
