import { AggregateRoot, EntityId } from '@stratix/primitives';
import { ProductCreatedEvent } from '../events/ProductCreatedEvent.js';
import { ProductPriceUpdatedEvent } from '../events/ProductPriceUpdatedEvent.js';
import { ProductStockDecreasedEvent } from '../events/ProductStockDecreasedEvent.js';

export type ProductId = EntityId<'Product'>;

export interface ProductProps {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export class Product extends AggregateRoot<'Product'> {
  private constructor(
    id: ProductId,
    private _name: string,
    private _description: string,
    private _price: number,
    private _stock: number,
    private _category: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  get category(): string {
    return this._category;
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }

    const oldPrice = this._price;
    this._price = newPrice;

    this.record(new ProductPriceUpdatedEvent(this.id, oldPrice, newPrice));
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
    this.record(new ProductStockDecreasedEvent(this.id, quantity, this._stock));
    this.touch();
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    this._stock += quantity;
    this.touch();
  }

  isAvailable(): boolean {
    return this._stock > 0;
  }

  static create(props: ProductProps, id?: ProductId): Product {
    const productId = id ?? EntityId.create<'Product'>();
    const now = new Date();

    const product = new Product(
      productId,
      props.name,
      props.description,
      props.price,
      props.stock,
      props.category,
      now,
      now
    );

    if (!id) {
      product.record(new ProductCreatedEvent(productId, props.name, props.price));
    }

    return product;
  }
}
