import { Command, CommandHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { Inventory } from '../../domain/entities/Inventory.js';
import { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';

export interface AddStockInput {
  productId: string;
  quantity: number;
}

export interface AddStockOutput {
  productId: string;
  available: number;
  reserved: number;
  total: number;
}

export class AddStock implements Command {
  constructor(public readonly data: AddStockInput) {}
}

export class AddStockHandler implements CommandHandler<AddStock, Result<AddStockOutput>> {
  constructor(private readonly repository: InventoryRepository) {}

  async handle(command: AddStock): Promise<Result<AddStockOutput>> {
    try {
      const { productId, quantity } = command.data;

      if (!productId || productId.trim().length === 0) {
        return Failure.create(new Error('Product ID is required'));
      }

      if (quantity <= 0) {
        return Failure.create(new Error('Quantity must be positive'));
      }

      let inventory = await this.repository.findByProductId(productId);

      if (!inventory) {
        inventory = Inventory.create(productId, quantity);
      } else {
        inventory.addStock(quantity);
      }

      await this.repository.save(inventory);

      return Success.create({
        productId: inventory.productId,
        available: inventory.available,
        reserved: inventory.reserved,
        total: inventory.total,
      });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
