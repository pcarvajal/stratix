/**
 * Rate limit configuration
 */
export interface RateLimitOptions {
    /**
     * Maximum number of requests allowed
     */
    maxRequests: number;

    /**
     * Time window in seconds
     */
    windowSeconds: number;

    /**
     * Optional key prefix for namespacing
     */
    keyPrefix?: string;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
    /**
     * Whether the request is allowed
     */
    allowed: boolean;

    /**
     * Number of remaining requests in the window
     */
    remaining: number;

    /**
     * When the rate limit window resets
     */
    resetAt: Date;

    /**
     * Current request count
     */
    current: number;
}
