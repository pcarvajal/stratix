import fastify from 'fastify';
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { LogLevel, ServiceLifetime } from '@stratix/abstractions';
import { InMemoryCommandBus, InMemoryQueryBus, InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';

// Domain
import { ProductRepository } from './domain/repositories/ProductRepository.js';

// Application
import { CreateProduct, CreateProductHandler } from './application/commands/CreateProduct.js';
import { UpdateProductPrice, UpdateProductPriceHandler } from './application/commands/UpdateProductPrice.js';
import { GetProduct, GetProductHandler } from './application/queries/GetProduct.js';
import { ListProducts, ListProductsHandler } from './application/queries/ListProducts.js';

// Infrastructure
import { InMemoryProductRepository } from './infrastructure/persistence/InMemoryProductRepository.js';
import { ProductController } from './infrastructure/http/ProductController.js';

async function bootstrap() {
  console.log('Starting REST API Example...');

  // Create Stratix application
  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const commandBus = new InMemoryCommandBus();
  const queryBus = new InMemoryQueryBus();
  const eventBus = new InMemoryEventBus();

  // Register dependencies
  const productRepository: ProductRepository = new InMemoryProductRepository();
  container.register('productRepository', () => productRepository, { lifetime: ServiceLifetime.SINGLETON });
  container.register('commandBus', () => commandBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('queryBus', () => queryBus, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });

  // Register command handlers
  const createProductHandler = new CreateProductHandler(productRepository, eventBus);
  const updateProductPriceHandler = new UpdateProductPriceHandler(productRepository, eventBus);

  commandBus.register(CreateProduct, createProductHandler);
  commandBus.register(UpdateProductPrice, updateProductPriceHandler);

  // Register query handlers
  const getProductHandler = new GetProductHandler(productRepository);
  const listProductsHandler = new ListProductsHandler(productRepository);

  queryBus.register(GetProduct, getProductHandler);
  queryBus.register(ListProducts, listProductsHandler);

  // Build Stratix application
  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();

  logger.info('Stratix application started');

  // Setup Fastify HTTP server
  const server = fastify({ logger: false });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register product controller
  const productController = new ProductController(commandBus, queryBus);
  await productController.register(server);

  // Start HTTP server
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await server.listen({ port, host: '0.0.0.0' });

  logger.info(`HTTP server listening on port ${port}`);
  logger.info('Available endpoints:');
  logger.info('  GET    /health');
  logger.info('  POST   /products');
  logger.info('  GET    /products');
  logger.info('  GET    /products/:id');
  logger.info('  PATCH  /products/:id/price');

  // Graceful shutdown
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
