// @ts-nocheck
import { Order } from '../entities/Order.js';
import { OrderId, UserId } from '../../../../../shared/types/CommonTypes.js';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByUserId(userId: UserId): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
  count(): Promise<number>;
}
