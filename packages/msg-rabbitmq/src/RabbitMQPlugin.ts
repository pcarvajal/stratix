import * as amqp from 'amqplib';
import type {
  Plugin,
  PluginMetadata,
  PluginContext,
  HealthCheckResult,
} from '@stratix/core';
import { HealthStatus, ServiceLifetime } from '@stratix/core';
import { RabbitMQEventBus } from './RabbitMQEventBus.js';

/**
 * RabbitMQ plugin configuration
 */
export interface RabbitMQConfig {
  /**
   * RabbitMQ connection URL
   * Format: amqp://[username][:password]@host[:port][/vhost]
   */
  url: string;

  /**
   * Exchange name for events
   * @default 'events'
   */
  exchangeName?: string;

  /**
   * Exchange type
   * @default 'topic'
   */
  exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';

  /**
   * Prefetch count for consumers
   * @default 10
   */
  prefetch?: number;

  /**
   * Enable dead letter queue
   * @default true
   */
  enableDLQ?: boolean;

  /**
   * Max retry attempts
   * @default 3
   */
  maxRetries?: number;
}

/**
 * RabbitMQ Plugin for Stratix
 *
 * Provides durable messaging with RabbitMQ, including event bus capabilities,
 * automatic retries, and dead letter queues.
 *
 * @example
 * ```typescript
 * import { ApplicationBuilder } from '@stratix/runtime';
 * import { RabbitMQPlugin } from '@stratix/msg-rabbitmq';
 *
 * const app = await ApplicationBuilder.create()
 *   .usePlugin(new RabbitMQPlugin())
 *   .withConfig({
 *     'rabbitmq': {
 *       url: 'amqp://localhost:5672',
 *       exchangeName: 'events',
 *       prefetch: 10
 *     }
 *   })
 *   .build();
 *
 * await app.start();
 *
 * // Access the event bus
 * const eventBus = app.resolve<RabbitMQEventBus>('rabbitmq:eventBus');
 * await eventBus.publish([event]);
 * ```
 */
export class RabbitMQPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'rabbitmq',
    version: '0.1.0',
    description: 'RabbitMQ messaging plugin with durable queues and event bus',
    dependencies: [],
  };

  private connection?: any;
  private channel?: amqp.Channel;
  private eventBus?: RabbitMQEventBus;
  private config?: RabbitMQConfig;
  private isConnected = false;

  /**
   * Initialize the plugin
   *
   * Creates the RabbitMQ connection configuration and registers services.
   */
  async initialize(context: PluginContext): Promise<void> {
    this.config = context.getConfig<RabbitMQConfig>();

    // Validate configuration
    if (!this.config.url) {
      throw new Error('RabbitMQ URL is required');
    }

    // Create event bus instance
    this.eventBus = new RabbitMQEventBus({
      url: this.config.url,
      exchangeName: this.config.exchangeName ?? 'events',
      exchangeType: this.config.exchangeType ?? 'topic',
      prefetch: this.config.prefetch ?? 10,
      enableDLQ: this.config.enableDLQ ?? true,
      maxRetries: this.config.maxRetries ?? 3,
    });

    // Register event bus in container
    context.container.register('rabbitmq:eventBus', () => this.eventBus!, {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register connection accessor
    context.container.register('rabbitmq:connection', () => this.connection!, {
      lifetime: ServiceLifetime.SINGLETON,
    });

    // Register channel accessor
    context.container.register('rabbitmq:channel', () => this.channel!, {
      lifetime: ServiceLifetime.SINGLETON,
    });
  }

  /**
   * Start the plugin
   *
   * Connects to RabbitMQ and initializes the event bus.
   */
  async start(): Promise<void> {
    if (!this.config || !this.eventBus) {
      throw new Error('RabbitMQPlugin not initialized. Call initialize() first.');
    }

    try {
      // Connect to RabbitMQ
      const conn = await amqp.connect(this.config.url);
      this.connection = conn;
      this.channel = await conn.createChannel();

      // Set prefetch
      await this.channel.prefetch(this.config.prefetch ?? 10);

      // Initialize event bus
      await this.eventBus.initialize(conn, this.channel);

      this.isConnected = true;
      console.log('RabbitMQ connected successfully');
    } catch (error) {
      throw new Error(
        `Failed to connect to RabbitMQ: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Stop the plugin
   *
   * Closes RabbitMQ connections gracefully.
   */
  async stop(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = undefined;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = undefined;
      }

      this.isConnected = false;
      console.log('RabbitMQ disconnected successfully');
    } catch (error) {
      console.error(
        `Error disconnecting from RabbitMQ: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Perform a health check
   *
   * Checks if the RabbitMQ connection is alive.
   */
  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.connection) {
      return {
        status: HealthStatus.DOWN,
        message: 'Not initialized',
      };
    }

    if (!this.isConnected) {
      return {
        status: HealthStatus.DOWN,
        message: 'Not connected',
      };
    }

    try {
      // Check if connection is still alive
      if (this.channel) {
        return {
          status: HealthStatus.UP,
          message: 'Connected and responsive',
        };
      }

      return {
        status: HealthStatus.DOWN,
        message: 'Channel not available',
      };
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get the event bus instance
   */
  getEventBus(): RabbitMQEventBus {
    if (!this.eventBus) {
      throw new Error('Event bus not initialized');
    }
    return this.eventBus;
  }

  /**
   * Get the RabbitMQ connection
   */
  getConnection(): amqp.Connection {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }
    return this.connection;
  }

  /**
   * Get the RabbitMQ channel
   */
  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }
    return this.channel;
  }
}
