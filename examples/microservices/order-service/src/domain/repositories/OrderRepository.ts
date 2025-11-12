import { Repository } from '@stratix/abstractions';
import { Order, OrderId } from '../entities/Order.js';

export interface OrderRepository extends Repository<Order, OrderId> {
  findByCustomerId(customerId: string): Promise<Order[]>;
}
