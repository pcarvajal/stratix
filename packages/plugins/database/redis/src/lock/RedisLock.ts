import type { RedisConnection } from '../RedisConnection.js';

/**
 * Lock options
 */
export interface LockOptions {
    /**
     * Lock TTL in milliseconds
     */
    ttl?: number;

    /**
     * Delay between retry attempts in milliseconds
     */
    retryDelay?: number;

    /**
     * Maximum number of retry attempts
     */
    retryCount?: number;
}

/**
 * Redis Distributed Lock
 *
 * Implements distributed locking using Redis SET NX EX.
 * Prevents race conditions in distributed systems.
 *
 * @example
 * ```typescript
 * const lock = new RedisLock(connection);
 *
 * // Automatic lock/unlock
 * await lock.withLock('resource:123', async () => {
 *   // Critical section - only one process can execute this at a time
 *   await updateResource();
 * });
 *
 * // Manual lock/unlock
 * const lockValue = await lock.acquire('resource:123');
 * try {
 *   await updateResource();
 * } finally {
 *   await lock.release('resource:123', lockValue);
 * }
 * ```
 */
export class RedisLock {
    constructor(private readonly connection: RedisConnection) { }

    /**
     * Acquire a distributed lock
     *
     * @param resource - Resource identifier
     * @param options - Lock options
     * @returns Lock value if acquired, null if failed
     */
    async acquire(resource: string, options: LockOptions = {}): Promise<string | null> {
        const ttl = options.ttl || 10000;
        const retryDelay = options.retryDelay || 100;
        const retryCount = options.retryCount || 10;

        const lockKey = `lock:${resource}`;
        const lockValue = this.generateLockValue();
        const client = this.connection.getClient();

        for (let i = 0; i < retryCount; i++) {
            const result = await client.set(lockKey, lockValue, {
                NX: true,
                PX: ttl
            });

            if (result === 'OK') {
                return lockValue;
            }

            await this.sleep(retryDelay);
        }

        return null;
    }

    /**
     * Release a distributed lock
     *
     * @param resource - Resource identifier
     * @param lockValue - Lock value from acquire()
     * @returns true if released, false if lock didn't exist or value mismatch
     */
    async release(resource: string, lockValue: string): Promise<boolean> {
        const lockKey = `lock:${resource}`;
        const client = this.connection.getClient();

        // Lua script for atomic check-and-delete
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

        const result = await client.eval(script, {
            keys: [lockKey],
            arguments: [lockValue]
        }) as number;

        return result === 1;
    }

    /**
     * Execute function with automatic lock/unlock
     *
     * @param resource - Resource identifier
     * @param fn - Function to execute
     * @param options - Lock options
     * @returns Function result
     * @throws Error if lock cannot be acquired
     */
    async withLock<T>(
        resource: string,
        fn: () => Promise<T>,
        options?: LockOptions
    ): Promise<T> {
        const lockValue = await this.acquire(resource, options);

        if (!lockValue) {
            throw new Error(`Failed to acquire lock for resource: ${resource}`);
        }

        try {
            return await fn();
        } finally {
            await this.release(resource, lockValue);
        }
    }

    private generateLockValue(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
