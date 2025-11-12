import { Repository } from '@stratix/abstractions';
import { Product, ProductId } from '../entities/Product.js';

export interface ProductRepository extends Repository<Product, ProductId> {
  findByCategory(category: string): Promise<Product[]>;
  findByName(name: string): Promise<Product | null>;
  findAvailableProducts(): Promise<Product[]>;
}
