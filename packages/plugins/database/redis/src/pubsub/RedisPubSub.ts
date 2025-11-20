import type { RedisConnection } from '../RedisConnection.js';

type MessageHandler<T = unknown> = (message: T, channel: string) => void | Promise<void>;

/**
 * Redis Pub/Sub
 *
 * Implements publish/subscribe messaging pattern.
 *
 * @example
 * ```typescript
 * const pubsub = new RedisPubSub(publisherConn, subscriberConn);
 *
 * await pubsub.subscribe('notifications', (msg) => {
 *   console.log('Received:', msg);
 * });
 *
 * await pubsub.publish('notifications', { type: 'alert', text: 'Hello' });
 * ```
 */
export class RedisPubSub {
    private subscribers = new Map<string, Set<MessageHandler<unknown>>>();

    constructor(
        private readonly publisherConnection: RedisConnection,
        private readonly subscriberConnection: RedisConnection
    ) { }

    async publish<T>(channel: string, message: T): Promise<number> {
        const serialized = JSON.stringify(message);
        return await this.publisherConnection.getClient().publish(channel, serialized);
    }

    async subscribe<T = unknown>(channel: string, handler: MessageHandler<T>): Promise<void> {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set<MessageHandler<unknown>>());

            await this.subscriberConnection.getClient().subscribe(channel, (message) => {
                try {
                    const parsed = JSON.parse(message) as T;
                    const handlers = this.subscribers.get(channel);

                    if (handlers) {
                        handlers.forEach(h => {
                            Promise.resolve((h as MessageHandler<T>)(parsed, channel)).catch(err => {
                                console.error(`Error in subscriber handler for ${channel}:`, err);
                            });
                        });
                    }
                } catch (error) {
                    console.error(`Failed to parse message from ${channel}:`, error);
                }
            });
        }

        this.subscribers.get(channel)!.add(handler as MessageHandler<unknown>);
    }

    async unsubscribe(channel: string, handler?: MessageHandler): Promise<void> {
        const handlers = this.subscribers.get(channel);

        if (!handlers) return;

        if (handler) {
            handlers.delete(handler);

            if (handlers.size === 0) {
                await this.subscriberConnection.getClient().unsubscribe(channel);
                this.subscribers.delete(channel);
            }
        } else {
            await this.subscriberConnection.getClient().unsubscribe(channel);
            this.subscribers.delete(channel);
        }
    }
}
