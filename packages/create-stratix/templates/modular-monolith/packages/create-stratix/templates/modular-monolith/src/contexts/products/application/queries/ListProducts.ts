import type { Query } from '@stratix/abstractions';
import type { GetProductByIdOutput } from './GetProductById.js';

export interface ListProductsOutput {
  products: GetProductByIdOutput[];
  total: number;
}

/**
 * Query to list all products.
 */
export class ListProductsQuery implements Query {
  constructor() {}
}
