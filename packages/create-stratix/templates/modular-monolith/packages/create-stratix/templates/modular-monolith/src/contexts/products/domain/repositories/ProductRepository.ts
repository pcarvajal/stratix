import type { Repository } from '@stratix/abstractions';
import type { Product, ProductId } from '../entities/Product.js';

/**
 * Repository interface for Product aggregate.
 */
export interface ProductRepository extends Repository<Product, ProductId> {
  /**
   * Finds all products.
   */
  findAll(): Promise<Product[]>;
}
