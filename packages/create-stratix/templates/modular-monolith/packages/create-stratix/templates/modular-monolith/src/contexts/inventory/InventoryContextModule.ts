import { BaseContextModule } from '@stratix/runtime';
import type {
  ModuleMetadata,
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
  ModuleContext,
} from '@stratix/abstractions';
import { CreateInventoryCommand } from './application/commands/CreateInventory.js';
import { CreateInventoryHandler } from './application/commands/CreateInventoryHandler.js';
import { GetInventoryByIdQuery } from './application/queries/GetInventoryById.js';
import { GetInventoryByIdHandler } from './application/queries/GetInventoryByIdHandler.js';
import { ListInventoriesQuery } from './application/queries/ListInventories.js';
import { ListInventoriesHandler } from './application/queries/ListInventoriesHandler.js';
import { InMemoryInventoryRepository } from './infrastructure/persistence/InMemoryInventoryRepository.js';
import type { InventoryRepository } from './domain/repositories/InventoryRepository.js';

/**
 * Inventory Domain Module Module.
 *
 * This module encapsulates the entire Inventory domain including:
 * - Domain entities, value objects, and events
 * - Application commands and queries with handlers
 * - Infrastructure repositories
 *
 * The module can be deployed as:
 * - Part of a monolith (alongside other modules)
 * - Standalone microservice (only this context)
 *
 * To switch from monolith to microservice, only change infrastructure
 * modules in main.ts - NO changes needed to this module code.
 */
export class InventoryContextModule extends BaseContextModule {
  readonly metadata: ModuleMetadata = {
    name: 'inventory-context',
    version: '1.0.0',
    description: 'Inventory Domain Module',
    requiredPlugins: [],
    requiredModules: [],
  };

  readonly contextName = 'Inventory';

  private inventoryRepository!: InventoryRepository;

  /**
   * Returns all command definitions for the Inventory context.
   */
  getCommands(): CommandDefinition[] {
    return [
      {
        name: 'CreateInventory',
        commandType: CreateInventoryCommand,
        handler: new CreateInventoryHandler(this.inventoryRepository),
      },
    ];
  }

  /**
   * Returns all query definitions for the Inventory context.
   */
  getQueries(): QueryDefinition[] {
    return [
      {
        name: 'GetInventoryById',
        queryType: GetInventoryByIdQuery,
        handler: new GetInventoryByIdHandler(this.inventoryRepository),
      },
      {
        name: 'ListInventories',
        queryType: ListInventoriesQuery,
        handler: new ListInventoriesHandler(this.inventoryRepository),
      },
    ];
  }

  /**
   * Returns all event handler definitions for the Inventory context.
   */
  getEventHandlers(): EventHandlerDefinition[] {
    // Add event handlers here when needed
    return [];
  }

  /**
   * Returns all repository definitions for the Inventory context.
   */
  getRepositories(): RepositoryDefinition[] {
    return [
      {
        token: 'inventoryRepository',
        instance: new InMemoryInventoryRepository(),
        singleton: true,
      },
    ];
  }

  /**
   * Initialize the Inventory context module.
   *
   * Repositories are registered first by the base class, so we can
   * resolve them here before registering commands/queries.
   */
  async initialize(context: PluginContext): Promise<void> {
    // Resolve repositories from container (registered by base class)
    this.inventoryRepository =
      context.container.resolve<InventoryRepository>('inventoryRepository');

    // Call super to auto-register all commands, queries, and event handlers
    await super.initialize(context);
  }
}
