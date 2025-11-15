import type { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';
import { Inventory, type InventoryId } from '../../domain/entities/Inventory.js';

/**
 * In-memory implementation of InventoryRepository.
 *
 * For production, replace with PostgresPlugin or MongoDBPlugin repository.
 */
export class InMemoryInventoryRepository implements InventoryRepository {
  private inventories: Map<string, Inventory> = new Map();

  async save(inventory: Inventory): Promise<void> {
    this.inventories.set(inventory.id.value, inventory);
  }

  async findById(id: InventoryId): Promise<Inventory | null> {
    return this.inventories.get(id.value) || null;
  }

  async findAll(): Promise<Inventory[]> {
    return Array.from(this.inventories.values());
  }

  async delete(id: InventoryId): Promise<void> {
    this.inventories.delete(id.value);
  }

  async exists(id: InventoryId): Promise<boolean> {
    return this.inventories.has(id.value);
  }

  /**
   * Clears all inventories (useful for testing).
   */
  async clear(): Promise<void> {
    this.inventories.clear();
  }
}
