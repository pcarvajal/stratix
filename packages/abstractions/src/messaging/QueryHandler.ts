import { Query } from './Query.js';

/**
 * Handler for processing queries.
 *
 * Query handlers retrieve data without changing state.
 * Each query should have exactly one handler.
 *
 * @template TQuery - The type of query this handler processes
 * @template TResult - The result type returned by the handler
 *
 * @example
 * ```typescript
 * class GetUserQueryHandler implements QueryHandler<GetUserQuery, User | null> {
 *   async handle(query: GetUserQuery): Promise<User | null> {
 *     return await this.repository.findById(query.userId);
 *   }
 * }
 * ```
 */
export interface QueryHandler<TQuery extends Query, TResult = unknown> {
  /**
   * Handles the query and returns the result.
   *
   * @param query - The query to handle
   * @returns The query result
   */
  handle(query: TQuery): Promise<TResult>;
}
