// @ts-nocheck
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { LogLevel, ServiceLifetime } from '@stratix/abstractions';
import { InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';
import { ExampleJobProcessor } from './processors/ExampleJobProcessor.js';

async function bootstrap() {
  console.log('Starting Worker...');

  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const eventBus = new InMemoryEventBus();

  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });

  const jobProcessor = new ExampleJobProcessor(logger);
  container.register('jobProcessor', () => jobProcessor, { lifetime: ServiceLifetime.SINGLETON });

  const app = await ApplicationBuilder.create().useContainer(container).useLogger(logger).build();

  await app.start();

  logger.info('Worker application started');
  logger.info('Ready to process jobs');

  const shutdown = async () => {
    logger.info('Shutting down...');
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
