import type { QueryHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import type { ListProductsQuery, ListProductsOutput } from './ListProducts.js';
import type { ProductRepository } from '../../domain/repositories/ProductRepository.js';

/**
 * Handler for ListProducts query.
 */
export class ListProductsHandler implements QueryHandler<ListProductsQuery, Result<ListProductsOutput>> {
  constructor(private readonly productRepository: ProductRepository) {}

  async handle(query: ListProductsQuery): Promise<Result<ListProductsOutput>> {
    try {
      const products = await this.productRepository.findAll();

      return Result.ok({
        products: products.map((product) => ({
          id: product.id.value,
          name: product.name,
          price: product.price,
          stock: product.stock
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
        total: products.length,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
