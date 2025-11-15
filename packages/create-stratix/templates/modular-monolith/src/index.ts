import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import {
  InMemoryCommandBus,
  InMemoryQueryBus,
  InMemoryEventBus,
} from '@stratix/impl-cqrs-inmemory';
import { LogLevel, ServiceLifetime } from '@stratix/abstractions';

// Import Context Modules
import { ProductsContextModule } from './contexts/products/index.js';
import { OrdersContextModule } from './contexts/orders/index.js';
import { InventoryContextModule } from './contexts/inventory/index.js';

async function bootstrap() {
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const container = new AwilixContainer();

  logger.info('Bootstrapping Modular Monolith with Bounded Context Modules...');

  // Initialize CQRS buses
  const commandBus = new InMemoryCommandBus();
  const queryBus = new InMemoryQueryBus();
  const eventBus = new InMemoryEventBus();

  // Register buses in container
  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('commandBus', () => commandBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('queryBus', () => queryBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });

  // Build application with Context Modules
  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)

    // Bounded Contexts as Modules - Each BC is a self-contained module
    .useContext(new ProductsContextModule())
    .useContext(new OrdersContextModule())
    .useContext(new InventoryContextModule())

    .build();

  await app.start();

  logger.info('Modular Monolith is running!');
  logger.info('');
  logger.info('Bounded Contexts loaded as modules:');
  logger.info('  - Products: Manages product catalog');
  logger.info('  - Orders: Manages customer orders');
  logger.info('  - Inventory: Manages stock levels');
  logger.info('');
  logger.info('Architecture: Modular Monolith');
  logger.info('Pattern: Bounded Contexts as Modules');
  logger.info('');
  logger.info('To migrate to microservices:');
  logger.info('  1. Extract one BC to separate service');
  logger.info('  2. Change infrastructure modules (EventBus, Database)');
  logger.info('  3. ZERO changes needed in domain code');
  logger.info('');
  logger.info('Try commands:');
  logger.info('  const result = await commandBus.dispatch(new CreateProductCommand(...));');
  logger.info('  const result = await queryBus.dispatch(new ListProductsQuery());');

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
  console.error('Failed to start application:', error);
  process.exit(1);
});
