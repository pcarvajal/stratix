import type { Query, QueryBus, QueryHandler } from '@stratix/core';

/**
 * In-memory query bus implementation.
 *
 * Provides a simple, synchronous query bus for handling queries.
 * Each query type can have only one handler.
 *
 * @example
 * ```typescript
 * const queryBus = new InMemoryQueryBus();
 *
 * // Register handler
 * queryBus.register(GetUserQuery, async (query) => {
 *   return await userRepository.findById(query.userId);
 * });
 *
 * // Execute query
 * const user = await queryBus.execute(new GetUserQuery('123'));
 * ```
 */
export class InMemoryQueryBus implements QueryBus {
  private readonly handlers = new Map<
    new (...args: never[]) => Query,
    QueryHandler<Query, unknown>
  >();

  /**
   * Registers a query handler.
   *
   * @template TQuery - The query type
   * @template TResult - The result type
   * @param queryType - The query class constructor
   * @param handler - The handler function
   * @throws {Error} If a handler is already registered for this query type
   *
   * @example
   * ```typescript
   * queryBus.register(GetUserQuery, async (query) => {
   *   return await findUser(query.userId);
   * });
   * ```
   */
  register<TQuery extends Query, TResult = unknown>(
    queryType: new (...args: never[]) => TQuery,
    handler: QueryHandler<TQuery, TResult> | ((query: TQuery) => Promise<TResult>)
  ): void {
    if (this.handlers.has(queryType)) {
      throw new Error(`Handler already registered for query: ${queryType.name}`);
    }

    // Wrap function handlers to match QueryHandler interface
    const wrappedHandler: QueryHandler<Query, unknown> =
      typeof handler === 'function'
        ? { handle: handler as (query: Query) => Promise<unknown> }
        : (handler as QueryHandler<Query, unknown>);

    this.handlers.set(queryType, wrappedHandler);
  }

  /**
   * Executes a query through its registered handler.
   *
   * @template TResult - The result type
   * @param query - The query to execute
   * @returns The result from the query handler
   * @throws {Error} If no handler is registered for this query type
   *
   * @example
   * ```typescript
   * const user = await queryBus.execute(new GetUserQuery('123'));
   * ```
   */
  async execute<TResult = unknown>(query: Query): Promise<TResult> {
    const queryType = query.constructor as new (...args: never[]) => Query;
    const handler = this.handlers.get(queryType);

    if (!handler) {
      throw new Error(`No handler registered for query: ${queryType.name}`);
    }

    return (await handler.handle(query)) as TResult;
  }

  /**
   * Checks if a handler is registered for a query type.
   *
   * @param queryType - The query class constructor
   * @returns True if a handler is registered
   */
  hasHandler(queryType: new (...args: never[]) => Query): boolean {
    return this.handlers.has(queryType);
  }

  /**
   * Unregisters a query handler.
   *
   * @param queryType - The query class constructor
   * @returns True if a handler was unregistered
   */
  unregister(queryType: new (...args: never[]) => Query): boolean {
    return this.handlers.delete(queryType);
  }

  /**
   * Clears all registered handlers.
   */
  clear(): void {
    this.handlers.clear();
  }
}
