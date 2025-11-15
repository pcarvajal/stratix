import { AggregateRoot, EntityId } from '@stratix/primitives';
import { InventoryCreatedEvent } from '../events/InventoryCreated.js';

export type InventoryId = EntityId<'Inventory'>;

export interface InventoryProps {
  productId: string;
  quantity: number;
  location: string;
}

/**
 * Inventory aggregate root.
 *
 * Represents the main entity in the Inventory bounded context.
 */
export class Inventory extends AggregateRoot<'Inventory'> {
  private _productId: string;
  private _quantity: number;
  private _location: string;

  private constructor(id: InventoryId, props: InventoryProps, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this._productId = props.productId;
    this._quantity = props.quantity;
    this._location = props.location;
  }

  get productId(): string {
    return this._productId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get location(): string {
    return this._location;
  }

  /**
   * Creates a new Inventory aggregate.
   */
  static create(props: InventoryProps): Inventory {
    this.validateProps(props);

    const id = EntityId.create<'Inventory'>();
    const now = new Date();

    const inventory = new Inventory(id, props, now, now);

    // Raise domain event
    inventory.addDomainEvent(
      new InventoryCreatedEvent(id, props.productId, props.quantity, props.location)
    );

    return inventory;
  }

  /**
   * Reconstructs a Inventory from persistence.
   */
  static from(id: InventoryId, props: InventoryProps, createdAt: Date, updatedAt: Date): Inventory {
    return new Inventory(id, props, createdAt, updatedAt);
  }

  /**
   * Validates Inventory properties.
   */
  private static validateProps(props: InventoryProps): void {
    if (!props.productId || props.productId.trim() === '') {
      throw new Error('productId cannot be empty');
    }
    if (typeof props.quantity !== 'number' || isNaN(props.quantity)) {
      throw new Error('quantity must be a valid number');
    }
    if (!props.location || props.location.trim() === '') {
      throw new Error('location cannot be empty');
    }
  }

  /**
   * Updates the Inventory.
   */
  update(props: Partial<InventoryProps>): void {
    if (props.productId !== undefined) {
      this._productId = props.productId;
    }
    if (props.quantity !== undefined) {
      this._quantity = props.quantity;
    }
    if (props.location !== undefined) {
      this._location = props.location;
    }
    this.touch();
  }
}
