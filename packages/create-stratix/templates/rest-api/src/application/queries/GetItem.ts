// @ts-nocheck
import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure, EntityId } from '@stratix/primitives';
import { ItemRepository } from '../../domain/repositories/ItemRepository.js';

export interface GetItemInput {
  id: string;
}

export interface ItemDto {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetItem implements Query {
  constructor(public readonly data: GetItemInput) {}
}

export class GetItemHandler implements QueryHandler<GetItem, Result<ItemDto>> {
  constructor(private readonly repository: ItemRepository) {}

  async handle(query: GetItem): Promise<Result<ItemDto>> {
    try {
      const itemId = EntityId.from(query.data.id);
      const item = await this.repository.findById(itemId);

      if (!item) {
        return Failure.create(new Error('Item not found'));
      }

      const dto: ItemDto = {
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };

      return Success.create(dto);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
