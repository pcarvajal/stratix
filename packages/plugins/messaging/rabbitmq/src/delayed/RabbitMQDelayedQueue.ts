import type { Channel } from 'amqplib';

/**
 * RabbitMQ Delayed Queue
 *
 * Implements delayed/scheduled message delivery.
 *
 * @example
 * ```typescript
 * const delayed = new RabbitMQDelayedQueue<Notification>(channel, 'notifications');
 *
 * await delayed.initialize();
 *
 * // Delay by milliseconds
 * await delayed.publishDelayed({ text: 'Hello' }, 60000); // 1 minute
 *
 * // Schedule for specific time
 * await delayed.publishScheduled({ text: 'Reminder' }, new Date('2024-12-25'));
 *
 * await delayed.consume(async (notification) => {
 *   console.log('Sending:', notification);
 * });
 * ```
 */
export class RabbitMQDelayedQueue<T> {
    private readonly delayExchange: string;

    constructor(
        private readonly channel: Channel,
        private readonly queueName: string
    ) {
        this.delayExchange = `${queueName}-delay`;
    }

    async initialize(): Promise<void> {
        await this.channel.assertQueue(this.queueName, { durable: true });

        await this.channel.assertExchange(this.delayExchange, 'direct', {
            durable: true
        });
    }

    async publishDelayed(message: T, delayMs: number): Promise<void> {
        if (delayMs < 0) {
            throw new Error('Delay must be positive');
        }

        const delayQueue = `${this.queueName}-delay-${delayMs}`;

        await this.channel.assertQueue(delayQueue, {
            durable: true,
            arguments: {
                'x-message-ttl': delayMs,
                'x-dead-letter-exchange': '',
                'x-dead-letter-routing-key': this.queueName
            }
        });

        await this.channel.sendToQueue(
            delayQueue,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                contentType: 'application/json'
            }
        );
    }

    async publishScheduled(message: T, executeAt: Date): Promise<void> {
        const delayMs = executeAt.getTime() - Date.now();

        if (delayMs <= 0) {
            throw new Error('Execution time must be in the future');
        }

        await this.publishDelayed(message, delayMs);
    }

    async consume(
        handler: (message: T) => Promise<void>,
        options: { prefetch?: number } = {}
    ): Promise<void> {
        if (options.prefetch) {
            await this.channel.prefetch(options.prefetch);
        }

        await this.channel.consume(this.queueName, async (msg) => {
            if (!msg) return;

            try {
                const message = JSON.parse(msg.content.toString()) as T;
                await handler(message);
                this.channel.ack(msg);
            } catch (error) {
                console.error('Error processing delayed message:', error);
                this.channel.nack(msg, false, true);
            }
        }, { noAck: false });
    }

    async purge(): Promise<void> {
        await this.channel.purgeQueue(this.queueName);
    }
}
