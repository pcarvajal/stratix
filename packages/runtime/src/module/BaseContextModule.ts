import {
  ContextModule,
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
  ModuleContext,
  ModuleMetadata,
  HealthCheckResult,
  HealthStatus,
  ServiceLifetime,
} from '@stratix/core';

/**
 * Base implementation for domain modules.
 *
 * Provides automatic registration of commands, queries, event handlers,
 * and repositories during the initialize phase.
 *
 * Subclasses only need to:
 * 1. Define metadata (name, version, dependencies)
 * 2. Set contextName
 * 3. Implement getCommands(), getQueries(), getEventHandlers(), getRepositories()
 *
 * The base class handles all the wiring automatically.
 *
 * Note: ContextModule is different from Plugin:
 * - Plugin: Infrastructure extensions (Postgres, Redis, RabbitMQ)
 * - ContextModule: Domain/business logic modules (Orders, Products, Inventory)
 *
 * @example
 * ```typescript
 * export class ProductsContextModule extends BaseContextModule {
 *   readonly metadata: ModuleMetadata = {
 *     name: 'products-context',
 *     version: '1.0.0',
 *     description: 'Products Domain Module',
 *     requiredPlugins: ['postgres'],
 *     requiredModules: []
 *   };
 *
 *   readonly contextName = 'Products';
 *
 *   private productRepository!: ProductRepository;
 *
 *   getCommands(): CommandDefinition[] {
 *     return [
 *       {
 *         name: 'CreateProduct',
 *         commandType: CreateProductCommand,
 *         handler: new CreateProductHandler(this.productRepository)
 *       },
 *       {
 *         name: 'UpdateProduct',
 *         commandType: UpdateProductCommand,
 *         handler: new UpdateProductHandler(this.productRepository)
 *       }
 *     ];
 *   }
 *
 *   getQueries(): QueryDefinition[] {
 *     return [
 *       {
 *         name: 'GetProductById',
 *         queryType: GetProductByIdQuery,
 *         handler: new GetProductByIdHandler(this.productRepository)
 *       },
 *       {
 *         name: 'ListProducts',
 *         queryType: ListProductsQuery,
 *         handler: new ListProductsHandler(this.productRepository)
 *       }
 *     ];
 *   }
 *
 *   getEventHandlers(): EventHandlerDefinition[] {
 *     return [
 *       {
 *         eventName: 'ProductCreated',
 *         eventType: ProductCreatedEvent,
 *         handler: new ProductCreatedHandler()
 *       }
 *     ];
 *   }
 *
 *   getRepositories(): RepositoryDefinition[] {
 *     return [
 *       {
 *         token: 'productRepository',
 *         instance: new InMemoryProductRepository(),
 *         singleton: true
 *       }
 *     ];
 *   }
 *
 *   async initialize(context: ModuleContext): Promise<void> {
 *     // Repositories are registered first, so we can resolve them
 *     this.productRepository = context.container.resolve<ProductRepository>('productRepository');
 *
 *     // Call super to register all commands, queries, events
 *     await super.initialize(context);
 *   }
 * }
 * ```
 */
export abstract class BaseContextModule implements ContextModule {
  /**
   * Module metadata (name, version, dependencies).
   * Must be implemented by subclasses.
   */
  abstract readonly metadata: ModuleMetadata;

  /**
   * The name of the domain module.
   * Must be implemented by subclasses.
   */
  abstract readonly contextName: string;

  /**
   * Reference to the module context, available after initialize.
   */
  protected context?: ModuleContext;

  /**
   * Returns all command definitions for this module.
   * Override to provide commands for this domain module.
   *
   * @returns Array of command definitions (empty by default)
   */
  getCommands(): CommandDefinition[] {
    return [];
  }

  /**
   * Returns all query definitions for this module.
   * Override to provide queries for this domain module.
   *
   * @returns Array of query definitions (empty by default)
   */
  getQueries(): QueryDefinition[] {
    return [];
  }

  /**
   * Returns all event handler definitions for this module.
   * Override to provide event handlers for this domain module.
   *
   * @returns Array of event handler definitions (empty by default)
   */
  getEventHandlers(): EventHandlerDefinition[] {
    return [];
  }

  /**
   * Returns all repository definitions for this module.
   * Override to provide repositories for this domain module.
   *
   * @returns Array of repository definitions (empty by default)
   */
  getRepositories(): RepositoryDefinition[] {
    return [];
  }

  /**
   * Initializes the domain module.
   *
   * This method:
   * 1. Registers all repositories in the DI container
   * 2. Registers all commands with the command bus
   * 3. Registers all queries with the query bus
   * 4. Subscribes all event handlers to the event bus
   *
   * Subclasses can override this method but should call super.initialize()
   * to ensure automatic registration happens.
   *
   * @param context - The module context
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(context: ModuleContext): Promise<void> {
    this.context = context;

    // 1. Register repositories first (other things depend on them)
    const repositories = this.getRepositories();
    for (const repo of repositories) {
      context.container.register(repo.token, () => repo.instance, {
        lifetime: repo.singleton !== false ? ServiceLifetime.SINGLETON : ServiceLifetime.TRANSIENT,
      });
    }

    // 2. Get the buses from container
    const commandBus = context.container.resolve<{
      register: (commandType: new (...args: unknown[]) => unknown, handler: unknown) => void;
    }>('commandBus');

    const queryBus = context.container.resolve<{
      register: (queryType: new (...args: unknown[]) => unknown, handler: unknown) => void;
    }>('queryBus');

    const eventBus = context.container.resolve<{
      subscribe: (eventType: new (...args: unknown[]) => unknown, handler: unknown) => void;
    }>('eventBus');

    // 3. Register commands
    const commands = this.getCommands();
    for (const cmd of commands) {
      commandBus.register(cmd.commandType, cmd.handler);
    }

    // 4. Register queries
    const queries = this.getQueries();
    for (const query of queries) {
      queryBus.register(query.queryType, query.handler);
    }

    // 5. Subscribe event handlers
    const eventHandlers = this.getEventHandlers();
    for (const handler of eventHandlers) {
      eventBus.subscribe(handler.eventType, handler.handler);
    }
  }

  /**
   * Starts the domain module.
   * Override if your module needs to start external resources.
   *
   * @example
   * ```typescript
   * async start(): Promise<void> {
   *   await super.start();
   *   // Start any module-specific resources
   *   await this.myService.connect();
   * }
   * ```
   */
  async start(): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override if needed
  }

  /**
   * Stops the domain module.
   * Override if your module needs to clean up resources.
   *
   * @example
   * ```typescript
   * async stop(): Promise<void> {
   *   await this.myService.disconnect();
   *   await super.stop();
   * }
   * ```
   */
  async stop(): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override if needed
  }

  /**
   * Health check for the domain module.
   * Default implementation returns healthy.
   * Override to provide custom health checks.
   *
   * @returns Health check result
   *
   * @example
   * ```typescript
   * async healthCheck(): Promise<HealthCheckResult> {
   *   try {
   *     await this.productRepository.findAll();
   *     return { status: HealthStatus.UP };
   *   } catch (error) {
   *     return {
   *       status: HealthStatus.DOWN,
   *       message: `Repository error: ${error.message}`
   *     };
   *   }
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: HealthStatus.UP,
      message: `${this.contextName} module is healthy`,
    };
  }
}
