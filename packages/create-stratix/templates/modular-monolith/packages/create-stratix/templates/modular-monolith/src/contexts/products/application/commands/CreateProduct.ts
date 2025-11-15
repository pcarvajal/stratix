import type { Command } from '@stratix/abstractions';

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
}

export interface CreateProductOutput {
  productId: string;
}

/**
 * Command to create a new Product.
 */
export class CreateProductCommand implements Command {
  constructor(public readonly data: CreateProductInput) {}
}
