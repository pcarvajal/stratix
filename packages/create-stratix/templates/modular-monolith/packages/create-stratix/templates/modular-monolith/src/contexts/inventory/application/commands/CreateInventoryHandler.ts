import type { CommandHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import type { CreateInventoryCommand, CreateInventoryOutput } from './CreateInventory.js';
import { Inventory } from '../../domain/entities/Inventory.js';
import type { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';

/**
 * Handler for CreateInventory command.
 */
export class CreateInventoryHandler
  implements CommandHandler<CreateInventoryCommand, Result<CreateInventoryOutput>>
{
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async handle(command: CreateInventoryCommand): Promise<Result<CreateInventoryOutput>> {
    try {
      const { data } = command;

      // Create aggregate
      const inventory = Inventory.create({
        productId: data.productId,
        quantity: data.quantity,
        location: data.location,
      });

      // Save to repository
      await this.inventoryRepository.save(inventory);

      return Result.ok({
        inventoryId: inventory.id.value,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
