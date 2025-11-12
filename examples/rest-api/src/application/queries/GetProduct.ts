import { Query, QueryHandler } from '@stratix/abstractions';
import { EntityId, Result, Success, Failure } from '@stratix/primitives';
import { ProductId } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';

export interface GetProductInput {
  id: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  available: boolean;
}

export class GetProduct implements Query {
  constructor(public readonly data: GetProductInput) {}
}

export class GetProductHandler implements QueryHandler<GetProduct, Result<ProductDto>> {
  constructor(private readonly repository: ProductRepository) {}

  async handle(query: GetProduct): Promise<Result<ProductDto>> {
    try {
      const productId = EntityId.from<'Product'>(query.data.id) as ProductId;
      const product = await this.repository.findById(productId);

      if (!product) {
        return Failure.create(new Error('Product not found'));
      }

      const dto: ProductDto = {
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        available: product.isAvailable(),
      };

      return Success.create(dto);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
