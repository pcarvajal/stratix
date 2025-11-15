// Context Module
export { ProductsContextModule } from './ProductsContextModule.js';

// Domain
export { Product, type ProductId, type ProductProps } from './domain/entities/Product.js';
export { ProductCreatedEvent } from './domain/events/ProductCreated.js';
export type { ProductRepository } from './domain/repositories/ProductRepository.js';

// Application - Commands
export {
  CreateProductCommand,
  type CreateProductInput,
  type CreateProductOutput,
} from './application/commands/CreateProduct.js';

// Application - Queries
export {
  GetProductByIdQuery,
  type GetProductByIdInput,
  type GetProductByIdOutput,
} from './application/queries/GetProductById.js';
export { ListProductsQuery, type ListProductsOutput } from './application/queries/ListProducts.js';

// Infrastructure
export { InMemoryProductRepository } from './infrastructure/persistence/InMemoryProductRepository.js';
