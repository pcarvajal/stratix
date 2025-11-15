# @stratix/impl-logger-console

Console logger implementation.

## Installation

```bash
pnpm add @stratix/impl-logger-console
```

## Features

- Colored output
- Log levels (DEBUG, INFO, WARN, ERROR)
- Structured logging
- Timestamp formatting

## Quick Example

```typescript
import { ConsoleLogger } from '@stratix/impl-logger-console';
import { LogLevel } from '@stratix/abstractions';

const logger = new ConsoleLogger({ level: LogLevel.INFO });

logger.info('Application started');
logger.error('An error occurred', { userId: '123' });
```

## License

MIT
