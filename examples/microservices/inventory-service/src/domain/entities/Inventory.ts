import { AggregateRoot, EntityId, DomainEvent } from '@stratix/primitives';

export type InventoryId = EntityId<'Inventory'>;

export class StockReservedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: string,
    readonly reservations: Array<{ productId: string; quantity: number }>
  ) {
    this.occurredAt = new Date();
  }
}

export class StockReservationFailedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly orderId: string,
    readonly reason: string
  ) {
    this.occurredAt = new Date();
  }
}

export class StockAddedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly productId: string,
    readonly quantity: number
  ) {
    this.occurredAt = new Date();
  }
}

export class Inventory extends AggregateRoot<'Inventory'> {
  private constructor(
    id: InventoryId,
    private _productId: string,
    private _available: number,
    private _reserved: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get productId(): string {
    return this._productId;
  }

  get available(): number {
    return this._available;
  }

  get reserved(): number {
    return this._reserved;
  }

  get total(): number {
    return this._available + this._reserved;
  }

  canReserve(quantity: number): boolean {
    return this._available >= quantity;
  }

  reserve(quantity: number): void {
    if (!this.canReserve(quantity)) {
      throw new Error(`Insufficient stock. Available: ${this._available}, Requested: ${quantity}`);
    }

    this._available -= quantity;
    this._reserved += quantity;
    this.touch();
  }

  addStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    this._available += quantity;
    this.record(new StockAddedEvent(this._productId, quantity));
    this.touch();
  }

  releaseReserved(quantity: number): void {
    if (quantity > this._reserved) {
      throw new Error(`Cannot release more than reserved. Reserved: ${this._reserved}, Requested: ${quantity}`);
    }

    this._reserved -= quantity;
    this._available += quantity;
    this.touch();
  }

  confirmReservation(quantity: number): void {
    if (quantity > this._reserved) {
      throw new Error(`Cannot confirm more than reserved. Reserved: ${this._reserved}, Requested: ${quantity}`);
    }

    this._reserved -= quantity;
    this.touch();
  }

  static create(productId: string, initialStock: number = 0): Inventory {
    if (initialStock < 0) {
      throw new Error('Initial stock cannot be negative');
    }

    const now = new Date();
    const inventoryId = EntityId.create<'Inventory'>();

    return new Inventory(inventoryId, productId, initialStock, 0, now, now);
  }

  static fromPrimitives(
    id: string,
    productId: string,
    available: number,
    reserved: number,
    createdAt: Date,
    updatedAt: Date
  ): Inventory {
    return new Inventory(
      EntityId.from<'Inventory'>(id),
      productId,
      available,
      reserved,
      createdAt,
      updatedAt
    );
  }
}
