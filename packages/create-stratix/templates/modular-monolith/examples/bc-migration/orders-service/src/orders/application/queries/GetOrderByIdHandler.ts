import type { QueryHandler } from '@stratix/abstractions';
import { Result, EntityId } from '@stratix/primitives';
import type { GetOrderByIdQuery, GetOrderByIdOutput } from './GetOrderById.js';
import type { OrderId } from '../../domain/entities/Order.js';
import type { OrderRepository } from '../../domain/repositories/OrderRepository.js';

/**
 * Handler for GetOrderById query.
 */
export class GetOrderByIdHandler implements QueryHandler<GetOrderByIdQuery, Result<GetOrderByIdOutput>> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async handle(query: GetOrderByIdQuery): Promise<Result<GetOrderByIdOutput>> {
    try {
      const { id } = query.data;

      const order = await this.orderRepository.findById(
        EntityId.from<'Order'>(id)
      );

      if (!order) {
        return Result.fail(new Error('Order not found'));
      }

      return Result.ok({
        id: order.id.value,
        customerId: order.customerId,
        total: order.total,
        status: order.status
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
