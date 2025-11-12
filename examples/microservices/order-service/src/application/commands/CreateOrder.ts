import { Command, CommandHandler, EventBus } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { Order, OrderItem } from '../../domain/entities/Order.js';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';

export interface CreateOrderInput {
  customerId: string;
  items: OrderItem[];
}

export interface CreateOrderOutput {
  id: string;
}

export class CreateOrder implements Command {
  constructor(public readonly data: CreateOrderInput) {}
}

export class CreateOrderHandler implements CommandHandler<CreateOrder, Result<CreateOrderOutput>> {
  constructor(
    private readonly repository: OrderRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateOrder): Promise<Result<CreateOrderOutput>> {
    try {
      const { customerId, items } = command.data;

      if (!customerId || customerId.trim().length === 0) {
        return Failure.create(new Error('Customer ID is required'));
      }

      if (!items || items.length === 0) {
        return Failure.create(new Error('Order must have at least one item'));
      }

      const order = Order.create(customerId, items);
      await this.repository.save(order);

      const events = order.pullDomainEvents();
      await this.eventBus.publish(events);

      return Success.create({ id: order.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
