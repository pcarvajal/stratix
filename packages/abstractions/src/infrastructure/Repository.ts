/**
 * Generic repository interface for domain entities.
 *
 * Provides basic CRUD operations for persisting and retrieving entities.
 *
 * @template T - The entity type
 * @template ID - The entity ID type
 *
 * @example
 * ```typescript
 * class UserRepository implements Repository<User, string> {
 *   async findById(id: string): Promise<User | null> {
 *     const data = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
 *     return data ? this.mapper.toDomain(data) : null;
 *   }
 *
 *   async save(user: User): Promise<void> {
 *     const data = this.mapper.toPersistence(user);
 *     await this.db.query('INSERT INTO users ...', data);
 *   }
 * }
 * ```
 */
export interface Repository<T, ID = string> {
  /**
   * Finds an entity by its ID.
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
  findById(id: ID): Promise<T | null>;

  /**
   * Finds all entities.
   *
   * @returns An array of all entities
   *
   * @example
   * ```typescript
   * const users = await repository.findAll();
   * ```
   */
  findAll(): Promise<T[]>;

  /**
   * Saves an entity (insert or update).
   *
   * @param entity - The entity to save
   *
   * @example
   * ```typescript
   * const user = new User('user@example.com', 'John');
   * await repository.save(user);
   * ```
   */
  save(entity: T): Promise<void>;

  /**
   * Deletes an entity by its ID.
   *
   * @param id - The entity ID
   *
   * @example
   * ```typescript
   * await repository.delete('user-123');
   * ```
   */
  delete(id: ID): Promise<void>;

  /**
   * Checks if an entity exists by its ID.
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
  exists(id: ID): Promise<boolean>;
}
