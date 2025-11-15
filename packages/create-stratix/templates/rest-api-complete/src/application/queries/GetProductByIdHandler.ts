// @ts-nocheck
import { QueryHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { GetProductById, ProductDTO } from './GetProductById.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { ProductId } from '../../domain/entities/Product.js';

export class GetProductByIdHandler implements QueryHandler<GetProductById, ProductDTO> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductById): Promise<Result<ProductDTO>> {
    try {
      const { id } = query.data;

      const productId = ProductId.from(id);
      const product = await this.productRepository.findById(productId);

      if (!product) {
        return Result.fail(new Error(`Product with ID "${id}" not found`));
      }

      const dto: ProductDTO = {
        id: product.id.value,
        name: product.name,
        description: product.description,
        price: product.price.amount,
        currency: product.price.currency,
        stock: product.stock,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };

      return Result.ok(dto);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
