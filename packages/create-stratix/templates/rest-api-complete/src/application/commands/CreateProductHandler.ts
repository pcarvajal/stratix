// @ts-nocheck
import { CommandHandler, Logger } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { CreateProduct, CreateProductOutput } from './CreateProduct.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Product } from '../../domain/entities/Product.js';
import { Money } from '../../domain/value-objects/Money.js';

export class CreateProductHandler implements CommandHandler<CreateProduct, CreateProductOutput> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly logger: Logger
  ) {}

  async execute(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    try {
      const { name, description, price, currency, stock } = command.data;

      this.logger.info('Creating product', { name, price, currency });

      // Check if product with same name already exists
      const existing = await this.productRepository.findByName(name);
      if (existing) {
        return Result.fail(new Error(`Product with name "${name}" already exists`));
      }

      // Create Money value object
      const moneyValue = Money.create({ amount: price, currency });

      // Create Product aggregate
      const product = Product.create({
        name,
        description,
        price: moneyValue,
        stock,
      });

      // Save to repository
      await this.productRepository.save(product);

      this.logger.info('Product created successfully', { productId: product.id.value });

      return Result.ok({
        productId: product.id.value,
      });
    } catch (error) {
      this.logger.error('Failed to create product', error as Error);
      return Result.fail(error as Error);
    }
  }
}
