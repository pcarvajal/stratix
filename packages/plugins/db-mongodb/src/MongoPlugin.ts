import type { MongoClient, MongoClientOptions } from 'mongodb';
import type {
  Plugin,
  PluginMetadata,
  PluginContext,
  HealthCheckResult,
} from '@stratix/core';
import { HealthStatus, ServiceLifetime } from '@stratix/core';
import { MongoConnection } from './MongoConnection.js';

/**
 * MongoDB plugin configuration
 */
export interface MongoConfig {
  /**
   * MongoDB connection string
   * Format: mongodb://[username:password@]host[:port][/database][?options]
   */
  connectionString: string;

  /**
   * Database name
   */
  database: string;

  /**
   * Maximum number of connections in the pool
   * @default 10
   */
  maxPoolSize?: number;

  /**
   * Server selection timeout in milliseconds
   * @default 30000
   */
  serverSelectionTimeoutMS?: number;

  /**
   * Additional MongoDB client options
   */
  options?: MongoClientOptions;
}

/**
 * MongoDB Plugin for Stratix
 *
 * Provides MongoDB connectivity with document-based repositories,
 * transactions (on replica sets), and connection pooling.
 *
 * @example
 * ```typescript
 * import { ApplicationBuilder } from '@stratix/runtime';
 * import { MongoPlugin } from '@stratix/db-mongodb';
 *
 * const app = await ApplicationBuilder.create()
 *   .usePlugin(new MongoPlugin())
 *   .withConfig({
 *     'mongo': {
 *       connectionString: 'mongodb://localhost:27017',
 *       database: 'mydb',
 *       maxPoolSize: 20
 *     }
 *   })
 *   .build();
 *
 * await app.start();
 *
 * // Access the connection
 * const connection = app.resolve<MongoConnection>('mongo:connection');
 * const usersCollection = connection.collection('users');
 * ```
 */
export class MongoPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'mongo',
    version: '0.1.0',
    description: 'MongoDB document database plugin with repositories and transactions',
    dependencies: [],
  };

  private connection?: MongoConnection;
  private config?: MongoConfig;

  /**
   * Initialize the plugin
   *
   * Creates the MongoDB connection and registers services in the container.
   */
  async initialize(context: PluginContext): Promise<void> {
    this.config = context.getConfig<MongoConfig>();

    // Validate configuration
    if (!this.config.connectionString) {
      throw new Error('MongoDB connection string is required');
    }

    if (!this.config.database) {
      throw new Error('MongoDB database name is required');
    }

    // Create connection options
    const options: MongoClientOptions = {
      maxPoolSize: this.config.maxPoolSize ?? 10,
      serverSelectionTimeoutMS: this.config.serverSelectionTimeoutMS ?? 30000,
      ...this.config.options,
    };

    // Create connection
    this.connection = new MongoConnection(
      this.config.connectionString,
      this.config.database,
      options
    );

    // Register connection in container
    context.container.register('mongo:connection', () => this.connection!, {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register client in container (for advanced use cases)
    context.container.register<MongoClient>('mongo:client', () => this.connection!.getClient(), {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register factory for creating UnitOfWork instances
    context.container.register(
      'mongo:createUnitOfWork',
      () => () => this.connection!.createUnitOfWork(),
      {
        lifetime: ServiceLifetime.SINGLETON,
      }
    );
  }

  /**
   * Start the plugin
   *
   * Connects to the MongoDB database.
   */
  async start(): Promise<void> {
    if (!this.connection) {
      throw new Error('MongoPlugin not initialized. Call initialize() first.');
    }

    try {
      await this.connection.connect();
      console.log(
        `MongoDB connected successfully to database: ${this.connection.getDatabaseName()}`
      );
    } catch (error) {
      throw new Error(
        `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Stop the plugin
   *
   * Disconnects from the MongoDB database and closes all connections.
   */
  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.disconnect();
        console.log('MongoDB disconnected successfully');
      } catch (error) {
        console.error(
          `Error disconnecting from MongoDB: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * Perform a health check
   *
   * Pings the database to check if it's responsive.
   */
  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.connection) {
      return {
        status: HealthStatus.DOWN,
        message: 'Not initialized',
      };
    }

    if (!this.connection.connected()) {
      return {
        status: HealthStatus.DOWN,
        message: 'Not connected',
      };
    }

    try {
      // Ping the database
      await this.connection.ping();

      return {
        status: HealthStatus.UP,
        message: 'Connected and responsive',
        details: {
          database: this.connection.getDatabaseName(),
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get the MongoConnection instance
   *
   * Useful for accessing the connection outside of the DI container.
   */
  getConnection(): MongoConnection {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }
    return this.connection;
  }
}
