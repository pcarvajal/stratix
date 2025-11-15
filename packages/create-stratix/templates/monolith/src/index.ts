// @ts-nocheck
import 'dotenv/config';
import Fastify from 'fastify';
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { LogLevel, ServiceLifetime } from '@stratix/abstractions';
import { InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';

// Users context
import { InMemoryUserRepository } from './contexts/users/src/infrastructure/persistence/InMemoryUserRepository.js';
import { RegisterUserHandler } from './contexts/users/src/application/commands/RegisterUser.js';
import { GetUserHandler } from './contexts/users/src/application/queries/GetUser.js';
import { UserController } from './contexts/users/src/infrastructure/http/UserController.js';

// Orders context
import { InMemoryOrderRepository } from './contexts/orders/src/infrastructure/persistence/InMemoryOrderRepository.js';
import { UserRegisteredHandler } from './contexts/orders/src/application/events/UserRegisteredHandler.js';
import { UserRegisteredIntegrationEvent } from './contexts/users/src/domain/events/UserRegisteredIntegrationEvent.js';

async function bootstrap() {
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const container = new AwilixContainer();
  const eventBus = new InMemoryEventBus();

  logger.info('Bootstrapping modular monolith...');

  // Register shared infrastructure
  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });

  // Users Context Setup
  logger.info('Setting up Users context...');
  const userRepository = new InMemoryUserRepository();
  container.register('userRepository', () => userRepository, {
    lifetime: ServiceLifetime.SINGLETON,
  });

  const registerUserHandler = new RegisterUserHandler(userRepository, eventBus);
  const getUserHandler = new GetUserHandler(userRepository);

  container.register('registerUserHandler', () => registerUserHandler, {
    lifetime: ServiceLifetime.SINGLETON,
  });
  container.register('getUserHandler', () => getUserHandler, {
    lifetime: ServiceLifetime.SINGLETON,
  });

  // Orders Context Setup
  logger.info('Setting up Orders context...');
  const orderRepository = new InMemoryOrderRepository();
  container.register('orderRepository', () => orderRepository, {
    lifetime: ServiceLifetime.SINGLETON,
  });

  // Subscribe to integration events (inter-context communication)
  const userRegisteredHandler = new UserRegisteredHandler(logger);
  eventBus.subscribe(UserRegisteredIntegrationEvent, userRegisteredHandler);
  logger.info('Orders context subscribed to UserRegisteredIntegrationEvent');

  // Build Stratix application
  const app = await ApplicationBuilder.create().useContainer(container).useLogger(logger).build();

  await app.start();

  // Setup HTTP server
  const fastify = Fastify({
    logger: false,
  });

  // Health check
  fastify.get('/health', async () => {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      contexts: {
        users: 'UP',
        orders: 'UP',
      },
    };
  });

  // Register context controllers
  const userController = new UserController(registerUserHandler, getUserHandler);
  userController.registerRoutes(fastify);

  // Start HTTP server
  const port = parseInt(process.env.PORT || '3000', 10);
  await fastify.listen({ port, host: '0.0.0.0' });

  logger.info(`Modular monolith listening on http://localhost:${port}`);
  logger.info('Available endpoints:');
  logger.info('  GET  /health');
  logger.info('  POST /api/users');
  logger.info('  GET  /api/users/:id');
  logger.info('');
  logger.info('Bounded contexts:');
  logger.info('  - Users: Manages user registration and profiles');
  logger.info('  - Orders: Manages orders and listens to user events');
  logger.info('');
  logger.info('Inter-context communication via event bus enabled');

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down...');
    await fastify.close();
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
