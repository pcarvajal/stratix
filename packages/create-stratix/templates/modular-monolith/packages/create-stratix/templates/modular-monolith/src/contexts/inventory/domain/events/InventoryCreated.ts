import { DomainEvent } from '@stratix/primitives';
import type { InventoryId } from '../entities/Inventory.js';

/**
 * Domain event fired when a Inventory is created.
 */
export class InventoryCreatedEvent extends DomainEvent {
  constructor(
    public readonly inventoryId: InventoryId,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly location: string
  ) {
    super();
  }
}
