import type { Pool, PoolConfig } from 'pg';
import type {
  Plugin,
  PluginMetadata,
  PluginContext,
  HealthCheckResult,
} from '@stratix/abstractions';
import { HealthStatus, ServiceLifetime } from '@stratix/abstractions';
import { PostgresConnection } from './PostgresConnection.js';

/**
 * PostgreSQL plugin configuration
 */
export interface PostgresConfig {
  /**
   * PostgreSQL connection string
   * Format: postgres://user:password@host:port/database
   */
  connectionString: string;

  /**
   * Maximum number of clients in the pool
   * @default 10
   */
  poolSize?: number;

  /**
   * Connection timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Enable SSL connection
   * @default false
   */
  ssl?: boolean;

  /**
   * Idle timeout in milliseconds
   * @default 10000
   */
  idleTimeoutMillis?: number;

  /**
   * Connection string for read replicas (optional)
   */
  readReplicaConnectionString?: string;
}

/**
 * PostgreSQL Plugin for Stratix
 *
 * Provides PostgreSQL database connectivity with connection pooling,
 * transactions (Unit of Work), and repository pattern support.
 *
 * @example
 * ```typescript
 * import { ApplicationBuilder } from '@stratix/runtime';
 * import { PostgresPlugin } from '@stratix/ext-postgres';
 *
 * const app = await ApplicationBuilder.create()
 *   .usePlugin(new PostgresPlugin())
 *   .withConfig({
 *     'postgres': {
 *       connectionString: 'postgres://user:pass@localhost:5432/mydb',
 *       poolSize: 20,
 *       ssl: true
 *     }
 *   })
 *   .build();
 *
 * await app.start();
 *
 * // Access the connection
 * const connection = app.resolve<PostgresConnection>('postgres:connection');
 * const result = await connection.query('SELECT * FROM users');
 * ```
 */
export class PostgresPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'postgres',
    version: '0.1.0',
    description: 'PostgreSQL database plugin with connection pooling and transactions',
    dependencies: [],
  };

  private connection?: PostgresConnection;
  private config?: PostgresConfig;

  /**
   * Initialize the plugin
   *
   * Creates the connection pool and registers services in the container.
   */
  async initialize(context: PluginContext): Promise<void> {
    this.config = context.getConfig<PostgresConfig>();

    // Validate configuration
    if (!this.config.connectionString) {
      throw new Error('PostgreSQL connection string is required');
    }

    // Create pool configuration
    const poolConfig: PoolConfig = {
      connectionString: this.config.connectionString,
      max: this.config.poolSize ?? 10,
      connectionTimeoutMillis: this.config.timeout ?? 30000,
      idleTimeoutMillis: this.config.idleTimeoutMillis ?? 10000,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
    };

    // Create connection
    this.connection = new PostgresConnection(poolConfig);

    // Register connection in container
    context.container.register('postgres:connection', () => this.connection!, {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register pool in container (for advanced use cases)
    context.container.register<Pool>('postgres:pool', () => this.connection!.getPool(), {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register factory for creating UnitOfWork instances
    context.container.register(
      'postgres:createUnitOfWork',
      () => () => this.connection!.createUnitOfWork(),
      {
        lifetime: ServiceLifetime.SINGLETON,
      }
    );
  }

  /**
   * Start the plugin
   *
   * Connects to the PostgreSQL database.
   */
  async start(): Promise<void> {
    if (!this.connection) {
      throw new Error('PostgresPlugin not initialized. Call initialize() first.');
    }

    try {
      await this.connection.connect();
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      throw new Error(
        `Failed to connect to PostgreSQL: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Stop the plugin
   *
   * Disconnects from the PostgreSQL database and closes all connections.
   */
  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.disconnect();
        console.log('PostgreSQL disconnected successfully');
      } catch (error) {
        console.error(
          `Error disconnecting from PostgreSQL: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * Perform a health check
   *
   * Checks if the database connection is alive and responsive.
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
      // Try a simple query
      await this.connection.query('SELECT 1');

      const stats = this.connection.getPoolStats();

      return {
        status: HealthStatus.UP,
        message: 'Connected and responsive',
        details: {
          totalConnections: stats.totalCount,
          idleConnections: stats.idleCount,
          waitingConnections: stats.waitingCount,
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
   * Get the PostgresConnection instance
   *
   * Useful for accessing the connection outside of the DI container.
   */
  getConnection(): PostgresConnection {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }
    return this.connection;
  }
}
