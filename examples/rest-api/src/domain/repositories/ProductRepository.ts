import { Repository } from '@stratix/abstractions';
import { Product, ProductId } from '../entities/Product.js';

export interface ProductRepository extends Repository<Product, ProductId> {
  // Make base methods required for this repository
  findById(id: ProductId): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  delete(id: ProductId): Promise<void>;

  // Domain-specific queries
  findByCategory(category: string): Promise<Product[]>;
  findByName(name: string): Promise<Product | null>;
  findAvailableProducts(): Promise<Product[]>;
}
