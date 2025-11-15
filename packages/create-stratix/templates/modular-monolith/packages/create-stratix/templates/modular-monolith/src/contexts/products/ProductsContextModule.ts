import { BaseContextModule } from '@stratix/runtime';
import type {
  PluginMetadata,
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
  PluginContext,
} from '@stratix/abstractions';
import { CreateProductCommand } from './application/commands/CreateProduct.js';
import { CreateProductHandler } from './application/commands/CreateProductHandler.js';
import { GetProductByIdQuery } from './application/queries/GetProductById.js';
import { GetProductByIdHandler } from './application/queries/GetProductByIdHandler.js';
import { ListProductsQuery } from './application/queries/ListProducts.js';
import { ListProductsHandler } from './application/queries/ListProductsHandler.js';
import { InMemoryProductRepository } from './infrastructure/persistence/InMemoryProductRepository.js';
import type { ProductRepository } from './domain/repositories/ProductRepository.js';

/**
 * Products Bounded Context Module.
 *
 * This module encapsulates the entire Products bounded context including:
 * - Domain entities, value objects, and events
 * - Application commands and queries with handlers
 * - Infrastructure repositories
 *
 * The module can be deployed as:
 * - Part of a monolith (alongside other context modules)
 * - Standalone microservice (only this context)
 *
 * To switch from monolith to microservice, only change infrastructure
 * modules in main.ts - NO changes needed to this context code.
 */
export class ProductsContextModule extends BaseContextModule {
  readonly metadata: PluginMetadata = {
    name: 'products-context',
    version: '1.0.0',
    description: 'Products Bounded Context',
    dependencies: [],
  };

  readonly contextName = 'Products';

  private productRepository!: ProductRepository;

  /**
   * Returns all command definitions for the Products context.
   */
  getCommands(): CommandDefinition[] {
    return [
      {
        name: 'CreateProduct',
        commandType: CreateProductCommand,
        handler: new CreateProductHandler(this.productRepository),
      },
    ];
  }

  /**
   * Returns all query definitions for the Products context.
   */
  getQueries(): QueryDefinition[] {
    return [
      {
        name: 'GetProductById',
        queryType: GetProductByIdQuery,
        handler: new GetProductByIdHandler(this.productRepository),
      },
      {
        name: 'ListProducts',
        queryType: ListProductsQuery,
        handler: new ListProductsHandler(this.productRepository),
      },
    ];
  }

  /**
   * Returns all event handler definitions for the Products context.
   */
  getEventHandlers(): EventHandlerDefinition[] {
    // Add event handlers here when needed
    return [];
  }

  /**
   * Returns all repository definitions for the Products context.
   */
  getRepositories(): RepositoryDefinition[] {
    return [
      {
        token: 'productRepository',
        instance: new InMemoryProductRepository(),
        singleton: true,
      },
    ];
  }

  /**
   * Initialize the Products context module.
   *
   * Repositories are registered first by the base class, so we can
   * resolve them here before registering commands/queries.
   */
  async initialize(context: PluginContext): Promise<void> {
    // Resolve repositories from container (registered by base class)
    this.productRepository = context.container.resolve<ProductRepository>('productRepository');

    // Call super to auto-register all commands, queries, and event handlers
    await super.initialize(context);
  }
}
