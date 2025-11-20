import type { RedisConnection } from '../RedisConnection.js';
import type { RateLimitOptions, RateLimitResult } from './types.js';

/**
 * Redis Rate Limiter
 *
 * Implements sliding window rate limiting using Redis sorted sets.
 * Provides protection against API abuse and DDoS attacks.
 *
 * @example
 * ```typescript
 * const limiter = new RedisRateLimiter(connection, {
 *   maxRequests: 100,
 *   windowSeconds: 60,
 *   keyPrefix: 'ratelimit:'
 * });
 *
 * const result = await limiter.isAllowed('user:123');
 * if (!result.allowed) {
 *   throw new Error(`Rate limit exceeded. Try again at ${result.resetAt}`);
 * }
 * ```
 */
export class RedisRateLimiter {
    private readonly keyPrefix: string;

    constructor(
        private readonly connection: RedisConnection,
        private readonly options: RateLimitOptions
    ) {
        this.keyPrefix = options.keyPrefix || 'ratelimit:';
    }

    /**
     * Check if request is allowed (sliding window algorithm)
     *
     * @param identifier - Unique identifier (e.g., user ID, IP address)
     * @returns Rate limit result
     */
    async isAllowed(identifier: string): Promise<RateLimitResult> {
        const key = `${this.keyPrefix}${identifier}`;
        const now = Date.now();
        const windowStart = now - (this.options.windowSeconds * 1000);
        const client = this.connection.getClient();

        // Lua script for atomic operation
        const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window_start = tonumber(ARGV[2])
      local max_requests = tonumber(ARGV[3])
      local window_seconds = tonumber(ARGV[4])
      
      redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
      local current = redis.call('ZCARD', key)
      
      if current < max_requests then
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, window_seconds)
        return {1, max_requests - current - 1, current + 1}
      else
        return {0, 0, current}
      end
    `;

        const result = await client.eval(script, {
            keys: [key],
            arguments: [
                now.toString(),
                windowStart.toString(),
                this.options.maxRequests.toString(),
                this.options.windowSeconds.toString()
            ]
        }) as [number, number, number];

        const [allowed, remaining, current] = result;

        return {
            allowed: allowed === 1,
            remaining,
            current,
            resetAt: new Date(now + (this.options.windowSeconds * 1000))
        };
    }

    /**
     * Reset rate limit for an identifier
     *
     * @param identifier - Unique identifier
     */
    async reset(identifier: string): Promise<void> {
        const key = `${this.keyPrefix}${identifier}`;
        await this.connection.del(key);
    }

    /**
     * Get current count for an identifier
     *
     * @param identifier - Unique identifier
     * @returns Current request count
     */
    async getCount(identifier: string): Promise<number> {
        const key = `${this.keyPrefix}${identifier}`;
        const now = Date.now();
        const windowStart = now - (this.options.windowSeconds * 1000);
        const client = this.connection.getClient();

        await client.zRemRangeByScore(key, 0, windowStart);
        return await client.zCard(key);
    }
}
