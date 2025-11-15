import { DomainEvent } from '@stratix/primitives';
import { ProductId } from '../entities/Product.js';

export class ProductCreatedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly productId: ProductId,
    readonly name: string,
    readonly price: number
  ) {
    this.occurredAt = new Date();
  }
}
