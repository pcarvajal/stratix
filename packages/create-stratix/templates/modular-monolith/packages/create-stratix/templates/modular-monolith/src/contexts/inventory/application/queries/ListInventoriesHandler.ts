import type { QueryHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import type { ListInventoriesQuery, ListInventoriesOutput } from './ListInventories.js';
import type { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';

/**
 * Handler for ListInventories query.
 */
export class ListInventoriesHandler implements QueryHandler<ListInventoriesQuery, Result<ListInventoriesOutput>> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async handle(query: ListInventoriesQuery): Promise<Result<ListInventoriesOutput>> {
    try {
      const inventories = await this.inventoryRepository.findAll();

      return Result.ok({
        inventories: inventories.map((inventory) => ({
          id: inventory.id.value,
          productId: inventory.productId,
          quantity: inventory.quantity,
          location: inventory.location
          createdAt: inventory.createdAt,
          updatedAt: inventory.updatedAt,
        })),
        total: inventories.length,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
