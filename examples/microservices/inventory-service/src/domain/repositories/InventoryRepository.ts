import { Repository } from '@stratix/abstractions';
import { Inventory, InventoryId } from '../entities/Inventory.js';

export interface InventoryRepository extends Repository<Inventory, InventoryId> {
  findByProductId(productId: string): Promise<Inventory | null>;
}
