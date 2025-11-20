/**
 * RPC options
 */
export interface RPCOptions {
    /**
     * Request timeout in milliseconds
     */
    timeout?: number;

    /**
     * Custom correlation ID
     */
    correlationId?: string;
}

/**
 * RPC request handler
 */
export type RPCHandler<T, R> = (message: T) => Promise<R>;
