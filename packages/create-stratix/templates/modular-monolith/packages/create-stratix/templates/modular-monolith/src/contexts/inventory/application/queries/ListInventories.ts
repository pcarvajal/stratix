import type { Query } from '@stratix/abstractions';
import type { GetInventoryByIdOutput } from './GetInventoryById.js';

export interface ListInventoriesOutput {
  inventories: GetInventoryByIdOutput[];
  total: number;
}

/**
 * Query to list all inventories.
 */
export class ListInventoriesQuery implements Query {
  constructor() {}
}
