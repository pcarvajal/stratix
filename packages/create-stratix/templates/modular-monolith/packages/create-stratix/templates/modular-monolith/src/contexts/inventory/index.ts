// Context Module
export { InventoryContextModule } from './InventoryContextModule.js';

// Domain
export { Inventory, type InventoryId, type InventoryProps } from './domain/entities/Inventory.js';
export { InventoryCreatedEvent } from './domain/events/InventoryCreated.js';
export type { InventoryRepository } from './domain/repositories/InventoryRepository.js';

// Application - Commands
export {
  CreateInventoryCommand,
  type CreateInventoryInput,
  type CreateInventoryOutput,
} from './application/commands/CreateInventory.js';

// Application - Queries
export {
  GetInventoryByIdQuery,
  type GetInventoryByIdInput,
  type GetInventoryByIdOutput,
} from './application/queries/GetInventoryById.js';
export {
  ListInventoriesQuery,
  type ListInventoriesOutput,
} from './application/queries/ListInventories.js';

// Infrastructure
export { InMemoryInventoryRepository } from './infrastructure/persistence/InMemoryInventoryRepository.js';
