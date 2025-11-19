import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import type { UnitOfWork } from '@stratix/core';
import type { PostgresConnection } from './PostgresConnection.js';

/**
 * PostgreSQL Unit of Work implementation
 *
 * Manages transactions using PostgreSQL BEGIN/COMMIT/ROLLBACK.
 * Provides isolation for a set of operations.
 *
 * @example
 * ```typescript
 * const unitOfWork = connection.createUnitOfWork();
 *
 * await unitOfWork.transaction(async () => {
 *   await userRepository.save(user);
 *   await orderRepository.save(order);
 *   // Both operations committed together
 * });
 * ```
 */
export class PostgresUnitOfWork implements UnitOfWork {
  private client?: PoolClient;
  private inTransaction: boolean = false;

  constructor(private readonly connection: PostgresConnection) {}

  /**
   * Execute a function within a transaction
   *
   * Automatically handles BEGIN, COMMIT, and ROLLBACK.
   *
   * @template T - The return type
   * @param fn - The function to execute in the transaction
   * @returns The result of the function
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.begin();

    try {
      const result = await fn();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  /**
   * Begin a new transaction
   *
   * Acquires a client from the pool and starts a transaction.
   */
  async begin(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress');
    }

    this.client = await this.connection.getClient();
    await this.client.query('BEGIN');
    this.inTransaction = true;
  }

  /**
   * Commit the current transaction
   *
   * Persists all changes and releases the client.
   */
  async commit(): Promise<void> {
    if (!this.inTransaction || !this.client) {
      throw new Error('No transaction in progress');
    }

    try {
      await this.client.query('COMMIT');
    } finally {
      this.client.release();
      this.client = undefined;
      this.inTransaction = false;
    }
  }

  /**
   * Rollback the current transaction
   *
   * Discards all changes and releases the client.
   */
  async rollback(): Promise<void> {
    if (!this.inTransaction || !this.client) {
      throw new Error('No transaction in progress');
    }

    try {
      await this.client.query('ROLLBACK');
    } finally {
      this.client.release();
      this.client = undefined;
      this.inTransaction = false;
    }
  }

  /**
   * Execute a query within the transaction
   *
   * Uses the transaction client if available, otherwise the pool.
   *
   * @template T - The type of rows returned
   * @param text - SQL query text
   * @param params - Query parameters
   * @returns Query result
   */
  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (this.inTransaction && this.client) {
      return this.client.query<T>(text, params);
    }

    return this.connection.query<T>(text, params);
  }

  /**
   * Check if currently in a transaction
   */
  isInTransaction(): boolean {
    return this.inTransaction;
  }

  /**
   * Get the transaction client
   *
   * Only available when in a transaction.
   */
  getClient(): PoolClient | undefined {
    return this.client;
  }
}
