// @ts-nocheck
import { AggregateRoot, EntityId } from '@stratix/primitives';
import { ProductCreated } from '../events/ProductCreated.js';
import { Money } from '../value-objects/Money.js';

export type ProductId = EntityId<'Product'>;

export const ProductId = {
  create: () => EntityId.create<'Product'>(),
  from: (value: string) => EntityId.from<'Product'>(value),
};

export interface ProductProps {
  name: string;
  description: string;
  price: Money;
  stock: number;
}

export class Product extends AggregateRoot<'Product'> {
  private _name: string;
  private _description: string;
  private _price: Money;
  private _stock: number;

  private constructor(id: ProductId, props: ProductProps, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._stock = props.stock;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): Money {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  // Factory method
  static create(props: ProductProps): Product {
    this.validateProps(props);

    const id = ProductId.create();
    const now = new Date();
    const product = new Product(id, props, now, now);

    // Add domain event
    product.addDomainEvent(new ProductCreated(id, props.name, props.price, props.stock));

    return product;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    this._name = name;
    this.touch();
  }

  updateDescription(description: string): void {
    this._description = description;
    this.touch();
  }

  updatePrice(price: Money): void {
    if (price.amount < 0) {
      throw new Error('Product price cannot be negative');
    }

    this._price = price;
    this.touch();
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    this._stock += quantity;
    this.touch();
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    if (this._stock < quantity) {
      throw new Error('Insufficient stock');
    }

    this._stock -= quantity;
    this.touch();
  }

  private static validateProps(props: ProductProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (props.price.amount < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (props.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
  }

  // Reconstruct from persistence
  static from(id: ProductId, props: ProductProps, createdAt: Date, updatedAt: Date): Product {
    return new Product(id, props, createdAt, updatedAt);
  }
}
