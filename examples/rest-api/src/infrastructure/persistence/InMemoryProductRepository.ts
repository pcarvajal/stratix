import { Product, ProductId } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';

export class InMemoryProductRepository implements ProductRepository {
  private products = new Map<string, Product>();

  async save(product: Product): Promise<void> {
    this.products.set(product.id.toString(), product);
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.toString()) || null;
  }

  async findByName(name: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.name === name) {
        return product;
      }
    }
    return null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const products: Product[] = [];
    for (const product of this.products.values()) {
      if (product.category === category) {
        products.push(product);
      }
    }
    return products;
  }

  async findAvailableProducts(): Promise<Product[]> {
    const products: Product[] = [];
    for (const product of this.products.values()) {
      if (product.isAvailable()) {
        products.push(product);
      }
    }
    return products;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.toString());
  }

  async exists(id: ProductId): Promise<boolean> {
    return this.products.has(id.toString());
  }

  async count(): Promise<number> {
    return this.products.size;
  }
}
