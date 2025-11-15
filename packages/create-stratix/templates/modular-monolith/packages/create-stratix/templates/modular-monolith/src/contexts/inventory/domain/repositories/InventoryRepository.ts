import type { Repository } from '@stratix/abstractions';
import type { Inventory, InventoryId } from '../entities/Inventory.js';

/**
 * Repository interface for Inventory aggregate.
 */
export interface InventoryRepository extends Repository<Inventory, InventoryId> {
  /**
   * Finds all inventories.
   */
  findAll(): Promise<Inventory[]>;
}
