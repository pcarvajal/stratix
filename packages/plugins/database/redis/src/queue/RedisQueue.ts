import type { RedisConnection } from '../RedisConnection.js';

/**
 * Redis Queue
 *
 * Implements FIFO queue for job processing and task queues.
 *
 * @example
 * ```typescript
 * const queue = new RedisQueue<Job>(connection, 'jobs');
 *
 * await queue.push({ id: '1', task: 'process-payment' });
 * const job = await queue.pop();
 *
 * // Worker with blocking pop
 * while (true) {
 *   const job = await queue.blockingPop(30);
 *   if (job) await processJob(job);
 * }
 * ```
 */
export class RedisQueue<T> {
    constructor(
        private readonly connection: RedisConnection,
        private readonly queueName: string
    ) { }

    async push(item: T): Promise<number> {
        const serialized = JSON.stringify(item);
        const client = this.connection.getClient();
        return await client.rPush(this.queueName, serialized);
    }

    async pushMany(items: T[]): Promise<number> {
        const serialized = items.map(item => JSON.stringify(item));
        const client = this.connection.getClient();
        return await client.rPush(this.queueName, serialized);
    }

    async pop(): Promise<T | null> {
        const client = this.connection.getClient();
        const value = await client.lPop(this.queueName);

        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    async blockingPop(timeoutSeconds: number = 0): Promise<T | null> {
        const client = this.connection.getClient();
        const result = await client.blPop(this.queueName, timeoutSeconds);

        if (!result) return null;

        try {
            return JSON.parse(result.element) as T;
        } catch {
            return null;
        }
    }

    async peek(): Promise<T | null> {
        const client = this.connection.getClient();
        const value = await client.lIndex(this.queueName, 0);

        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    async size(): Promise<number> {
        const client = this.connection.getClient();
        return await client.lLen(this.queueName);
    }

    async clear(): Promise<void> {
        await this.connection.del(this.queueName);
    }

    async getAll(): Promise<T[]> {
        const client = this.connection.getClient();
        const values = await client.lRange(this.queueName, 0, -1);

        return values.map(v => {
            try {
                return JSON.parse(v) as T;
            } catch {
                return null as T;
            }
        }).filter(v => v !== null);
    }
}
