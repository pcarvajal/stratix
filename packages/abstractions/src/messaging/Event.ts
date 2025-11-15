/**
 * Marker interface for events.
 *
 * Events represent things that have happened in the system.
 * They should be named in past tense (UserCreated, OrderUpdated, ProductDeleted).
 *
 * @example
 * ```typescript
 * interface UserCreatedEvent extends Event {
 *   userId: string;
 *   email: string;
 *   occurredAt: Date;
 * }
 *
 * interface OrderUpdatedEvent extends Event {
 *   orderId: string;
 *   previousStatus: OrderStatus;
 *   newStatus: OrderStatus;
 *   occurredAt: Date;
 * }
 * ```
 */
export interface Event {}
