import type { RedisConnection } from '../RedisConnection.js';
import type { SessionData, SessionOptions } from './types.js';

/**
 * Redis Session Store
 *
 * Manages user sessions with automatic TTL and JSON serialization.
 *
 * @example
 * ```typescript
 * const sessions = new RedisSessionStore(connection, {
 *   ttl: 3600,
 *   prefix: 'session:'
 * });
 *
 * await sessions.set('session-id', { userId: '123', role: 'admin' });
 * const data = await sessions.get('session-id');
 * await sessions.touch('session-id'); // Refresh TTL
 * await sessions.destroy('session-id');
 * ```
 */
export class RedisSessionStore {
    private readonly prefix: string;
    private readonly ttl: number;

    constructor(
        private readonly connection: RedisConnection,
        options: SessionOptions = {}
    ) {
        this.prefix = options.prefix || 'session:';
        this.ttl = options.ttl || 3600;
    }

    async set(sessionId: string, data: SessionData, ttl?: number): Promise<void> {
        const key = `${this.prefix}${sessionId}`;
        const serialized = JSON.stringify(data);
        await this.connection.set(key, serialized, ttl || this.ttl);
    }

    async get(sessionId: string): Promise<SessionData | null> {
        const key = `${this.prefix}${sessionId}`;
        const value = await this.connection.get(key);

        if (!value) return null;

        try {
            return JSON.parse(value) as SessionData;
        } catch {
            return null;
        }
    }

    async update(sessionId: string, updates: Partial<SessionData>): Promise<void> {
        const current = await this.get(sessionId);

        if (!current) {
            throw new Error(`Session ${sessionId} not found`);
        }

        await this.set(sessionId, { ...current, ...updates });
    }

    async destroy(sessionId: string): Promise<boolean> {
        const key = `${this.prefix}${sessionId}`;
        const result = await this.connection.del(key);
        return result === 1;
    }

    async touch(sessionId: string, ttl?: number): Promise<boolean> {
        const key = `${this.prefix}${sessionId}`;
        return await this.connection.expire(key, ttl || this.ttl);
    }

    async exists(sessionId: string): Promise<boolean> {
        const key = `${this.prefix}${sessionId}`;
        return await this.connection.exists(key);
    }
}
