import type { QueryResult, QueryResultRow } from 'pg';
import type { Repository } from '@stratix/core';
import type { PostgresConnection } from './PostgresConnection.js';
import type { PostgresUnitOfWork } from './PostgresUnitOfWork.js';

/**
 * Type representing a database row that can be mapped to an entity
 */
export type DatabaseRow = Record<string, unknown>;

/**
 * Abstract PostgreSQL Repository
 *
 * Provides CRUD operations for entities backed by PostgreSQL.
 * Subclasses must implement entity-to-row and row-to-entity conversions.
 *
 * @template E - The entity type
 * @template ID - The ID type (typically string)
 *
 * @example
 * ```typescript
 * class UserRepository extends PostgresRepository<User, string> {
 *   protected tableName = 'users';
 *
 *   protected extractId(user: User): string {
 *     return user.id.value;
 *   }
 *
 *   protected toDatabaseRow(user: User): DatabaseRow {
 *     return {
 *       id: user.id.value,
 *       email: user.email,
 *       name: user.name,
 *       created_at: user.createdAt,
 *       updated_at: user.updatedAt,
 *     };
 *   }
 *
 *   protected toDomain(row: DatabaseRow): User {
 *     return new User(
 *       new UserId(row.id as string),
 *       row.email as string,
 *       row.name as string,
 *       row.created_at as Date,
 *       row.updated_at as Date
 *     );
 *   }
 * }
 * ```
 */
export abstract class PostgresRepository<E, ID = string> implements Repository<E, ID> {
  /**
   * The name of the database table
   */
  protected abstract tableName: string;

  constructor(
    protected readonly connection: PostgresConnection,
    protected readonly unitOfWork?: PostgresUnitOfWork
  ) {}

  /**
   * Converts an entity to a database row.
   * Subclasses must implement this method.
   *
   * @param entity - The entity to convert
   * @returns A database row object
   */
  protected abstract toDatabaseRow(entity: E): DatabaseRow;

  /**
   * Converts a database row to an entity.
   * Subclasses must implement this method.
   *
   * @param row - The database row
   * @returns The entity
   */
  protected abstract toDomain(row: DatabaseRow): E;

  /**
   * Gets the ID column name (default: 'id')
   *
   * Override this method if your table uses a different ID column name.
   */
  protected getIdColumn(): string {
    return 'id';
  }

  /**
   * Extract the ID value from an entity
   *
   * Subclasses must override this method to provide ID extraction logic.
   */
  protected abstract extractId(entity: E): ID;

  /**
   * Execute a query (uses UnitOfWork transaction if available)
   */
  protected async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (this.unitOfWork?.isInTransaction()) {
      return this.unitOfWork.query<T>(text, params);
    }
    return this.connection.query<T>(text, params);
  }

  /**
   * Save an entity (INSERT or UPDATE)
   */
  async save(entity: E): Promise<void> {
    const id = this.extractId(entity);
    const idColumn = this.getIdColumn();

    // Check if entity exists
    const existsResult = await this.query(
      `SELECT 1 FROM ${this.tableName} WHERE ${idColumn} = $1`,
      [id]
    );

    if (existsResult.rows.length > 0) {
      // UPDATE
      await this.update(entity);
    } else {
      // INSERT
      await this.insert(entity);
    }
  }

  /**
   * Insert a new entity
   */
  protected async insert(entity: E): Promise<void> {
    const row = this.toDatabaseRow(entity);
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
    `;

    await this.query(query, values);
  }

  /**
   * Update an existing entity
   */
  protected async update(entity: E): Promise<void> {
    const row = this.toDatabaseRow(entity);
    const id = this.extractId(entity);
    const idColumn = this.getIdColumn();

    // Remove ID from row for SET clause
    const { [idColumn]: _idValue, ...rowWithoutId } = row;

    const columns = Object.keys(rowWithoutId);
    const values = Object.values(rowWithoutId);

    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE ${idColumn} = $${values.length + 1}
    `;

    await this.query(query, [...values, id]);
  }

  /**
   * Find entity by ID
   */
  async findById(id: ID): Promise<E | null> {
    const idColumn = this.getIdColumn();

    const result = await this.query(`SELECT * FROM ${this.tableName} WHERE ${idColumn} = $1`, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.toDomain(result.rows[0] as DatabaseRow);
  }

  /**
   * Find all entities
   */
  async findAll(): Promise<E[]> {
    const result = await this.query(`SELECT * FROM ${this.tableName}`);
    return result.rows.map((row) => this.toDomain(row as DatabaseRow));
  }

  /**
   * Find entities matching a WHERE clause
   *
   * @param where - SQL WHERE clause (without the WHERE keyword)
   * @param params - Query parameters
   * @returns Array of matching entities
   *
   * @example
   * ```typescript
   * const activeUsers = await userRepo.findBy('status = $1', ['active']);
   * ```
   */
  async findBy(where: string, params: unknown[]): Promise<E[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${where}`;
    const result = await this.query(query, params);
    return result.rows.map((row) => this.toDomain(row as DatabaseRow));
  }

  /**
   * Find one entity matching a WHERE clause
   *
   * @param where - SQL WHERE clause (without the WHERE keyword)
   * @param params - Query parameters
   * @returns The entity if found, null otherwise
   *
   * @example
   * ```typescript
   * const user = await userRepo.findOneBy('email = $1', ['john@example.com']);
   * ```
   */
  async findOneBy(where: string, params: unknown[]): Promise<E | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${where} LIMIT 1`;
    const result = await this.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.toDomain(result.rows[0] as DatabaseRow);
  }

  /**
   * Delete entity by ID
   */
  async delete(id: ID): Promise<void> {
    const idColumn = this.getIdColumn();
    await this.query(`DELETE FROM ${this.tableName} WHERE ${idColumn} = $1`, [id]);
  }

  /**
   * Delete all entities matching a WHERE clause
   *
   * @param where - SQL WHERE clause (without the WHERE keyword)
   * @param params - Query parameters
   * @returns Number of deleted rows
   */
  async deleteBy(where: string, params: unknown[]): Promise<number> {
    const query = `DELETE FROM ${this.tableName} WHERE ${where}`;
    const result = await this.query(query, params);
    return result.rowCount || 0;
  }

  /**
   * Count entities
   */
  async count(): Promise<number> {
    const result = await this.query(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    return parseInt(result.rows[0].count as string, 10);
  }

  /**
   * Count entities matching a WHERE clause
   *
   * @param where - SQL WHERE clause (without the WHERE keyword)
   * @param params - Query parameters
   * @returns The count
   */
  async countBy(where: string, params: unknown[]): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${where}`;
    const result = await this.query(query, params);
    return parseInt(result.rows[0].count as string, 10);
  }

  /**
   * Check if entity exists
   */
  async exists(id: ID): Promise<boolean> {
    const idColumn = this.getIdColumn();
    const result = await this.query(
      `SELECT 1 FROM ${this.tableName} WHERE ${idColumn} = $1 LIMIT 1`,
      [id]
    );
    return result.rows.length > 0;
  }
}
