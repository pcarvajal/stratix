// @ts-nocheck
import fastify from 'fastify';
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { LogLevel, ServiceLifetime } from '@stratix/abstractions';
import {
  InMemoryCommandBus,
  InMemoryQueryBus,
  InMemoryEventBus,
} from '@stratix/impl-cqrs-inmemory';

import { ItemRepository } from './domain/repositories/ItemRepository.js';
import { CreateItem, CreateItemHandler } from './application/commands/CreateItem.js';
import { GetItem, GetItemHandler } from './application/queries/GetItem.js';
import { ListItems, ListItemsHandler } from './application/queries/ListItems.js';
import { InMemoryItemRepository } from './infrastructure/persistence/InMemoryItemRepository.js';
import { ItemController } from './infrastructure/http/ItemController.js';

async function bootstrap() {
  console.log('Starting REST API...');

  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const commandBus = new InMemoryCommandBus();
  const queryBus = new InMemoryQueryBus();
  const eventBus = new InMemoryEventBus();

  const itemRepository: ItemRepository = new InMemoryItemRepository();
  container.register('itemRepository', () => itemRepository, {
    lifetime: ServiceLifetime.SINGLETON,
  });
  container.register('commandBus', () => commandBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('queryBus', () => queryBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });

  const createItemHandler = new CreateItemHandler(itemRepository, eventBus);
  commandBus.register(CreateItem, createItemHandler);

  const getItemHandler = new GetItemHandler(itemRepository);
  const listItemsHandler = new ListItemsHandler(itemRepository);
  queryBus.register(GetItem, getItemHandler);
  queryBus.register(ListItems, listItemsHandler);

  const app = await ApplicationBuilder.create().useContainer(container).useLogger(logger).build();

  await app.start();

  logger.info('Stratix application started');

  const server = fastify({ logger: false });

  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  const itemController = new ItemController(commandBus, queryBus);
  await itemController.register(server);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await server.listen({ port, host: '0.0.0.0' });

  logger.info(`HTTP server listening on port ${port}`);
  logger.info('Available endpoints:');
  logger.info('  GET    /health');
  logger.info('  POST   /items');
  logger.info('  GET    /items');
  logger.info('  GET    /items/:id');

  const shutdown = async () => {
    logger.info('Shutting down...');
    await server.close();
    await app.stop();
    logger.info('Application stopped');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
