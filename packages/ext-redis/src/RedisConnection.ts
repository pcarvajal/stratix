import { createClient, RedisClientType, RedisClientOptions } from 'redis';

/**
 * Redis Connection Manager
 *
 * Wraps the redis client and provides connection management.
 * Provides access to the underlying redis client for advanced operations.
 *
 * @example
 * ```typescript
 * const connection = new RedisConnection('redis://localhost:6379');
 *
 * await connection.connect();
 * await connection.set('key', 'value');
 * const value = await connection.get('key');
 * await connection.disconnect();
 * ```
 */
export class RedisConnection {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(
    private readonly url: string,
    private readonly options?: RedisClientOptions
  ) {
    this.client = createClient({
      url: this.url,
      ...this.options,
    }) as RedisClientType;

    // Setup error handler
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  /**
   * Connect to Redis
   *
   * Establishes connection to the Redis server.
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      throw new Error(
        `Failed to connect to Redis: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Disconnect from Redis
   *
   * Closes the connection gracefully.
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await this.client.quit();
    this.isConnected = false;
  }

  /**
   * Get the underlying Redis client
   *
   * Use this for advanced operations not covered by the wrapper.
   */
  getClient(): RedisClientType {
    return this.client;
  }

  /**
   * Check if connected to Redis
   */
  connected(): boolean {
    return this.isConnected;
  }

  /**
   * Ping the Redis server
   *
   * Useful for health checks.
   */
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  // ===== Basic Key-Value Operations =====

  /**
   * Set a key-value pair
   *
   * @param key - The key
   * @param value - The value
   * @param ttl - Optional TTL in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, { EX: ttl });
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Get a value by key
   *
   * @param key - The key
   * @returns The value or null if not found
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Delete a key
   *
   * @param key - The key
   * @returns Number of keys deleted (0 or 1)
   */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Check if a key exists
   *
   * @param key - The key
   * @returns true if exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on a key
   *
   * @param key - The key
   * @param seconds - TTL in seconds
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    return await this.client.expire(key, seconds);
  }

  /**
   * Get the TTL of a key
   *
   * @param key - The key
   * @returns TTL in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // ===== Advanced Operations =====

  /**
   * Get multiple values
   *
   * @param keys - Array of keys
   * @returns Array of values (null for missing keys)
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    return await this.client.mGet(keys);
  }

  /**
   * Set multiple key-value pairs
   *
   * @param entries - Array of [key, value] tuples
   */
  async mset(entries: [string, string][]): Promise<void> {
    await this.client.mSet(entries);
  }

  /**
   * Increment a numeric value
   *
   * @param key - The key
   * @param amount - Amount to increment (default: 1)
   * @returns The new value
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    if (amount === 1) {
      return await this.client.incr(key);
    }
    return await this.client.incrBy(key, amount);
  }

  /**
   * Decrement a numeric value
   *
   * @param key - The key
   * @param amount - Amount to decrement (default: 1)
   * @returns The new value
   */
  async decr(key: string, amount: number = 1): Promise<number> {
    if (amount === 1) {
      return await this.client.decr(key);
    }
    return await this.client.decrBy(key, amount);
  }

  /**
   * Get all keys matching a pattern
   *
   * **Warning**: Use with caution in production. Can be slow on large datasets.
   *
   * @param pattern - Pattern to match (e.g., 'user:*')
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * Delete all keys matching a pattern
   *
   * **Warning**: Use with caution in production.
   *
   * @param pattern - Pattern to match
   * @returns Number of keys deleted
   */
  async delPattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    return await this.client.del(keys);
  }

  /**
   * Flush all data in the current database
   *
   * **Warning**: Destructive operation. Use with extreme caution.
   */
  async flushDb(): Promise<void> {
    await this.client.flushDb();
  }
}
