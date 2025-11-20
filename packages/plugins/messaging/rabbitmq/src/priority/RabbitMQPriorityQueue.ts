import type { Channel } from 'amqplib';

/**
 * RabbitMQ Priority Queue
 *
 * Implements priority-based message processing.
 *
 * @example
 * ```typescript
 * const queue = new RabbitMQPriorityQueue<Task>(channel, 'tasks', {
 *   maxPriority: 10
 * });
 *
 * await queue.initialize();
 * await queue.publish({ id: '1', action: 'process' }, 10); // High priority
 * await queue.publish({ id: '2', action: 'cleanup' }, 1);  // Low priority
 *
 * await queue.consume(async (task) => {
 *   console.log('Processing:', task);
 * });
 * ```
 */
export class RabbitMQPriorityQueue<T> {
    private readonly maxPriority: number;

    constructor(
        private readonly channel: Channel,
        private readonly queueName: string,
        options: { maxPriority?: number } = {}
    ) {
        this.maxPriority = options.maxPriority || 10;
    }

    async initialize(): Promise<void> {
        await this.channel.assertQueue(this.queueName, {
            durable: true,
            arguments: {
                'x-max-priority': this.maxPriority
            }
        });
    }

    async publish(message: T, priority: number = 0): Promise<void> {
        if (priority < 0 || priority > this.maxPriority) {
            throw new Error(`Priority must be between 0 and ${this.maxPriority}`);
        }

        await this.channel.sendToQueue(
            this.queueName,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                priority,
                contentType: 'application/json'
            }
        );
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
                console.error('Error processing priority message:', error);
                this.channel.nack(msg, false, true);
            }
        }, { noAck: false });
    }

    async purge(): Promise<void> {
        await this.channel.purgeQueue(this.queueName);
    }

    async getMessageCount(): Promise<number> {
        const info = await this.channel.checkQueue(this.queueName);
        return info.messageCount;
    }
}
