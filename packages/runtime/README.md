# @stratix/runtime

Plugin system and application builder for Stratix.

## Installation

```bash
pnpm add @stratix/runtime
```

## What's Included

- **ApplicationBuilder** - Fluent API to configure your application
- **Plugin System** - Lifecycle management for plugins
- **Dependency Graph** - Automatic plugin ordering
- **Health Checks** - Built-in health monitoring

## Quick Example

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  .usePlugin(new PostgresPlugin())
  .build();

await app.start();
```

## License

MIT
