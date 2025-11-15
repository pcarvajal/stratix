import type { Query } from '@stratix/abstractions';

export interface GetOrderByIdInput {
  id: string;
}

export interface GetOrderByIdOutput {
  id: string;
  customerId: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Query to get a Order by ID.
 */
export class GetOrderByIdQuery implements Query {
  constructor(public readonly data: GetOrderByIdInput) {}
}
