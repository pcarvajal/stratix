import type { MongoClient, ClientSession } from 'mongodb';
import type { UnitOfWork } from '@stratix/core';

/**
 * MongoDB Unit of Work implementation
 *
 * Manages transactions using MongoDB sessions.
 * MongoDB transactions require replica sets or sharded clusters.
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
export class MongoUnitOfWork implements UnitOfWork {
  private session?: ClientSession;
  private inTransaction: boolean = false;

  constructor(private readonly client: MongoClient) {}

  /**
   * Execute a function within a transaction
   *
   * Automatically handles session start, commit, and abort.
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
   * Starts a session and begins a transaction.
   *
   * **Note**: Transactions require MongoDB replica sets or sharded clusters.
   */
  async begin(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress');
    }

    this.session = this.client.startSession();
    this.session.startTransaction();
    this.inTransaction = true;
  }

  /**
   * Commit the current transaction
   *
   * Persists all changes and ends the session.
   */
  async commit(): Promise<void> {
    if (!this.inTransaction || !this.session) {
      throw new Error('No transaction in progress');
    }

    try {
      await this.session.commitTransaction();
    } finally {
      await this.session.endSession();
      this.session = undefined;
      this.inTransaction = false;
    }
  }

  /**
   * Rollback the current transaction
   *
   * Discards all changes and ends the session.
   */
  async rollback(): Promise<void> {
    if (!this.inTransaction || !this.session) {
      throw new Error('No transaction in progress');
    }

    try {
      await this.session.abortTransaction();
    } finally {
      await this.session.endSession();
      this.session = undefined;
      this.inTransaction = false;
    }
  }

  /**
   * Check if currently in a transaction
   */
  isInTransaction(): boolean {
    return this.inTransaction;
  }

  /**
   * Get the current session
   *
   * Only available when in a transaction.
   * Use this session for operations that should be part of the transaction.
   */
  getSession(): ClientSession | undefined {
    return this.session;
  }
}
