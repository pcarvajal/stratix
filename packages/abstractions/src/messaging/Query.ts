/**
 * Marker interface for queries in CQRS.
 *
 * Queries represent requests for data without changing state.
 * They should be named as questions or data requests (GetUser, FindOrders, ListProducts).
 *
 * @example
 * ```typescript
 * interface GetUserQuery extends Query {
 *   userId: string;
 * }
 *
 * interface FindOrdersQuery extends Query {
 *   customerId: string;
 *   status?: OrderStatus;
 * }
 * ```
 */
export interface Query {}
