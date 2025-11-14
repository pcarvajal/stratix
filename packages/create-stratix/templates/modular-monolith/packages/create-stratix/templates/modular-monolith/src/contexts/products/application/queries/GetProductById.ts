import type { Query } from '@stratix/abstractions';

export interface GetProductByIdInput {
  id: string;
}

export interface GetProductByIdOutput {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Query to get a Product by ID.
 */
export class GetProductByIdQuery implements Query {
  constructor(public readonly data: GetProductByIdInput) {}
}
