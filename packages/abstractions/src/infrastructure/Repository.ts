/**
 * Generic repository interface for domain entities.
 *
 * Following DDD principles, the only required method is `save()`.
 * Repositories represent collections of domain entities, not data access objects.
 *
 * Additional methods are optional and should be added to specific repository interfaces
 * based on your use case requirements.
 *
 * @template T - The entity type
 * @template ID - The entity ID type
 *
 * @example
 * ```typescript
 * // Base usage - only save required
 * class UserRepository implements Repository<User, string> {
 *   async save(user: User): Promise<void> {
 *     const data = this.mapper.toPersistence(user);
 *     await this.db.query('INSERT INTO users ... ON CONFLICT UPDATE ...', data);
 *   }
 * }
 *
 * // Extended interface for specific needs
 * interface UserRepository extends Repository<User, string> {
 *   findById(id: string): Promise<User | null>; // Now required for this repo
 *   findByEmail(email: string): Promise<User | null>;
 * }
 * ```
 */
export interface Repository<T, ID = string> {
  /**
   * Saves an entity (insert or update).
   *
   * This is the only required method following DDD principles.
   * Repositories should act like collections where you add/update entities.
   *
   * @param entity - The entity to save
   *
   * @example
   * ```typescript
   * const user = User.create({ email: 'user@example.com', name: 'John' });
   * await repository.save(user);
   * ```
   */
  save(entity: T): Promise<void>;

  /**
   * Finds an entity by its ID.
   *
   * Optional - implement if you need to retrieve entities by ID.
   *
   * @param id - The entity ID
   * @returns The entity if found, null otherwise
   *
   * @example
   * ```typescript
   * const user = await repository.findById('user-123');
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   */
  findById?(id: ID): Promise<T | null>;

  /**
   * Finds all entities.
   *
   * Optional - use with caution in production systems with large datasets.
   * Consider pagination or specific query methods instead.
   *
   * @returns An array of all entities
   *
   * @example
   * ```typescript
   * const users = await repository.findAll();
   * ```
   */
  findAll?(): Promise<T[]>;

  /**
   * Deletes an entity by its ID.
   *
   * Optional - consider soft deletes or event sourcing patterns instead.
   * Hard deletes may not be appropriate for all use cases.
   *
   * @param id - The entity ID
   *
   * @example
   * ```typescript
   * await repository.delete('user-123');
   * ```
   */
  delete?(id: ID): Promise<void>;

  /**
   * Checks if an entity exists by its ID.
   *
   * Optional - can often be implemented using findById instead.
   *
   * @param id - The entity ID
   * @returns true if the entity exists, false otherwise
   *
   * @example
   * ```typescript
   * if (await repository.exists('user-123')) {
   *   console.log('User exists');
   * }
   * ```
   */
  exists?(id: ID): Promise<boolean>;
}
