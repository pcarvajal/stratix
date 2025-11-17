// @ts-nocheck
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { LogLevel } from '@stratix/abstractions';
import {
  InMemoryCommandBus,
  InMemoryQueryBus,
  InMemoryEventBus,
} from '@stratix/impl-cqrs-inmemory';
import { ServiceLifetime } from '@stratix/abstractions';
import { FastifyHttpPlugin } from '@stratix/ext-http-fastify';
import { ZodValidationPlugin } from '@stratix/ext-validation-zod';
import { MappersPlugin } from '@stratix/ext-mappers';
import { ErrorsPlugin } from '@stratix/ext-errors';

import { InMemoryTaskRepository } from './infrastructure/persistence/InMemoryTaskRepository.js';
import { CreateTaskHandler } from './application/commands/CreateTask.js';
import { GetTaskHandler } from './application/queries/GetTask.js';
import { TaskCompletedEventHandler } from './application/events/TaskCompletedEventHandler.js';
import { TaskController } from './infrastructure/http/TaskController.js';
import { TaskCompletedEvent } from './domain/events/TaskCompletedEvent.js';
import { CreateTask } from './application/commands/CreateTask.js';
import { GetTask } from './application/queries/GetTask.js';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const commandBus = new InMemoryCommandBus();
  const queryBus = new InMemoryQueryBus();
  const eventBus = new InMemoryEventBus();

  const taskRepository = new InMemoryTaskRepository();

  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('commandBus', () => commandBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('queryBus', () => queryBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('taskRepository', () => taskRepository, {
    lifetime: ServiceLifetime.SINGLETON,
  });

  const createTaskHandler = new CreateTaskHandler(taskRepository, eventBus);
  const getTaskHandler = new GetTaskHandler(taskRepository);

  container.register('createTaskHandler', () => createTaskHandler, {
    lifetime: ServiceLifetime.SINGLETON,
  });
  container.register('getTaskHandler', () => getTaskHandler, {
    lifetime: ServiceLifetime.SINGLETON,
  });

  commandBus.register(CreateTask, createTaskHandler);
  queryBus.register(GetTask, getTaskHandler);

  const taskCompletedHandler = new TaskCompletedEventHandler(logger);
  eventBus.subscribe(TaskCompletedEvent, taskCompletedHandler);

  const errorsPlugin = new ErrorsPlugin({
    includeStack: process.env.NODE_ENV !== 'production',
  });

  const validationPlugin = new ZodValidationPlugin();
  const mappersPlugin = new MappersPlugin();

  const httpPlugin = new FastifyHttpPlugin({
    port: Number(PORT),
    host: '0.0.0.0',
    cors: true,
  });

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .usePlugin(errorsPlugin)
    .usePlugin(validationPlugin)
    .usePlugin(mappersPlugin)
    .usePlugin(httpPlugin)
    .build();

  await app.start();

  const server = httpPlugin.getServer();
  const controller = new TaskController(commandBus, queryBus);
  await controller.register(server);

  logger.info('Microservice started', {
    port: PORT,
  });

  const shutdown = async () => {
    logger.info('Shutting down microservice...');
    await app.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start microservice:', error);
  process.exit(1);
});
