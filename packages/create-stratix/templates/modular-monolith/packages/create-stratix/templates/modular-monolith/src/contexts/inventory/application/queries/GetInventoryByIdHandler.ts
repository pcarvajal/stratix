import type { QueryHandler } from '@stratix/abstractions';
import { Result, EntityId } from '@stratix/primitives';
import type { GetInventoryByIdQuery, GetInventoryByIdOutput } from './GetInventoryById.js';
import type { InventoryId } from '../../domain/entities/Inventory.js';
import type { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';

/**
 * Handler for GetInventoryById query.
 */
export class GetInventoryByIdHandler implements QueryHandler<GetInventoryByIdQuery, Result<GetInventoryByIdOutput>> {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async handle(query: GetInventoryByIdQuery): Promise<Result<GetInventoryByIdOutput>> {
    try {
      const { id } = query.data;

      const inventory = await this.inventoryRepository.findById(
        EntityId.from<'Inventory'>(id)
      );

      if (!inventory) {
        return Result.fail(new Error('Inventory not found'));
      }

      return Result.ok({
        id: inventory.id.value,
        productId: inventory.productId,
        quantity: inventory.quantity,
        location: inventory.location
        createdAt: inventory.createdAt,
        updatedAt: inventory.updatedAt,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
