import { Query } from './Query.js';
import { QueryHandler } from './QueryHandler.js';

/**
 * Bus for executing queries through their handlers.
 *
 * Ensures that each query is handled by exactly one handler.
 *
 * @example
 * ```typescript
 * // Register handler
 * queryBus.register(GetUserQuery, new GetUserQueryHandler());
 *
 * // Execute query
 * const user = await queryBus.execute<User | null>(
 *   new GetUserQuery('user-123')
 * );
 * ```
 */
export interface QueryBus {
  /**
   * Registers a handler for a specific query type.
   *
   * @template TQuery - The type of query
   * @template TResult - The result type
   * @param queryType - The query class or identifier
   * @param handler - The handler for this query type
   *
   * @example
   * ```typescript
   * queryBus.register(
   *   GetUserQuery,
   *   new GetUserQueryHandler(repository)
   * );
   * ```
   */
  register<TQuery extends Query, TResult = unknown>(
    queryType: new (...args: unknown[]) => TQuery,
    handler: QueryHandler<TQuery, TResult>
  ): void;

  /**
   * Executes a query through its registered handler.
   *
   * @template TResult - The expected result type
   * @param query - The query to execute
   * @returns The result from the query handler
   * @throws Error if no handler is registered for the query
   *
   * @example
   * ```typescript
   * const query = new GetUserQuery('user-123');
   * const user = await queryBus.execute<User | null>(query);
   * ```
   */
  execute<TResult = unknown>(query: Query): Promise<TResult>;
}
