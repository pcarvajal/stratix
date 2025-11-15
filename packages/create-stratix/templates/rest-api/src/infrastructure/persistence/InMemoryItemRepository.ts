// @ts-nocheck
import { Item, ItemId } from '../../domain/entities/Item.js';
import { ItemRepository } from '../../domain/repositories/ItemRepository.js';

export class InMemoryItemRepository implements ItemRepository {
  private items = new Map<string, Item>();

  async save(item: Item): Promise<void> {
    this.items.set(item.id.toString(), item);
  }

  async findById(id: ItemId): Promise<Item | null> {
    const item = this.items.get(id.toString());
    return item || null;
  }

  async findAll(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async delete(id: ItemId): Promise<void> {
    this.items.delete(id.toString());
  }

  async exists(id: ItemId): Promise<boolean> {
    return this.items.has(id.toString());
  }
}
