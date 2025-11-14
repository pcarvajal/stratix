// @ts-nocheck
import { DomainEvent } from '@stratix/primitives';
import { ProductId } from '../entities/Product.js';
import { Money } from '../value-objects/Money.js';

export class ProductCreated implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly productId: ProductId,
    public readonly name: string,
    public readonly price: Money,
    public readonly stock: number
  ) {
    this.occurredAt = new Date();
  }
}
