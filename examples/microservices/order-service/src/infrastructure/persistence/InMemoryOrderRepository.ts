import { Order, OrderId } from '../../domain/entities/Order.js';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';

export class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.toString(), order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const order = this.orders.get(id.toString());
    return order || null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.toString());
  }

  async exists(id: OrderId): Promise<boolean> {
    return this.orders.has(id.toString());
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
    );
  }
}
