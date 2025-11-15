import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { ProductDto } from './GetProduct.js';

export interface ListProductsInput {
  category?: string;
  availableOnly?: boolean;
}

export interface ListProductsOutput {
  items: ProductDto[];
  total: number;
}

export class ListProducts implements Query {
  constructor(public readonly data: ListProductsInput) {}
}

export class ListProductsHandler implements QueryHandler<ListProducts, Result<ListProductsOutput>> {
  constructor(private readonly repository: ProductRepository) {}

  async handle(query: ListProducts): Promise<Result<ListProductsOutput>> {
    try {
      let products;

      if (query.data.availableOnly) {
        products = await this.repository.findAvailableProducts();
      } else if (query.data.category) {
        products = await this.repository.findByCategory(query.data.category);
      } else {
        products = await this.repository.findAll();
      }

      const items: ProductDto[] = products.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        available: product.isAvailable(),
      }));

      return Success.create({
        items,
        total: items.length,
      });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
