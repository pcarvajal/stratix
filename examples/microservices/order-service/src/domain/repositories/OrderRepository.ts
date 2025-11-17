import { Repository } from '@stratix/abstractions';
import { Order, OrderId } from '../entities/Order.js';

export interface OrderRepository extends Repository<Order, OrderId> {
  // Make base methods required for this repository
  findById(id: OrderId): Promise<Order | null>;

  // Domain-specific queries
  findByCustomerId(customerId: string): Promise<Order[]>;
}
