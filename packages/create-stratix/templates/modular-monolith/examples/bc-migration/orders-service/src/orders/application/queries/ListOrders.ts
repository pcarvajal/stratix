import type { Query } from '@stratix/abstractions';
import type { GetOrderByIdOutput } from './GetOrderById.js';

export interface ListOrdersOutput {
  orders: GetOrderByIdOutput[];
  total: number;
}

/**
 * Query to list all orders.
 */
export class ListOrdersQuery implements Query {
  constructor() {}
}
