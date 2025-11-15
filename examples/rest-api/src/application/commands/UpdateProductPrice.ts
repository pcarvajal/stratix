import { Command, CommandHandler, EventBus } from '@stratix/abstractions';
import { EntityId, Result, Success, Failure } from '@stratix/primitives';
import { ProductId } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';

export interface UpdateProductPriceInput {
  id: string;
  price: number;
}

export class UpdateProductPrice implements Command {
  constructor(public readonly data: UpdateProductPriceInput) {}
}

export class UpdateProductPriceHandler implements CommandHandler<UpdateProductPrice, Result<void>> {
  constructor(
    private readonly repository: ProductRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: UpdateProductPrice): Promise<Result<void>> {
    try {
      const productId = EntityId.from<'Product'>(command.data.id) as ProductId;
      const product = await this.repository.findById(productId);

      if (!product) {
        return Failure.create(new Error('Product not found'));
      }

      product.updatePrice(command.data.price);

      await this.repository.save(product);
      const events = product.pullDomainEvents();
      await this.eventBus.publish(events);

      return Success.create(undefined);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
