// @ts-nocheck
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Product, ProductId } from '../../domain/entities/Product.js';

export class InMemoryProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: ProductId): Promise<Product | null> {
    const product = this.products.get(id.value);
    return product || null;
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id.value, product);
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.value);
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findByName(name: string): Promise<Product | null> {
    const products = Array.from(this.products.values());
    return products.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // Helper method for testing
  clear(): void {
    this.products.clear();
  }
}
