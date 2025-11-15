// @ts-nocheck
import { Query } from '@stratix/abstractions';
import { ProductDTO } from './GetProductById.js';

export interface ListProductsOutput {
  products: ProductDTO[];
  total: number;
}

export class ListProducts implements Query<void, ListProductsOutput> {
  constructor(public readonly data: void = undefined) {}
}
