import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger, LogLevel } from '@stratix/impl-logger-console';
import { InMemoryCommandBus, InMemoryQueryBus, InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';
import { RabbitMQPlugin } from '@stratix/ext-rabbitmq';
import { ServiceLifetime } from '@stratix/abstractions';
import Fastify from 'fastify';

import { InMemoryOrderRepository } from './infrastructure/persistence/InMemoryOrderRepository.js';
import { CreateOrderHandler } from './application/commands/CreateOrder.js';
import { GetOrderHandler } from './application/queries/GetOrder.js';
import { OrderController } from './infrastructure/http/OrderController.js';
import { StockReservedEventHandler, StockReservationFailedEventHandler } from './infrastructure/events/StockEventHandlers.js';
import { StockReservedEvent } from './domain/events/StockReservedEvent.js';
import { StockReservationFailedEvent } from './domain/events/StockReservationFailedEvent.js';
import { CreateOrder } from './application/commands/CreateOrder.js';
import { GetOrder } from './application/queries/GetOrder.js';

async function bootstrap() {
  const PORT = process.env.PORT || 3001;
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const commandBus = new InMemoryCommandBus(container);
  const queryBus = new InMemoryQueryBus(container);
  const eventBus = new InMemoryEventBus();

  const orderRepository = new InMemoryOrderRepository();

  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('commandBus', () => commandBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('queryBus', () => queryBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('orderRepository', () => orderRepository, { lifetime: ServiceLifetime.SINGLETON });

  const createOrderHandler = new CreateOrderHandler(orderRepository, eventBus);
  const getOrderHandler = new GetOrderHandler(orderRepository);

  container.register('createOrderHandler', () => createOrderHandler, { lifetime: ServiceLifetime.SINGLETON });
  container.register('getOrderHandler', () => getOrderHandler, { lifetime: ServiceLifetime.SINGLETON });

  commandBus.register(CreateOrder, createOrderHandler);
  queryBus.register(GetOrder, getOrderHandler);

  const stockReservedHandler = new StockReservedEventHandler(orderRepository, logger);
  const stockReservationFailedHandler = new StockReservationFailedEventHandler(orderRepository, logger);

  eventBus.subscribe(StockReservedEvent, stockReservedHandler);
  eventBus.subscribe(StockReservationFailedEvent, stockReservationFailedHandler);

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .usePlugin(new RabbitMQPlugin(eventBus), {
      url: RABBITMQ_URL,
      exchange: 'stratix.events',
      queue: 'order-service',
      bindings: [
        { routingKey: 'stock.reserved' },
        { routingKey: 'stock.reservation.failed' }
      ]
    })
    .build();

  await app.start();

  const fastify = Fastify({ logger: false });
  const controller = new OrderController(commandBus, queryBus);
  await controller.register(fastify);

  await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });

  logger.info('Order Service started', {
    port: PORT,
    rabbitmq: RABBITMQ_URL
  });

  const shutdown = async () => {
    logger.info('Shutting down Order Service...');
    await fastify.close();
    await app.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start Order Service:', error);
  process.exit(1);
});
