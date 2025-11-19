/**
 * Marker interface for commands in CQRS.
 *
 * Commands represent intentions to change state in the system.
 * They should be named in imperative form (CreateUser, UpdateOrder, DeleteProduct).
 *
 * @example
 * ```typescript
 * interface CreateUserCommand extends Command {
 *   email: string;
 *   name: string;
 * }
 *
 * interface UpdateOrderCommand extends Command {
 *   orderId: string;
 *   status: OrderStatus;
 * }
 * ```
 */
export interface Command {}
