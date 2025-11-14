# @stratix/ext-errors

Global error handling utilities for Stratix framework.

## Installation

```bash
pnpm add @stratix/ext-errors
```

## Usage

```typescript
import {
  AppError,
  NotFoundError,
  BadRequestError,
  ErrorCode,
  ErrorSeverity,
} from '@stratix/ext-errors';

throw new NotFoundError('User not found', { userId: '123' });

throw new BadRequestError('Invalid email format');

class CustomError extends AppError {
  readonly code = ErrorCode.VALIDATION_ERROR;
  readonly statusCode = 422;
  readonly severity = ErrorSeverity.LOW;
}
```

## License

MIT
