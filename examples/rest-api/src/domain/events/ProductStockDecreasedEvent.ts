import { DomainEvent } from '@stratix/primitives';
import { ProductId } from '../entities/Product.js';

export class ProductStockDecreasedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly productId: ProductId,
    readonly quantity: number,
    readonly remainingStock: number
  ) {
    this.occurredAt = new Date();
  }
}
