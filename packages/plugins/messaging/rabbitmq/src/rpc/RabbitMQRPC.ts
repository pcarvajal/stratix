import type { Channel } from 'amqplib';
import type { RPCOptions, RPCHandler } from './types.js';

/**
 * RabbitMQ RPC (Request/Reply Pattern)
 *
 * Implements synchronous request/reply communication between services.
 *
 * @example
 * ```typescript
 * // Client
 * const rpc = new RabbitMQRPC(channel);
 * const result = await rpc.call<Request, Response>('user-service', {
 *   action: 'getUser',
 *   userId: '123'
 * });
 *
 * // Server
 * await rpc.serve<Request, Response>('user-service', async (req) => {
 *   const user = await userRepository.findById(req.userId);
 *   return { user };
 * });
 * ```
 */
export class RabbitMQRPC {
    private replyQueue?: string;
    private pendingRequests = new Map<string, {
        resolve: (value: any) => void;
        reject: (error: Error) => void;
        timeout: NodeJS.Timeout;
    }>();

    constructor(private readonly channel: Channel) { }

    /**
     * Call remote procedure
     *
     * @param queue - Target queue name
     * @param message - Request message
     * @param options - RPC options
     * @returns Response from server
     */
    async call<T, R>(
        queue: string,
        message: T,
        options: RPCOptions = {}
    ): Promise<R> {
        const correlationId = options.correlationId || this.generateId();
        const timeout = options.timeout || 30000;

        if (!this.replyQueue) {
            await this.setupReplyQueue();
        }

        return new Promise<R>((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                this.pendingRequests.delete(correlationId);
                reject(new Error(`RPC timeout after ${timeout}ms for queue ${queue}`));
            }, timeout);

            this.pendingRequests.set(correlationId, {
                resolve,
                reject,
                timeout: timeoutHandle
            });

            this.channel.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(message)),
                {
                    correlationId,
                    replyTo: this.replyQueue!,
                    persistent: true,
                    contentType: 'application/json'
                }
            );
        });
    }

    /**
     * Serve RPC requests
     *
     * @param queue - Queue to listen on
     * @param handler - Request handler function
     */
    async serve<T, R>(
        queue: string,
        handler: RPCHandler<T, R>
    ): Promise<void> {
        await this.channel.assertQueue(queue, { durable: true });

        await this.channel.consume(queue, async (msg) => {
            if (!msg) return;

            try {
                const request = JSON.parse(msg.content.toString()) as T;
                const response = await handler(request);

                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(response)),
                    {
                        correlationId: msg.properties.correlationId,
                        contentType: 'application/json'
                    }
                );

                this.channel.ack(msg);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                this.channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify({ error: errorMessage })),
                    {
                        correlationId: msg.properties.correlationId,
                        contentType: 'application/json'
                    }
                );

                this.channel.nack(msg, false, false);
            }
        }, { noAck: false });
    }

    /**
     * Setup reply queue for receiving responses
     */
    private async setupReplyQueue(): Promise<void> {
        const { queue } = await this.channel.assertQueue('', {
            exclusive: true,
            autoDelete: true
        });

        this.replyQueue = queue;

        await this.channel.consume(queue, (msg) => {
            if (!msg) return;

            const correlationId = msg.properties.correlationId;
            const pending = this.pendingRequests.get(correlationId);

            if (pending) {
                clearTimeout(pending.timeout);
                this.pendingRequests.delete(correlationId);

                try {
                    const response = JSON.parse(msg.content.toString());
                    if (response.error) {
                        pending.reject(new Error(response.error));
                    } else {
                        pending.resolve(response);
                    }
                } catch (error) {
                    pending.reject(error as Error);
                }
            }
        }, { noAck: true });
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
}
