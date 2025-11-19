import { ModuleMetadata } from './ModuleMetadata.js';
import { ModuleContext } from './ModuleContext.js';
import { CommandDefinition, QueryDefinition, EventHandlerDefinition, RepositoryDefinition } from './definitions.js';
import { HealthCheckResult } from '../infrastructure/HealthCheck.js';

/**
 * Context Module interface for domain modules.
 *
 * A ContextModule represents a complete domain module.
 * It encapsulates all domain logic, commands, queries, events, and repositories
 * for a specific subdomain.
 *
 * This allows modules to be:
 * - Self-contained units of deployment
 * - Portable between monolith and microservices architectures
 * - Hot-swappable without changing domain code
 *
 * Note: ContextModule is OPTIONAL. Applications can:
 * - Use ContextModule for organization (recommended for multiple modules)
 * - Register commands/queries manually (simpler for small apps)
 * - Mix both approaches
 *
 * Key Differences from Plugin:
 * - Plugin: Infrastructure extensions (Postgres, Redis, RabbitMQ)
 * - ContextModule: Domain/business logic modules (Orders, Products, Inventory)
 *
 * @example
 * ```typescript
 * class ProductsModule extends BaseContextModule {
 *   readonly metadata: ModuleMetadata = {
 *     name: 'products-context',
 *     version: '1.0.0',
 *     description: 'Products Domain Module',
 *     requiredPlugins: ['postgres'],
 *     requiredModules: []
 *   };
 *
 *   contextName = 'Products';
 *
 *   getCommands(): CommandDefinition[] {
 *     return [
 *       {
 *         name: 'CreateProduct',
 *         commandType: CreateProductCommand,
 *         handler: new CreateProductHandler(this.productRepository)
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
 * }
 * ```
 */
export interface ContextModule {
  /**
   * Module metadata (name, version, dependencies).
   */
  readonly metadata: ModuleMetadata;

  /**
   * The name of the domain module.
   * Should be a PascalCase noun (e.g., 'Products', 'Orders', 'Inventory').
   */
  readonly contextName: string;

  /**
   * Returns all command definitions for this module.
   *
   * Commands represent write operations in the CQRS pattern.
   * Each command should have exactly one handler.
   *
   * @returns Array of command definitions (empty by default)
   */
  getCommands?(): CommandDefinition[];

  /**
   * Returns all query definitions for this module.
   *
   * Queries represent read operations in the CQRS pattern.
   * Each query should have exactly one handler.
   *
   * @returns Array of query definitions (empty by default)
   */
  getQueries?(): QueryDefinition[];

  /**
   * Returns all event handler definitions for this module.
   *
   * Event handlers react to domain events from this or other modules.
   * Multiple handlers can subscribe to the same event.
   *
   * @returns Array of event handler definitions (empty by default)
   */
  getEventHandlers?(): EventHandlerDefinition[];

  /**
   * Returns all repository definitions for this module.
   *
   * Repositories abstract persistence for aggregates in this module.
   * Registered in the DI container during initialization.
   *
   * @returns Array of repository definitions (empty by default)
   */
  getRepositories?(): RepositoryDefinition[];

  /**
   * Initializes the module.
   *
   * Called during application startup, after all required plugins and modules are initialized.
   * Register services in the container during this phase.
   *
   * @param context - The module context
   *
   * @example
   * ```typescript
   * async initialize(context: ModuleContext): Promise<void> {
   *   this.repository = context.container.resolve('productRepository');
   *   await super.initialize(context);
   * }
   * ```
   */
  initialize?(context: ModuleContext): Promise<void>;

  /**
   * Starts the module.
   *
   * Called after all modules are initialized, before the application starts.
   * Connect to external resources during this phase.
   *
   * @example
   * ```typescript
   * async start(): Promise<void> {
   *   await this.service.connect();
   * }
   * ```
   */
  start?(): Promise<void>;

  /**
   * Stops the module.
   *
   * Called during application shutdown, in reverse dependency order.
   * Close connections and clean up resources during this phase.
   *
   * @example
   * ```typescript
   * async stop(): Promise<void> {
   *   await this.service.disconnect();
   * }
   * ```
   */
  stop?(): Promise<void>;

  /**
   * Performs a health check for the module.
   *
   * @returns The health check result
   *
   * @example
   * ```typescript
   * async healthCheck(): Promise<HealthCheckResult> {
   *   try {
   *     await this.repository.findAll();
   *     return { status: HealthStatus.UP };
   *   } catch (error) {
   *     return { status: HealthStatus.DOWN, message: error.message };
   *   }
   * }
   * ```
   */
  healthCheck?(): Promise<HealthCheckResult>;
}
