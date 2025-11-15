// @ts-nocheck
import { CommandHandler, Logger } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { UpdateProduct } from './UpdateProduct.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { ProductId } from '../../domain/entities/Product.js';
import { Money } from '../../domain/value-objects/Money.js';

export class UpdateProductHandler implements CommandHandler<UpdateProduct, void> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(command: UpdateProduct): Promise<Result<void>> {
    try {
      const { id, name, description, price, currency, stock } = command.data;

      const productId = ProductId.from(id);
      const product = await this.productRepository.findById(productId);

      if (!product) {
        return Result.fail(new Error(`Product with ID "${id}" not found`));
      }

      if (name) product.updateName(name);
      if (description !== undefined) product.updateDescription(description);
      if (price && currency) {
        const moneyValue = Money.create({ amount: price, currency });
        product.updatePrice(moneyValue);
      }
      if (stock !== undefined) {
        const diff = stock - product.stock;
        if (diff > 0) product.increaseStock(diff);
        else if (diff < 0) product.decreaseStock(Math.abs(diff));
      }

      await this.productRepository.save(product);

      this.logger.info('Product updated successfully', { productId: id });

      return Result.ok(undefined);
    } catch (error) {
      this.logger.error('Failed to update product', error as Error);
      return Result.fail(error as Error);
    }
  }
}
