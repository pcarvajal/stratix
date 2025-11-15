import { AggregateRoot, EntityId } from '@stratix/primitives';
import { ProductCreatedEvent } from '../events/ProductCreated.js';

export type ProductId = EntityId<'Product'>;

export interface ProductProps {
  name: string;
  price: number;
  stock: number;
}

export class Product extends AggregateRoot<'Product'> {
  private _name: string;
  private _price: number;
  private _stock: number;

  private constructor(id: ProductId, props: ProductProps, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._price = props.price;
    this._stock = props.stock;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  static create(props: ProductProps): Product {
    this.validateProps(props);

    const id = EntityId.create<'Product'>();
    const now = new Date();

    const product = new Product(id, props, now, now);

    product.addDomainEvent(new ProductCreatedEvent(id, props.name, props.price, props.stock));

    return product;
  }

  static from(id: ProductId, props: ProductProps, createdAt: Date, updatedAt: Date): Product {
    return new Product(id, props, createdAt, updatedAt);
  }

  private static validateProps(props: ProductProps): void {
    if (!props.name || props.name.trim() === '') {
      throw new Error('name cannot be empty');
    }
    if (typeof props.price !== 'number' || isNaN(props.price)) {
      throw new Error('price must be a valid number');
    }
    if (typeof props.stock !== 'number' || isNaN(props.stock)) {
      throw new Error('stock must be a valid number');
    }
  }

  update(props: Partial<ProductProps>): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.price !== undefined) {
      this._price = props.price;
    }
    if (props.stock !== undefined) {
      this._stock = props.stock;
    }
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
}
