import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { InMemoryCommandBus, InMemoryQueryBus, InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';
import { LogLevel, ServiceLifetime } from '@stratix/abstractions';

// SAME OrdersContextModule - ZERO changes from monolith
import { OrdersContextModule } from './orders/index.js';

/**
 * Orders Microservice
 *
 * This service was extracted from the modular monolith.
 *
 * IMPORTANT: The OrdersContextModule code is IDENTICAL to the monolith version.
 * ZERO changes were needed in domain, application, or infrastructure layers.
 *
 * Only differences:
 * 1. Different main.ts (this file)
 * 2. Different infrastructure plugins (would use Postgres, RabbitMQ in production)
 * 3. Runs as independent service
 *
 * In production, you would replace:
 * - InMemoryEventBus → RabbitMQEventBusPlugin
 * - No database in this demo → PostgresPlugin
 */

async function bootstrap() {
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const container = new AwilixContainer();

  logger.info('Bootstrapping Orders Microservice...');

  // Initialize CQRS buses
  const commandBus = new InMemoryCommandBus();
  const queryBus = new InMemoryQueryBus();

  // In production: use RabbitMQEventBusPlugin for distributed events
  const eventBus = new InMemoryEventBus();

  // Register buses in container
  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('commandBus', () => commandBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('queryBus', () => queryBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });

  // Build microservice with ONLY Orders context
  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)

    // Production infrastructure plugins would go here:
    // .usePlugin(new PostgresPlugin({ database: 'orders' }))
    // .usePlugin(new RabbitMQEventBusPlugin({ url: 'amqp://localhost' }))

    // SAME OrdersContextModule - NO changes
    .useContext(new OrdersContextModule())

    .build();

  await app.start();

  logger.info('Orders Microservice is running!');
  logger.info('');
  logger.info('Architecture: Microservice');
  logger.info('Bounded Context: Orders (extracted from monolith)');
  logger.info('');
  logger.info('Code Changes Required: ZERO');
  logger.info('  - OrdersContextModule: Identical to monolith version');
  logger.info('  - Domain layer: Unchanged');
  logger.info('  - Application layer: Unchanged');
  logger.info('  - Infrastructure layer: Unchanged');
  logger.info('');
  logger.info('Only main.ts changed:');
  logger.info('  - Removed other context plugins');
  logger.info('  - Would add distributed infrastructure plugins (Postgres, RabbitMQ)');
  logger.info('');
  logger.info('This demonstrates: Portable Bounded Contexts');

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down...');
    await app.stop();
    logger.info('Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start microservice:', error);
  process.exit(1);
});
