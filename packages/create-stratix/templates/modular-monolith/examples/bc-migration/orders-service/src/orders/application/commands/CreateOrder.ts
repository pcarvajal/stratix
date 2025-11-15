import type { Command } from '@stratix/abstractions';

export interface CreateOrderInput {
  customerId: string;
  total: number;
  status: string;
}

export interface CreateOrderOutput {
  orderId: string;
}

/**
 * Command to create a new Order.
 */
export class CreateOrderCommand implements Command {
  constructor(public readonly data: CreateOrderInput) {}
}
