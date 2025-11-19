import type { RedisClientType, RedisClientOptions } from 'redis';
import type {
  Plugin,
  PluginMetadata,
  PluginContext,
  HealthCheckResult,
} from '@stratix/core';
import { HealthStatus, ServiceLifetime } from '@stratix/core';
import { RedisConnection } from './RedisConnection.js';
import { RedisCache } from './RedisCache.js';

/**
 * Redis plugin configuration
 */
export interface RedisConfig {
  /**
   * Redis connection URL
   * Format: redis://[[username][:password]@][host][:port][/db-number]
   */
  url: string;

  /**
   * Additional Redis client options
   */
  options?: RedisClientOptions;

  /**
   * Cache configuration
   */
  cache?: {
    /**
     * Key prefix for namespacing
     */
    prefix?: string;

    /**
     * Default TTL in seconds
     */
    ttl?: number;
  };
}

/**
 * Redis Plugin for Stratix
 *
 * Provides Redis connectivity with caching, key-value storage,
 * and access to the native Redis client for advanced operations.
 *
 * @example
 * ```typescript
 * import { ApplicationBuilder } from '@stratix/runtime';
 * import { RedisPlugin } from '@stratix/db-redis';
 *
 * const app = await ApplicationBuilder.create()
 *   .usePlugin(new RedisPlugin())
 *   .withConfig({
 *     'redis': {
 *       url: 'redis://localhost:6379',
 *       cache: {
 *         prefix: 'myapp:',
 *         ttl: 3600
 *       }
 *     }
 *   })
 *   .build();
 *
 * await app.start();
 *
 * // Access the cache
 * const cache = app.resolve<RedisCache>('redis:cache');
 * await cache.set('key', { data: 'value' }, 300);
 * ```
 */
export class RedisPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'redis',
    version: '0.1.0',
    description: 'Redis caching and key-value storage plugin',
    dependencies: [],
  };

  private connection?: RedisConnection;
  private cache?: RedisCache;
  private config?: RedisConfig;

  /**
   * Initialize the plugin
   *
   * Creates the Redis connection and cache, and registers services in the container.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(context: PluginContext): Promise<void> {
    this.config = context.getConfig<RedisConfig>();

    // Validate configuration
    if (!this.config.url) {
      throw new Error('Redis URL is required');
    }

    // Create connection
    this.connection = new RedisConnection(this.config.url, this.config.options);

    // Create cache
    this.cache = new RedisCache(this.connection, {
      prefix: this.config.cache?.prefix,
      ttl: this.config.cache?.ttl,
    });

    // Register connection in container
    context.container.register('redis:connection', () => this.connection!, {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register cache in container
    context.container.register('redis:cache', () => this.cache!, {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register client in container (for advanced use cases)
    context.container.register<RedisClientType>(
      'redis:client',
      () => this.connection!.getClient(),
      {
        lifetime: ServiceLifetime.SINGLETON,
      }
    );
  }

  /**
   * Start the plugin
   *
   * Connects to the Redis server.
   */
  async start(): Promise<void> {
    if (!this.connection) {
      throw new Error('RedisPlugin not initialized. Call initialize() first.');
    }

    try {
      await this.connection.connect();
      console.log('Redis connected successfully');
    } catch (error) {
      throw new Error(
        `Failed to connect to Redis: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Stop the plugin
   *
   * Disconnects from the Redis server.
   */
  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.disconnect();
        console.log('Redis disconnected successfully');
      } catch (error) {
        console.error(
          `Error disconnecting from Redis: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * Perform a health check
   *
   * Pings the Redis server to check if it's responsive.
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
      // Ping the server
      await this.connection.ping();

      return {
        status: HealthStatus.UP,
        message: 'Connected and responsive',
      };
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get the RedisConnection instance
   *
   * Useful for accessing the connection outside of the DI container.
   */
  getConnection(): RedisConnection {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }
    return this.connection;
  }

  /**
   * Get the RedisCache instance
   *
   * Useful for accessing the cache outside of the DI container.
   */
  getCache(): RedisCache {
    if (!this.cache) {
      throw new Error('Cache not initialized');
    }
    return this.cache;
  }
}
