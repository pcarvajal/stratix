import type { Command } from '@stratix/abstractions';

export interface CreateInventoryInput {
  productId: string;
  quantity: number;
  location: string;
}

export interface CreateInventoryOutput {
  inventoryId: string;
}

/**
 * Command to create a new Inventory.
 */
export class CreateInventoryCommand implements Command {
  constructor(public readonly data: CreateInventoryInput) {}
}
