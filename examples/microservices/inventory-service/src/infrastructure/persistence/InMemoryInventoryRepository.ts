import { Inventory, InventoryId } from '../../domain/entities/Inventory.js';
import { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';

export class InMemoryInventoryRepository implements InventoryRepository {
  private inventories = new Map<string, Inventory>();
  private productIndex = new Map<string, string>();

  async save(inventory: Inventory): Promise<void> {
    this.inventories.set(inventory.id.toString(), inventory);
    this.productIndex.set(inventory.productId, inventory.id.toString());
  }

  async findById(id: InventoryId): Promise<Inventory | null> {
    const inventory = this.inventories.get(id.toString());
    return inventory || null;
  }

  async findAll(): Promise<Inventory[]> {
    return Array.from(this.inventories.values());
  }

  async delete(id: InventoryId): Promise<void> {
    const inventory = this.inventories.get(id.toString());
    if (inventory) {
      this.productIndex.delete(inventory.productId);
      this.inventories.delete(id.toString());
    }
  }

  async exists(id: InventoryId): Promise<boolean> {
    return this.inventories.has(id.toString());
  }

  async findByProductId(productId: string): Promise<Inventory | null> {
    const inventoryId = this.productIndex.get(productId);
    if (!inventoryId) {
      return null;
    }
    return this.inventories.get(inventoryId) || null;
  }
}
