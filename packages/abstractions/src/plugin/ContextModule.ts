import { Plugin } from './Plugin.js';
import { Command } from '../messaging/Command.js';
import { Query } from '../messaging/Query.js';
import { Event } from '../messaging/Event.js';
import { CommandHandler } from '../messaging/CommandHandler.js';
import { QueryHandler } from '../messaging/QueryHandler.js';
import { EventHandler } from '../messaging/EventHandler.js';

/**
 * Definition for registering a command with its handler.
 *
 * @template TCommand - The command type
 * @template TResult - The result type returned by the handler
 */
export interface CommandDefinition<TCommand extends Command = Command, TResult = unknown> {
  /**
   * Unique name for the command type.
   */
  readonly name: string;

  /**
   * The command class constructor.
   */
  readonly commandType: new (...args: unknown[]) => TCommand;

  /**
   * The handler instance for this command.
   */
  readonly handler: CommandHandler<TCommand, TResult>;
}

/**
 * Definition for registering a query with its handler.
 *
 * @template TQuery - The query type
 * @template TResult - The result type returned by the handler
 */
export interface QueryDefinition<TQuery extends Query = Query, TResult = unknown> {
  /**
   * Unique name for the query type.
   */
  readonly name: string;

  /**
   * The query class constructor.
   */
  readonly queryType: new (...args: unknown[]) => TQuery;

  /**
   * The handler instance for this query.
   */
  readonly handler: QueryHandler<TQuery, TResult>;
}

/**
 * Definition for registering an event handler.
 *
 * @template TEvent - The event type
 */
export interface EventHandlerDefinition<TEvent extends Event = Event> {
  /**
   * Name of the event to handle.
   */
  readonly eventName: string;

  /**
   * The event class constructor.
   */
  readonly eventType: new (...args: unknown[]) => TEvent;

  /**
   * The handler instance for this event.
   */
  readonly handler: EventHandler<TEvent>;
}

/**
 * Definition for registering a repository or service in the DI container.
 */
export interface RepositoryDefinition {
  /**
   * Token or name to register in the container.
   */
  readonly token: string;

  /**
   * The repository or service instance/factory.
   */
  readonly instance: unknown;

  /**
   * Whether this is a singleton (default: true).
   */
  readonly singleton?: boolean;
}

/**
 * Context Module interface for Bounded Contexts.
 *
 * A ContextModule represents a complete Bounded Context in DDD terms.
 * It encapsulates all domain logic, commands, queries, events, and repositories
 * for a specific subdomain.
 *
 * This allows Bounded Contexts to be:
 * - Self-contained units of deployment
 * - Portable between monolith and microservices architectures
 * - Hot-swappable without changing domain code
 *
 * Note: ContextModule is different from Plugin:
 * - Plugin: Infrastructure extensions (Postgres, Redis, RabbitMQ)
 * - ContextModule: Domain/business logic modules (Orders, Products, Inventory)
 *
 * @example
 * ```typescript
 * class ProductsModule extends BaseContextModule {
 *   readonly metadata = {
 *     name: 'products-context',
 *     version: '1.0.0',
 *     description: 'Products Bounded Context',
 *     dependencies: ['logger', 'database']
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
export interface ContextModule extends Plugin {
  /**
   * The name of the Bounded Context.
   * Should be a PascalCase noun (e.g., 'Products', 'Orders', 'Inventory').
   */
  readonly contextName: string;

  /**
   * Returns all command definitions for this context.
   *
   * Commands represent write operations in the CQRS pattern.
   * Each command should have exactly one handler.
   *
   * @returns Array of command definitions
   */
  getCommands(): CommandDefinition[];

  /**
   * Returns all query definitions for this context.
   *
   * Queries represent read operations in the CQRS pattern.
   * Each query should have exactly one handler.
   *
   * @returns Array of query definitions
   */
  getQueries(): QueryDefinition[];

  /**
   * Returns all event handler definitions for this context.
   *
   * Event handlers react to domain events from this or other contexts.
   * Multiple handlers can subscribe to the same event.
   *
   * @returns Array of event handler definitions
   */
  getEventHandlers(): EventHandlerDefinition[];

  /**
   * Returns all repository definitions for this context.
   *
   * Repositories abstract persistence for aggregates in this context.
   * Registered in the DI container during initialization.
   *
   * @returns Array of repository definitions
   */
  getRepositories(): RepositoryDefinition[];
}
