import type { QueryHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import type { ListOrdersQuery, ListOrdersOutput } from './ListOrders.js';
import type { OrderRepository } from '../../domain/repositories/OrderRepository.js';

/**
 * Handler for ListOrders query.
 */
export class ListOrdersHandler implements QueryHandler<ListOrdersQuery, Result<ListOrdersOutput>> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async handle(query: ListOrdersQuery): Promise<Result<ListOrdersOutput>> {
    try {
      const orders = await this.orderRepository.findAll();

      return Result.ok({
        orders: orders.map((order) => ({
          id: order.id.value,
          customerId: order.customerId,
          total: order.total,
          status: order.status
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
        total: orders.length,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
