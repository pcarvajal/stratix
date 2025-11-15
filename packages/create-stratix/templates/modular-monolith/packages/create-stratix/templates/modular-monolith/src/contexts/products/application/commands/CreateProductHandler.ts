import type { CommandHandler } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import type { CreateProductCommand, CreateProductOutput } from './CreateProduct.js';
import { Product } from '../../domain/entities/Product.js';
import type { ProductRepository } from '../../domain/repositories/ProductRepository.js';

/**
 * Handler for CreateProduct command.
 */
export class CreateProductHandler
  implements CommandHandler<CreateProductCommand, Result<CreateProductOutput>>
{
  constructor(private readonly productRepository: ProductRepository) {}

  async handle(command: CreateProductCommand): Promise<Result<CreateProductOutput>> {
    try {
      const { data } = command;

      // Create aggregate
      const product = Product.create({
        name: data.name,
        price: data.price,
        stock: data.stock,
      });

      // Save to repository
      await this.productRepository.save(product);

      return Result.ok({
        productId: product.id.value,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
