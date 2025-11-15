// @ts-nocheck
import { EntityId } from '@stratix/primitives';

/**
 * Shared types used across bounded contexts
 *
 * These are part of the Shared Kernel - common types that
 * multiple contexts agree on and depend on.
 */

export type UserId = EntityId<'User'>;
export type OrderId = EntityId<'Order'>;
export type ProductId = EntityId<'Product'>;

export interface Money {
  amount: number;
  currency: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
