/**
 * Unit of Work pattern for managing transactions.
 *
 * Ensures that a group of operations either all succeed or all fail together.
 *
 * @example
 * ```typescript
 * await unitOfWork.transaction(async () => {
 *   await userRepository.save(user);
 *   await orderRepository.save(order);
 *   await eventBus.publish(events);
 *   // All operations committed together
 * });
 * ```
 */
export interface UnitOfWork {
  /**
   * Executes a function within a transaction.
   *
   * If the function completes successfully, the transaction is committed.
   * If an error is thrown, the transaction is rolled back.
   *
   * @template T - The return type of the transaction function
   * @param fn - The function to execute within the transaction
   * @returns The result of the transaction function
   * @throws The error thrown by the transaction function
   *
   * @example
   * ```typescript
   * const result = await unitOfWork.transaction(async () => {
   *   const user = await userRepository.findById('user-123');
   *   user.updateEmail('newemail@example.com');
   *   await userRepository.save(user);
   *   return user;
   * });
   * ```
   */
  transaction<T>(fn: () => Promise<T>): Promise<T>;

  /**
   * Starts a new transaction.
   *
   * @example
   * ```typescript
   * await unitOfWork.begin();
   * try {
   *   await userRepository.save(user);
   *   await orderRepository.save(order);
   *   await unitOfWork.commit();
   * } catch (error) {
   *   await unitOfWork.rollback();
   *   throw error;
   * }
   * ```
   */
  begin(): Promise<void>;

  /**
   * Commits the current transaction.
   *
   * @example
   * ```typescript
   * await unitOfWork.commit();
   * ```
   */
  commit(): Promise<void>;

  /**
   * Rolls back the current transaction.
   *
   * @example
   * ```typescript
   * await unitOfWork.rollback();
   * ```
   */
  rollback(): Promise<void>;
}
