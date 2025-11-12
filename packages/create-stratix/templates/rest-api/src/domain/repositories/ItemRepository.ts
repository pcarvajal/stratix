// @ts-nocheck
import { Repository } from '@stratix/abstractions';
import { Item, ItemId } from '../entities/Item.js';

export interface ItemRepository extends Repository<Item, ItemId> {
  findAll(): Promise<Item[]>;
}
