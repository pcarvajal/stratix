import type { Channel, ConsumeMessage } from 'amqplib';

/**
 * Domain Event interface for compatibility
 */
export interface DomainEvent {
  aggregateId: string;
  occurredOn: Date;
}

/**
 * RabbitMQ Event Bus Configuration
 */
export interface RabbitMQEventBusOptions {
  url: string;
  exchangeName?: string;
  exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';
  prefetch?: number;
  enableDLQ?: boolean;
  maxRetries?: number;
  queuePrefix?: string;
  messageTTL?: number;
  retryDelay?: number;
}

/**
 * RabbitMQ Event Bus
 *
 * Provides durable, reliable event bus using RabbitMQ for guaranteed delivery.
 *
 * Features:
 * - Durable messages (survive broker restarts)
 * - Automatic retries with exponential backoff
 * - Dead letter queue for failed messages
 * - Message acknowledgment
 * -
 */
export class RabbitMQEventBus {
  private channel?: Channel;
  private subscribers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();
  private isInitialized = false;

  private readonly exchangeName: string;
  private readonly exchangeType: 'topic' | 'direct' | 'fanout' | 'headers';
  private readonly queuePrefix: string;
  private readonly enableDLQ: boolean;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly messageTTL: number;

  constructor(options: RabbitMQEventBusOptions) {
    this.exchangeName = options.exchangeName ?? 'events';
    this.exchangeType = options.exchangeType ?? 'topic';
    this.queuePrefix = options.queuePrefix ?? 'event-queue';
    this.enableDLQ = options.enableDLQ ?? true;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 5000;
    this.messageTTL = options.messageTTL ?? 86400000; // 24 hours
  }

  /**
   * Initialize the event bus with existing connection and channel
   */
  async initialize(_connection: any, channel: Channel): Promise<void> {
    this.channel = channel;

    // Assert exchange
    await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
      durable: true,
    });

    // Setup dead letter exchange if enabled
    if (this.enableDLQ) {
      await this.channel.assertExchange(`${this.exchangeName}.dlx`, 'topic', {
        durable: true,
      });
    }

    this.isInitialized = true;
  }

  /**
   * Publish domain events
   */
  async publish(events: DomainEvent[]): Promise<void> {
    if (!this.isInitialized || !this.channel) {
      throw new Error('Event bus not initialized');
    }

    for (const event of events) {
      const routingKey = this.getRoutingKey(event);
      const message = Buffer.from(
        JSON.stringify({
          eventName: event.constructor.name,
          aggregateId: event.aggregateId,
          occurredOn: event.occurredOn.toISOString(),
          data: event,
        })
      );

      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Subscribe to domain events
   */
  subscribe(
    eventClass: new (...args: any[]) => DomainEvent,
    handler: (event: DomainEvent) => Promise<void>
  ): void {
    const eventName = eventClass.name;

    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }

    this.subscribers.get(eventName)!.push(handler as (event: DomainEvent) => Promise<void>);

    // Setup queue and binding if initialized
    if (this.isInitialized) {
      this.setupSubscriber(eventName).catch((err) => {
        console.error(`Failed to setup subscriber for ${eventName}:`, err);
      });
    }
  }

  /**
   * Setup subscriber queue and consumer
   */
  private async setupSubscriber(eventName: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    const queueName = `${this.queuePrefix}.${eventName}`;
    const routingKey = this.eventNameToRoutingKey(eventName);

    // Queue options
    const queueOptions: any = {
      durable: true,
      arguments: {
        'x-message-ttl': this.messageTTL,
      },
    };

    // Add dead letter exchange if enabled
    if (this.enableDLQ) {
      queueOptions.arguments['x-dead-letter-exchange'] = `${this.exchangeName}.dlx`;
      queueOptions.arguments['x-dead-letter-routing-key'] = `dlq.${routingKey}`;
    }

    // Assert queue
    await this.channel.assertQueue(queueName, queueOptions);

    // Bind queue to exchange
    await this.channel.bindQueue(queueName, this.exchangeName, routingKey);

    // Start consuming
    await this.channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        await this.handleMessage(msg, eventName);
      },
      { noAck: false }
    );
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(msg: ConsumeMessage, eventName: string): Promise<void> {
    if (!this.channel) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      const event = payload.data as DomainEvent;

      const handlers = this.subscribers.get(eventName) || [];

      for (const handler of handlers) {
        await handler(event);
      }

      // Acknowledge message
      this.channel.ack(msg);
    } catch (error) {
      console.error(`Error handling message for ${eventName}:`, error);

      const retryCount = (msg.properties.headers?.['x-retry-count'] as number) || 0;

      if (retryCount < this.maxRetries) {
        // Retry with delay
        setTimeout(
          () => {
            if (this.channel) {
              this.channel.nack(msg, false, true);
            }
          },
          this.retryDelay * Math.pow(2, retryCount)
        );
      } else {
        // Max retries exceeded, send to DLQ
        this.channel.nack(msg, false, false);
      }
    }
  }

  /**
   * Get routing key for event
   */
  private getRoutingKey(event: DomainEvent): string {
    return this.eventNameToRoutingKey(event.constructor.name);
  }

  /**
   * Convert event name to routing key
   */
  private eventNameToRoutingKey(eventName: string): string {
    // Convert PascalCase to snake.case
    return eventName
      .replace(/([A-Z])/g, '.$1')
      .toLowerCase()
      .slice(1);
  }
}
