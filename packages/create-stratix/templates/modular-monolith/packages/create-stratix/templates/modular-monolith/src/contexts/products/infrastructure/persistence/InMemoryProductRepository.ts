import type { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Product, type ProductId } from '../../domain/entities/Product.js';

/**
 * In-memory implementation of ProductRepository.
 *
 * For production, replace with PostgresPlugin or MongoDBPlugin repository.
 */
export class InMemoryProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();

  async save(product: Product): Promise<void> {
    this.products.set(product.id.value, product);
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.value) || null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.value);
  }

  async exists(id: ProductId): Promise<boolean> {
    return this.products.has(id.value);
  }

  /**
   * Clears all products (useful for testing).
   */
  async clear(): Promise<void> {
    this.products.clear();
  }
}
