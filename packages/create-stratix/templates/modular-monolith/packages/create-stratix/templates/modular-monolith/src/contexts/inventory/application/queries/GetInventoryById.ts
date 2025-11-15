import type { Query } from '@stratix/abstractions';

export interface GetInventoryByIdInput {
  id: string;
}

export interface GetInventoryByIdOutput {
  id: string;
  productId: string;
  quantity: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Query to get a Inventory by ID.
 */
export class GetInventoryByIdQuery implements Query {
  constructor(public readonly data: GetInventoryByIdInput) {}
}
