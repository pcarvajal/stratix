import { DomainEvent } from '@stratix/primitives';
import type { ProductId } from '../entities/Product.js';

/**
 * Domain event fired when a Product is created.
 */
export class ProductCreatedEvent extends DomainEvent {
  constructor(
    public readonly productId: ProductId,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number
  ) {
    super();
  }
}
