import { BaseContextModule } from '@stratix/runtime';
import type {
  ModuleMetadata,
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
  ModuleContext,
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
 * Products Domain Module.
 *
 * This module encapsulates the entire Products domain including:
 * - Domain entities, value objects, and events
 * - Application commands and queries with handlers
 * - Infrastructure repositories
 *
 * The module can be deployed as:
 * - Part of a monolith (alongside other modules)
 * - Standalone microservice (only this module)
 *
 * To switch from monolith to microservice, only change infrastructure
 * plugins in main.ts - NO changes needed to this module code.
 */
export class ProductsContextModule extends BaseContextModule {
  readonly metadata: ModuleMetadata = {
    name: 'products-context',
    version: '1.0.0',
    description: 'Products Domain Module',
    requiredPlugins: [],
    requiredModules: [],
  };

  readonly contextName = 'Products';

  private productRepository!: ProductRepository;

  /**
   * Returns all command definitions for the Products module.
   */
  getCommands(): CommandDefinition[] {
    // Resolve repository lazily when commands are registered
    const repo = this.productRepository || this.context?.container.resolve<ProductRepository>('productRepository');
    
    return [
      {
        name: 'CreateProduct',
        commandType: CreateProductCommand,
        handler: new CreateProductHandler(repo!),
      },
    ];
  }

  /**
   * Returns all query definitions for the Products module.
   */
  getQueries(): QueryDefinition[] {
    // Resolve repository lazily when queries are registered
    const repo = this.productRepository || this.context?.container.resolve<ProductRepository>('productRepository');
    
    return [
      {
        name: 'GetProductById',
        queryType: GetProductByIdQuery,
        handler: new GetProductByIdHandler(repo!),
      },
      {
        name: 'ListProducts',
        queryType: ListProductsQuery,
        handler: new ListProductsHandler(repo!),
      },
    ];
  }

  /**
   * Returns all event handler definitions for the Products module.
   */
  getEventHandlers(): EventHandlerDefinition[] {
    // Add event handlers here when needed
    return [];
  }

  /**
   * Returns all repository definitions for the Products module.
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
   * Initialize the Products module.
   *
   * The base class will:
   * 1. Register all repositories in the container
   * 2. Call getCommands(), getQueries(), getEventHandlers()
   * 3. Register commands/queries with their buses
   * 4. Subscribe event handlers
   *
   * After super.initialize(), repositories are available for resolution.
   */
  async initialize(context: ModuleContext): Promise<void> {
    // Call super first to register repositories and CQRS components
    await super.initialize(context);
    
    // Now repositories are registered and we can resolve them for later use
    this.productRepository = context.container.resolve<ProductRepository>('productRepository');
  }
}
