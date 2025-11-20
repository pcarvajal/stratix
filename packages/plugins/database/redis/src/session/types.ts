/**
 * Session data type
 */
export type SessionData = Record<string, unknown>;

/**
 * Session store options
 */
export interface SessionOptions {
    /**
     * Default session TTL in seconds
     */
    ttl?: number;

    /**
     * Key prefix for sessions
     */
    prefix?: string;
}
