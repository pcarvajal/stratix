import type { Repository } from '@stratix/abstractions';
import type { Order, OrderId } from '../entities/Order.js';

/**
 * Repository interface for Order aggregate.
 */
export interface OrderRepository extends Repository<Order, OrderId> {
  /**
   * Finds all orders.
   */
  findAll(): Promise<Order[]>;
}
