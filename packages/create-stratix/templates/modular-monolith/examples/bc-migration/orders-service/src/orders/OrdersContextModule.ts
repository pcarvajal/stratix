import { BaseContextModule } from '@stratix/runtime';
import type {
  PluginMetadata,
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
  PluginContext,
} from '@stratix/abstractions';
import { CreateOrderCommand } from './application/commands/CreateOrder.js';
import { CreateOrderHandler } from './application/commands/CreateOrderHandler.js';
import { GetOrderByIdQuery } from './application/queries/GetOrderById.js';
import { GetOrderByIdHandler } from './application/queries/GetOrderByIdHandler.js';
import { ListOrdersQuery } from './application/queries/ListOrders.js';
import { ListOrdersHandler } from './application/queries/ListOrdersHandler.js';
import { InMemoryOrderRepository } from './infrastructure/persistence/InMemoryOrderRepository.js';
import type { OrderRepository } from './domain/repositories/OrderRepository.js';

/**
 * Orders Bounded Context Module.
 *
 * This module encapsulates the entire Orders bounded context including:
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
export class OrdersContextModule extends BaseContextModule {
  readonly metadata: PluginMetadata = {
    name: 'orders-context',
    version: '1.0.0',
    description: 'Orders Bounded Context',
    dependencies: [],
  };

  readonly contextName = 'Orders';

  private orderRepository!: OrderRepository;

  /**
   * Returns all command definitions for the Orders context.
   */
  getCommands(): CommandDefinition[] {
    return [
      {
        name: 'CreateOrder',
        commandType: CreateOrderCommand,
        handler: new CreateOrderHandler(this.orderRepository),
      },
    ];
  }

  /**
   * Returns all query definitions for the Orders context.
   */
  getQueries(): QueryDefinition[] {
    return [
      {
        name: 'GetOrderById',
        queryType: GetOrderByIdQuery,
        handler: new GetOrderByIdHandler(this.orderRepository),
      },
      {
        name: 'ListOrders',
        queryType: ListOrdersQuery,
        handler: new ListOrdersHandler(this.orderRepository),
      },
    ];
  }

  /**
   * Returns all event handler definitions for the Orders context.
   */
  getEventHandlers(): EventHandlerDefinition[] {
    // Add event handlers here when needed
    return [];
  }

  /**
   * Returns all repository definitions for the Orders context.
   */
  getRepositories(): RepositoryDefinition[] {
    return [
      {
        token: 'orderRepository',
        instance: new InMemoryOrderRepository(),
        singleton: true,
      },
    ];
  }

  /**
   * Initialize the Orders context module.
   *
   * Repositories are registered first by the base class, so we can
   * resolve them here before registering commands/queries.
   */
  async initialize(context: PluginContext): Promise<void> {
    // Resolve repositories from container (registered by base class)
    this.orderRepository = context.container.resolve<OrderRepository>('orderRepository');

    // Call super to auto-register all commands, queries, and event handlers
    await super.initialize(context);
  }
}
