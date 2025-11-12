import { MongoClient, Db, Collection, MongoClientOptions, Document } from 'mongodb';
import { MongoUnitOfWork } from './MongoUnitOfWork.js';

/**
 * MongoDB Connection Manager
 *
 * Wraps MongoClient and provides database access.
 * Manages connection lifecycle and provides access to collections.
 *
 * @example
 * ```typescript
 * const connection = new MongoConnection(
 *   'mongodb://localhost:27017',
 *   'mydb',
 *   { maxPoolSize: 20 }
 * );
 *
 * await connection.connect();
 * const usersCollection = connection.collection('users');
 * await connection.disconnect();
 * ```
 */
export class MongoConnection {
  private client: MongoClient;
  private db?: Db;
  private isConnected: boolean = false;

  constructor(
    private readonly connectionString: string,
    private readonly databaseName: string,
    private readonly options?: MongoClientOptions
  ) {
    this.client = new MongoClient(this.connectionString, this.options);
  }

  /**
   * Connect to MongoDB
   *
   * Establishes connection and selects the database.
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.isConnected = true;
    } catch (error) {
      throw new Error(
        `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Disconnect from MongoDB
   *
   * Closes all connections in the pool.
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await this.client.close();
    this.db = undefined;
    this.isConnected = false;
  }

  /**
   * Get a collection from the database
   *
   * @template T - The document type
   * @param name - Collection name
   * @returns MongoDB Collection
   */
  collection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }

    return this.db.collection<T>(name);
  }

  /**
   * Get the database instance
   *
   * Useful for advanced operations.
   */
  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }

    return this.db;
  }

  /**
   * Get the MongoClient instance
   *
   * Useful for transactions and advanced operations.
   */
  getClient(): MongoClient {
    return this.client;
  }

  /**
   * Create a Unit of Work for transactions
   *
   * @returns A new MongoUnitOfWork instance
   */
  createUnitOfWork(): MongoUnitOfWork {
    return new MongoUnitOfWork(this.client);
  }

  /**
   * Check if connected to MongoDB
   */
  connected(): boolean {
    return this.isConnected;
  }

  /**
   * Ping the database
   *
   * Useful for health checks.
   */
  async ping(): Promise<void> {
    await this.client.db('admin').admin().ping();
  }

  /**
   * Get database name
   */
  getDatabaseName(): string {
    return this.databaseName;
  }
}
