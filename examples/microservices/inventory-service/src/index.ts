import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger, LogLevel } from '@stratix/impl-logger-console';
import { InMemoryCommandBus, InMemoryQueryBus, InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';
import { RabbitMQPlugin } from '@stratix/ext-rabbitmq';
import { ServiceLifetime } from '@stratix/abstractions';
import Fastify from 'fastify';

import { InMemoryInventoryRepository } from './infrastructure/persistence/InMemoryInventoryRepository.js';
import { AddStockHandler } from './application/commands/AddStock.js';
import { GetInventoryHandler } from './application/queries/GetInventory.js';
import { OrderPlacedEventHandler } from './application/events/OrderPlacedEventHandler.js';
import { InventoryController } from './infrastructure/http/InventoryController.js';
import { OrderPlacedEvent } from './domain/events/OrderPlacedEvent.js';
import { AddStock } from './application/commands/AddStock.js';
import { GetInventory } from './application/queries/GetInventory.js';

async function bootstrap() {
  const PORT = process.env.PORT || 3002;
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const commandBus = new InMemoryCommandBus(container);
  const queryBus = new InMemoryQueryBus(container);
  const eventBus = new InMemoryEventBus();

  const inventoryRepository = new InMemoryInventoryRepository();

  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('commandBus', () => commandBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('queryBus', () => queryBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('inventoryRepository', () => inventoryRepository, { lifetime: ServiceLifetime.SINGLETON });

  const addStockHandler = new AddStockHandler(inventoryRepository);
  const getInventoryHandler = new GetInventoryHandler(inventoryRepository);

  container.register('addStockHandler', () => addStockHandler, { lifetime: ServiceLifetime.SINGLETON });
  container.register('getInventoryHandler', () => getInventoryHandler, { lifetime: ServiceLifetime.SINGLETON });

  commandBus.register(AddStock, addStockHandler);
  queryBus.register(GetInventory, getInventoryHandler);

  const orderPlacedHandler = new OrderPlacedEventHandler(inventoryRepository, eventBus, logger);
  eventBus.subscribe(OrderPlacedEvent, orderPlacedHandler);

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .usePlugin(new RabbitMQPlugin(eventBus), {
      url: RABBITMQ_URL,
      exchange: 'stratix.events',
      queue: 'inventory-service',
      bindings: [
        { routingKey: 'order.placed' }
      ]
    })
    .build();

  await app.start();

  const fastify = Fastify({ logger: false });
  const controller = new InventoryController(commandBus, queryBus);
  await controller.register(fastify);

  await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });

  logger.info('Inventory Service started', {
    port: PORT,
    rabbitmq: RABBITMQ_URL
  });

  const shutdown = async () => {
    logger.info('Shutting down Inventory Service...');
    await fastify.close();
    await app.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start Inventory Service:', error);
  process.exit(1);
});
