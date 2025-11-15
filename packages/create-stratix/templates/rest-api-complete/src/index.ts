// @ts-nocheck
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { InMemoryCommandBus, InMemoryQueryBus } from '@stratix/impl-cqrs-inmemory';
import { FastifyHttpPlugin } from '@stratix/ext-http-fastify';
import { ZodValidationPlugin } from '@stratix/ext-validation-zod';
import { MappersPlugin } from '@stratix/ext-mappers';
import { AuthPlugin } from '@stratix/ext-auth';
import { ErrorsPlugin } from '@stratix/ext-errors';

// Import handlers
import { CreateProductHandler } from './application/commands/CreateProductHandler.js';
import { UpdateProductHandler } from './application/commands/UpdateProductHandler.js';
import { GetProductByIdHandler } from './application/queries/GetProductByIdHandler.js';
import { ListProductsHandler } from './application/queries/ListProductsHandler.js';

// Import repository
import { InMemoryProductRepository } from './infrastructure/persistence/InMemoryProductRepository.js';

// Import routes
import { productRoutes } from './infrastructure/http/routes/product.routes.js';
import { healthRoutes } from './infrastructure/http/routes/health.routes.js';

async function bootstrap() {
  const logger = new ConsoleLogger();
  logger.info('Starting application...');

  try {
    // Initialize DI container
    const container = new AwilixContainer();

    // Register repositories
    const productRepository = new InMemoryProductRepository();
    container.register('productRepository', productRepository);

    // Initialize CQRS buses
    const commandBus = new InMemoryCommandBus(logger);
    const queryBus = new InMemoryQueryBus(logger);

    // Register command handlers
    const createProductHandler = new CreateProductHandler(productRepository, logger);
    const updateProductHandler = new UpdateProductHandler(productRepository, logger);

    commandBus.register('CreateProduct', createProductHandler);
    commandBus.register('UpdateProduct', updateProductHandler);

    // Register query handlers
    const getProductByIdHandler = new GetProductByIdHandler(productRepository);
    const listProductsHandler = new ListProductsHandler(productRepository);

    queryBus.register('GetProductById', getProductByIdHandler);
    queryBus.register('ListProducts', listProductsHandler);

    // Register buses in container
    container.register('commandBus', commandBus);
    container.register('queryBus', queryBus);

    // Initialize plugins
    const httpPlugin = new FastifyHttpPlugin({
      port: Number(process.env.PORT) || 3000,
      host: process.env.HOST || '0.0.0.0',
      cors: true,
    });

    const validationPlugin = new ZodValidationPlugin();
    const mappersPlugin = new MappersPlugin();
    const authPlugin = new AuthPlugin({
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      jwtExpiresIn: '1h',
    });
    const errorsPlugin = new ErrorsPlugin({
      includeStack: process.env.NODE_ENV !== 'production',
    });

    // Build application
    const app = await ApplicationBuilder.create()
      .useContainer(container)
      .useLogger(logger)
      .usePlugin(errorsPlugin)
      .usePlugin(validationPlugin)
      .usePlugin(mappersPlugin)
      .usePlugin(authPlugin)
      .usePlugin(httpPlugin)
      .build();

    // Register routes
    const server = httpPlugin.getServer();
    server.register(healthRoutes);
    server.register(productRoutes, { prefix: '/api/products' });

    // Start application
    await app.start();

    logger.info(`Server listening on http://${httpPlugin.config.host}:${httpPlugin.config.port}`);
    logger.info('Application started successfully');

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      await app.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start application', error as Error);
    process.exit(1);
  }
}

bootstrap();
