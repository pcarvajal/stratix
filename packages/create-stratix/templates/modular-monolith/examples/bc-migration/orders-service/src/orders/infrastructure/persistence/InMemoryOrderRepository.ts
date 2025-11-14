import type { OrderRepository } from '../../domain/repositories/OrderRepository.js';
import { Order, type OrderId } from '../../domain/entities/Order.js';

/**
 * In-memory implementation of OrderRepository.
 *
 * For production, replace with PostgresPlugin or MongoDBPlugin repository.
 */
export class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.value, order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.value) || null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.value);
  }

  async exists(id: OrderId): Promise<boolean> {
    return this.orders.has(id.value);
  }

  /**
   * Clears all orders (useful for testing).
   */
  async clear(): Promise<void> {
    this.orders.clear();
  }
}
