// @ts-nocheck
import { Command, CommandHandler, EventBus } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { Item } from '../../domain/entities/Item.js';
import { ItemRepository } from '../../domain/repositories/ItemRepository.js';

export interface CreateItemInput {
  name: string;
  description: string;
}

export interface CreateItemOutput {
  id: string;
}

export class CreateItem implements Command {
  constructor(public readonly data: CreateItemInput) {}
}

export class CreateItemHandler implements CommandHandler<CreateItem, Result<CreateItemOutput>> {
  constructor(
    private readonly repository: ItemRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateItem): Promise<Result<CreateItemOutput>> {
    try {
      const { name, description } = command.data;

      const item = Item.create(name, description);
      await this.repository.save(item);

      const events = item.pullDomainEvents();
      await this.eventBus.publish(events);

      return Success.create({ id: item.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
