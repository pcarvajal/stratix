import { Command, CommandHandler, EventBus } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { Product } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface CreateProductOutput {
  id: string;
}

export class CreateProduct implements Command {
  constructor(public readonly data: CreateProductInput) {}
}

export class CreateProductHandler implements CommandHandler<CreateProduct, Result<CreateProductOutput>> {
  constructor(
    private readonly repository: ProductRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    try {
      // Validate input
      if (!command.data.name || command.data.name.trim().length === 0) {
        return Failure.create(new Error('Product name is required'));
      }

      if (command.data.price < 0) {
        return Failure.create(new Error('Price cannot be negative'));
      }

      if (command.data.stock < 0) {
        return Failure.create(new Error('Stock cannot be negative'));
      }

      // Check if product with same name exists
      const existingProduct = await this.repository.findByName(command.data.name);
      if (existingProduct) {
        return Failure.create(new Error('Product with this name already exists'));
      }

      // Create product
      const product = Product.create(command.data);

      // Persist
      await this.repository.save(product);

      // Publish domain events
      const events = product.pullDomainEvents();
      await this.eventBus.publish(events);

      return Success.create({ id: product.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
