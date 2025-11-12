import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure, EntityId } from '@stratix/primitives';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';
import { OrderItem, OrderStatus } from '../../domain/entities/Order.js';

export interface GetOrderInput {
  id: string;
}

export interface OrderDto {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export class GetOrder implements Query {
  constructor(public readonly data: GetOrderInput) {}
}

export class GetOrderHandler implements QueryHandler<GetOrder, Result<OrderDto>> {
  constructor(private readonly repository: OrderRepository) {}

  async handle(query: GetOrder): Promise<Result<OrderDto>> {
    try {
      const orderId = EntityId.from<'Order'>(query.data.id);
      const order = await this.repository.findById(orderId);

      if (!order) {
        return Failure.create(new Error('Order not found'));
      }

      const dto: OrderDto = {
        id: order.id.toString(),
        customerId: order.customerId,
        items: Array.from(order.items),
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      return Success.create(dto);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
