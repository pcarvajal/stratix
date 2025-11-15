// @ts-nocheck
import { QueryHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { ListProducts, ListProductsOutput } from './ListProducts.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { ProductDTO } from './GetProductById.js';

export class ListProductsHandler implements QueryHandler<ListProducts, ListProductsOutput> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(_query: ListProducts): Promise<Result<ListProductsOutput>> {
    try {
      const products = await this.productRepository.findAll();

      const productDTOs: ProductDTO[] = products.map((product) => ({
        id: product.id.value,
        name: product.name,
        description: product.description,
        price: product.price.amount,
        currency: product.price.currency,
        stock: product.stock,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }));

      return Result.ok({
        products: productDTOs,
        total: productDTOs.length,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
