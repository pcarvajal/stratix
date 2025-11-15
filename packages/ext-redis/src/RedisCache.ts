import type { RedisConnection } from './RedisConnection.js';

/**
 * Cache options
 */
export interface CacheOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number;

  /**
   * Key prefix for namespacing
   */
  prefix?: string;
}

/**
 * Redis Cache
 *
 * Provides a simple caching interface with JSON serialization.
 * Wraps RedisConnection with caching-specific methods.
 *
 * @example
 * ```typescript
 * const cache = new RedisCache(connection, { prefix: 'myapp:' });
 *
 * // Set and get with automatic JSON serialization
 * await cache.set('user:123', { name: 'John', email: 'john@example.com' }, 3600);
 * const user = await cache.get<User>('user:123');
 *
 * // Remember pattern
 * const user = await cache.remember('user:123', 3600, async () => {
 *   return await userRepository.findById('123');
 * });
 * ```
 */
export class RedisCache {
  private readonly prefix: string;
  private readonly defaultTtl?: number;

  constructor(
    private readonly connection: RedisConnection,
    options: CacheOptions = {}
  ) {
    this.prefix = options.prefix || '';
    this.defaultTtl = options.ttl;
  }

  /**
   * Build the full key with prefix
   */
  private buildKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Set a value in cache
   *
   * Automatically serializes to JSON.
   *
   * @template T - The value type
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional TTL in seconds (overrides default)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.buildKey(key);
    const serialized = JSON.stringify(value);
    const effectiveTtl = ttl ?? this.defaultTtl;

    await this.connection.set(fullKey, serialized, effectiveTtl);
  }

  /**
   * Get a value from cache
   *
   * Automatically deserializes from JSON.
   *
   * @template T - The value type
   * @param key - Cache key
   * @returns The cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);
    const value = await this.connection.get(fullKey);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse cached value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   *
   * @param key - Cache key
   * @returns true if deleted, false if key didn't exist
   */
  async del(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    const result = await this.connection.del(fullKey);
    return result === 1;
  }

  /**
   * Check if a key exists in cache
   *
   * @param key - Cache key
   */
  async has(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    return await this.connection.exists(fullKey);
  }

  /**
   * Get or set (remember) pattern
   *
   * If the key exists, return the cached value.
   * Otherwise, execute the callback, cache the result, and return it.
   *
   * @template T - The value type
   * @param key - Cache key
   * @param ttl - TTL in seconds
   * @param callback - Function to execute if cache miss
   * @returns The cached or computed value
   *
   * @example
   * ```typescript
   * const user = await cache.remember('user:123', 3600, async () => {
   *   return await userRepository.findById('123');
   * });
   * ```
   */
  async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - execute callback
    const value = await callback();

    // Cache the result
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Get multiple values from cache
   *
   * @template T - The value type
   * @param keys - Array of cache keys
   * @returns Array of values (null for missing keys)
   */
  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    const fullKeys = keys.map((k) => this.buildKey(k));
    const values = await this.connection.mget(fullKeys);

    return values.map((value) => {
      if (value === null) {
        return null;
      }

      try {
        return JSON.parse(value) as T;
      } catch (error) {
        console.error('Failed to parse cached value:', error);
        return null;
      }
    });
  }

  /**
   * Set multiple values in cache
   *
   * **Note**: TTL not supported for batch operations.
   *
   * @template T - The value type
   * @param entries - Array of [key, value] tuples
   */
  async setMany<T>(entries: [string, T][]): Promise<void> {
    const serialized: [string, string][] = entries.map(([key, value]) => [
      this.buildKey(key),
      JSON.stringify(value),
    ]);

    await this.connection.mset(serialized);
  }

  /**
   * Delete multiple keys from cache
   *
   * @param keys - Array of cache keys
   * @returns Number of keys deleted
   */
  async delMany(keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    const fullKeys = keys.map((k) => this.buildKey(k));
    return await this.connection.getClient().del(fullKeys);
  }

  /**
   * Clear all keys with the configured prefix
   *
   * **Warning**: Use with caution.
   */
  async clear(): Promise<number> {
    if (!this.prefix) {
      throw new Error('Cannot clear cache without a prefix. Use connection.flushDb() instead.');
    }

    return await this.connection.delPattern(`${this.prefix}*`);
  }

  /**
   * Get the TTL of a cached key
   *
   * @param key - Cache key
   * @returns TTL in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    const fullKey = this.buildKey(key);
    return await this.connection.ttl(fullKey);
  }

  /**
   * Update the TTL of a cached key
   *
   * @param key - Cache key
   * @param seconds - New TTL in seconds
   */
  async touch(key: string, seconds: number): Promise<boolean> {
    const fullKey = this.buildKey(key);
    return await this.connection.expire(fullKey, seconds);
  }
}
