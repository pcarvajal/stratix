import type { QueryHandler } from '@stratix/abstractions';
import { Result, EntityId } from '@stratix/primitives';
import type { GetProductByIdQuery, GetProductByIdOutput } from './GetProductById.js';
import type { ProductId } from '../../domain/entities/Product.js';
import type { ProductRepository } from '../../domain/repositories/ProductRepository.js';

/**
 * Handler for GetProductById query.
 */
export class GetProductByIdHandler implements QueryHandler<GetProductByIdQuery, Result<GetProductByIdOutput>> {
  constructor(private readonly productRepository: ProductRepository) {}

  async handle(query: GetProductByIdQuery): Promise<Result<GetProductByIdOutput>> {
    try {
      const { id } = query.data;

      const product = await this.productRepository.findById(
        EntityId.from<'Product'>(id)
      );

      if (!product) {
        return Result.fail(new Error('Product not found'));
      }

      return Result.ok({
        id: product.id.value,
        name: product.name,
        price: product.price,
        stock: product.stock
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
