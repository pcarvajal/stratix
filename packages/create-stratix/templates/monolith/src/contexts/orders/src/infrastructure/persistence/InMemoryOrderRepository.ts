// @ts-nocheck
import { Order } from '../../domain/entities/Order.js';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';
import { OrderId, UserId } from '../../../../../shared/types/CommonTypes.js';

export class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.toString(), order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.toString()) || null;
  }

  async findByUserId(userId: UserId): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId.toString() === userId.toString()
    );
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.toString());
  }

  async count(): Promise<number> {
    return this.orders.size;
  }
}
