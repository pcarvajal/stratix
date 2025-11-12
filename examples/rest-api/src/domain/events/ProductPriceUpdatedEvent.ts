import { DomainEvent } from '@stratix/primitives';
import { ProductId } from '../entities/Product.js';

export class ProductPriceUpdatedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly productId: ProductId,
    readonly oldPrice: number,
    readonly newPrice: number
  ) {
    this.occurredAt = new Date();
  }
}
