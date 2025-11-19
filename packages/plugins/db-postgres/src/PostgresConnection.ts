import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { PostgresUnitOfWork } from './PostgresUnitOfWork.js';

/**
 * PostgreSQL Connection Manager
 *
 * Manages connection pooling and provides query execution.
 * Wraps the pg Pool to provide a consistent interface.
 *
 * @example
 * ```typescript
 * const connection = new PostgresConnection({
 *   connectionString: 'postgres://user:pass@localhost:5432/db',
 *   max: 20
 * });
 *
 * await connection.connect();
 * const result = await connection.query('SELECT * FROM users');
 * await connection.disconnect();
 * ```
 */
export class PostgresConnection {
  private pool: Pool;
  private isConnected: boolean = false;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  /**
   * Connect to the database
   *
   * Tests the connection by executing a simple query.
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
    } catch (error) {
      throw new Error(
        `Failed to connect to PostgreSQL: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Disconnect from the database
   *
   * Closes all connections in the pool.
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await this.pool.end();
    this.isConnected = false;
  }

  /**
   * Execute a query
   *
   * @template T - The type of rows returned by the query
   * @param text - SQL query text
   * @param params - Query parameters
   * @returns Query result
   */
  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /**
   * Get a client from the pool
   *
   * **Important**: You must call `client.release()` when done.
   *
   * @returns A pooled client
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Get the underlying pg Pool
   *
   * Useful for advanced use cases.
   */
  getPool(): Pool {
    return this.pool;
  }

  /**
   * Create a Unit of Work for transactions
   *
   * @returns A new UnitOfWork instance
   */
  createUnitOfWork(): PostgresUnitOfWork {
    return new PostgresUnitOfWork(this);
  }

  /**
   * Check if connected to the database
   */
  connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get pool statistics
   *
   * Useful for monitoring and health checks.
   */
  getPoolStats(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}
