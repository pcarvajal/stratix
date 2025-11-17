import { Repository } from '@stratix/abstractions';
import { Inventory, InventoryId } from '../entities/Inventory.js';

export interface InventoryRepository extends Repository<Inventory, InventoryId> {
  // Make base methods required for this repository
  findById(id: InventoryId): Promise<Inventory | null>;

  // Domain-specific queries
  findByProductId(productId: string): Promise<Inventory | null>;
}
