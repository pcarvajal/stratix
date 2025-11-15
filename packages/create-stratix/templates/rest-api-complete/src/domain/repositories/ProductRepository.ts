// @ts-nocheck
import { Repository } from '@stratix/abstractions';
import { Product, ProductId } from '../entities/Product.js';

export interface ProductRepository extends Repository<Product, ProductId> {
  findAll(): Promise<Product[]>;
  findByName(name: string): Promise<Product | null>;
}
