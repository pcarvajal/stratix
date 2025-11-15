import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { LogLevel, ServiceLifetime } from '@stratix/abstractions';
import { InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';
import { SendEmailProcessor } from './processors/SendEmailProcessor.js';

async function bootstrap() {
  console.log('Starting Worker Example...');

  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const eventBus = new InMemoryEventBus();

  // Register dependencies
  container.register('logger', () => logger, { lifetime: ServiceLifetime.SINGLETON });
  container.register('eventBus', () => eventBus, { lifetime: ServiceLifetime.SINGLETON });

  // Register job processors
  const emailProcessor = new SendEmailProcessor(logger);
  container.register('emailProcessor', () => emailProcessor, { lifetime: ServiceLifetime.SINGLETON });

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

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
