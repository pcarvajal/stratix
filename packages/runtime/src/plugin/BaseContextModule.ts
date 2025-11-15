import {
  ContextModule,
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
  PluginContext,
  PluginMetadata,
  HealthCheckResult,
  HealthStatus,
  ServiceLifetime,
} from '@stratix/abstractions';

/**
 * Base implementation for Context Modules.
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
 *   readonly metadata: PluginMetadata = {
 *     name: 'products-context',
 *     version: '1.0.0',
 *     description: 'Products Bounded Context',
 *     dependencies: ['logger', 'database']
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
 *   async initialize(context: PluginContext): Promise<void> {
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
   * Plugin metadata (name, version, dependencies).
   * Must be implemented by subclasses.
   */
  abstract readonly metadata: PluginMetadata;

  /**
   * The name of the Bounded Context.
   * Must be implemented by subclasses.
   */
  abstract readonly contextName: string;

  /**
   * Reference to the plugin context, available after initialize.
   */
  protected context?: PluginContext;

  /**
   * Returns all command definitions for this context.
   * Override to provide commands for this bounded context.
   *
   * @returns Array of command definitions (empty by default)
   */
  getCommands(): CommandDefinition[] {
    return [];
  }

  /**
   * Returns all query definitions for this context.
   * Override to provide queries for this bounded context.
   *
   * @returns Array of query definitions (empty by default)
   */
  getQueries(): QueryDefinition[] {
    return [];
  }

  /**
   * Returns all event handler definitions for this context.
   * Override to provide event handlers for this bounded context.
   *
   * @returns Array of event handler definitions (empty by default)
   */
  getEventHandlers(): EventHandlerDefinition[] {
    return [];
  }

  /**
   * Returns all repository definitions for this context.
   * Override to provide repositories for this bounded context.
   *
   * @returns Array of repository definitions (empty by default)
   */
  getRepositories(): RepositoryDefinition[] {
    return [];
  }

  /**
   * Initializes the context module.
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
   * @param context - The plugin context
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(context: PluginContext): Promise<void> {
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
   * Starts the context module.
   * Override if your context needs to start external resources.
   *
   * @example
   * ```typescript
   * async start(): Promise<void> {
   *   await super.start();
   *   // Start any context-specific resources
   *   await this.myService.connect();
   * }
   * ```
   */
  async start(): Promise<void> {
    // Default implementation does nothing
    // Subclasses can override if needed
  }

  /**
   * Stops the context module.
   * Override if your context needs to clean up resources.
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
   * Health check for the context module.
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
      message: `${this.contextName} context is healthy`,
    };
  }
}
