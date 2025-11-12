import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { InventoryRepository } from '../../domain/repositories/InventoryRepository.js';

export interface GetInventoryInput {
  productId: string;
}

export interface InventoryDto {
  id: string;
  productId: string;
  available: number;
  reserved: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export class GetInventory implements Query {
  constructor(public readonly data: GetInventoryInput) {}
}

export class GetInventoryHandler implements QueryHandler<GetInventory, Result<InventoryDto>> {
  constructor(private readonly repository: InventoryRepository) {}

  async handle(query: GetInventory): Promise<Result<InventoryDto>> {
    try {
      const inventory = await this.repository.findByProductId(query.data.productId);

      if (!inventory) {
        return Failure.create(new Error('Inventory not found'));
      }

      const dto: InventoryDto = {
        id: inventory.id.toString(),
        productId: inventory.productId,
        available: inventory.available,
        reserved: inventory.reserved,
        total: inventory.total,
        createdAt: inventory.createdAt,
        updatedAt: inventory.updatedAt,
      };

      return Success.create(dto);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
