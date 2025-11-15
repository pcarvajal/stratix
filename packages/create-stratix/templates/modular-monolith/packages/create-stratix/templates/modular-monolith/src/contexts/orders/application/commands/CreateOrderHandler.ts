import type { CommandHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import type { CreateOrderCommand, CreateOrderOutput } from './CreateOrder.js';
import { Order } from '../../domain/entities/Order.js';
import type { OrderRepository } from '../../domain/repositories/OrderRepository.js';

/**
 * Handler for CreateOrder command.
 */
export class CreateOrderHandler
  implements CommandHandler<CreateOrderCommand, Result<CreateOrderOutput>>
{
  constructor(private readonly orderRepository: OrderRepository) {}

  async handle(command: CreateOrderCommand): Promise<Result<CreateOrderOutput>> {
    try {
      const { data } = command;

      // Create aggregate
      const order = Order.create({
        customerId: data.customerId,
        total: data.total,
        status: data.status,
      });

      // Save to repository
      await this.orderRepository.save(order);

      return Result.ok({
        orderId: order.id.value,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
