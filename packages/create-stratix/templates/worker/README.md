# Stratix Worker Application

A background job processor application built with Stratix.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm run dev
```

## Project Structure

```
src/
├── processors/       # Job processors
└── index.ts         # Application bootstrap
```

## Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm run typecheck` - Type check without emitting
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## Adding Job Processors

Create new processors in `src/processors/`:

```typescript
import { Logger } from '@stratix/abstractions';

export class MyJobProcessor {
  constructor(private readonly logger: Logger) {}

  async process(job: Job): Promise<void> {
    this.logger.info('Processing job', { jobId: job.id });
    // Your job logic here
  }
}
```

Register your processor in `src/index.ts`:

```typescript
const myProcessor = new MyJobProcessor(logger);
container.register('myProcessor', () => myProcessor, {
  lifetime: ServiceLifetime.SINGLETON
});
```

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [Background Jobs](https://stratix.dev/docs/patterns/background-jobs)
- [Event-Driven Architecture](https://stratix.dev/docs/architecture/event-driven)
