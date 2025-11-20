import type { Channel } from 'amqplib';

/**
 * RabbitMQ Router
 *
 * Implements advanced routing patterns.
 *
 * @example
 * ```typescript
 * const router = new RabbitMQRouter(channel);
 *
 * // Headers exchange routing
 * await router.publishWithHeaders(
 *   { data: 'urgent task' },
 *   { type: 'urgent', region: 'US' }
 * );
 *
 * await router.bindByHeaders(
 *   'urgent-us-queue',
 *   { type: 'urgent', region: 'US' },
 *   true // match all headers
 * );
 * ```
 */
export class RabbitMQRouter {
    private readonly headersExchange = 'headers-exchange';

    constructor(private readonly channel: Channel) { }

    async initialize(): Promise<void> {
        await this.channel.assertExchange(this.headersExchange, 'headers', {
            durable: true
        });
    }

    async publishWithHeaders(
        message: any,
        headers: Record<string, any>
    ): Promise<void> {
        await this.channel.publish(
            this.headersExchange,
            '',
            Buffer.from(JSON.stringify(message)),
            {
                headers,
                persistent: true,
                contentType: 'application/json'
            }
        );
    }

    async bindByHeaders(
        queue: string,
        matchHeaders: Record<string, any>,
        matchAll: boolean = true
    ): Promise<void> {
        await this.channel.assertQueue(queue, { durable: true });

        await this.channel.bindQueue(
            queue,
            this.headersExchange,
            '',
            {
                'x-match': matchAll ? 'all' : 'any',
                ...matchHeaders
            }
        );
    }

    async publishToExchange(
        exchange: string,
        routingKey: string,
        message: any,
        options?: {
            persistent?: boolean;
            headers?: Record<string, any>;
        }
    ): Promise<void> {
        await this.channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: options?.persistent ?? true,
                headers: options?.headers,
                contentType: 'application/json'
            }
        );
    }

    async bindQueue(
        queue: string,
        exchange: string,
        routingKey: string,
        args?: any
    ): Promise<void> {
        await this.channel.assertQueue(queue, { durable: true });
        await this.channel.bindQueue(queue, exchange, routingKey, args);
    }

    async unbindQueue(
        queue: string,
        exchange: string,
        routingKey: string
    ): Promise<void> {
        await this.channel.unbindQueue(queue, exchange, routingKey);
    }
}
