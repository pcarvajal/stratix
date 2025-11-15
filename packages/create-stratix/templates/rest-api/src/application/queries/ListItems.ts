// @ts-nocheck
import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { ItemRepository } from '../../domain/repositories/ItemRepository.js';
import { ItemDto } from './GetItem.js';

export class ListItems implements Query {
  constructor(public readonly data: Record<string, never> = {}) {}
}

export class ListItemsHandler implements QueryHandler<ListItems, Result<ItemDto[]>> {
  constructor(private readonly repository: ItemRepository) {}

  async handle(): Promise<Result<ItemDto[]>> {
    try {
      const items = await this.repository.findAll();

      const dtos: ItemDto[] = items.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return Success.create(dtos);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
