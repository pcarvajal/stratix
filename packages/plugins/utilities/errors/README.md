# @stratix/errors

Structured error handling utilities for Stratix framework with built-in error types and severity levels.

## Installation

```bash
pnpm add @stratix/errors
```

## Features

- Pre-defined error classes for common HTTP status codes
- Error severity classification (low, medium, high, critical)
- Structured error codes for consistent error handling
- JSON serialization for API responses
- Additional context via details object
- Stack trace capture

## Built-in Error Types

### Client Errors (4xx)

#### BadRequestError (400)

Invalid request data or parameters.

```typescript
import { BadRequestError } from '@stratix/errors';

throw new BadRequestError('Invalid email format', {
  field: 'email',
  value: 'invalid'
});
```

#### UnauthorizedError (401)

Missing or invalid authentication.

```typescript
import { UnauthorizedError } from '@stratix/errors';

throw new UnauthorizedError('Token expired', {
  expiredAt: new Date()
});
```

#### ForbiddenError (403)

Valid authentication but insufficient permissions.

```typescript
import { ForbiddenError } from '@stratix/errors';

throw new ForbiddenError('Insufficient permissions', {
  required: 'admin',
  actual: 'user'
});
```

#### NotFoundError (404)

Resource not found.

```typescript
import { NotFoundError } from '@stratix/errors';

throw new NotFoundError('User not found', {
  userId: '123'
});
```

#### ConflictError (409)

Resource conflict (e.g., duplicate entry).

```typescript
import { ConflictError } from '@stratix/errors';

throw new ConflictError('Email already exists', {
  email: 'user@example.com'
});
```

#### UnprocessableEntityError (422)

Validation failed.

```typescript
import { UnprocessableEntityError } from '@stratix/errors';

throw new UnprocessableEntityError('Validation failed', {
  errors: ['Price must be positive']
});
```

### Server Errors (5xx)

#### InternalServerError (500)

Unexpected server error.

```typescript
import { InternalServerError } from '@stratix/errors';

throw new InternalServerError('Unexpected error occurred');
```

#### DatabaseError (500)

Database operation failed.

```typescript
import { DatabaseError } from '@stratix/errors';

throw new DatabaseError('Failed to connect to database', {
  host: 'localhost',
  port: 5432
});
```

#### ExternalServiceError (503)

External service unavailable or failed.

```typescript
import { ExternalServiceError } from '@stratix/errors';

throw new ExternalServiceError('Payment gateway timeout', {
  service: 'stripe'
});
```

## Error Codes

All errors include a standardized error code:

```typescript
import { ErrorCode } from '@stratix/errors';

enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}
```

## Error Severity

Errors are classified by severity for monitoring and alerting:

```typescript
import { ErrorSeverity } from '@stratix/errors';

enum ErrorSeverity {
  LOW = 'low',           // Expected errors (validation, not found)
  MEDIUM = 'medium',     // Auth/permission issues
  HIGH = 'high',         // Database/external service failures
  CRITICAL = 'critical', // Internal server errors
}
```

## Custom Errors

Create custom errors by extending `AppError`:

```typescript
import { AppError, ErrorCode, ErrorSeverity } from '@stratix/errors';

class PaymentError extends AppError {
  readonly code = ErrorCode.EXTERNAL_SERVICE_ERROR;
  readonly statusCode = 503;
  readonly severity = ErrorSeverity.HIGH;
}

throw new PaymentError('Payment processing failed', {
  transactionId: 'tx_123'
});
```

## JSON Serialization

All errors can be serialized to JSON for API responses:

```typescript
try {
  // Some operation
} catch (error) {
  if (error instanceof AppError) {
    const json = error.toJSON();
    // {
    //   error: 'NOT_FOUND',
    //   message: 'User not found',
    //   statusCode: 404,
    //   severity: 'low',
    //   details: { userId: '123' }
    // }

    return res.status(error.statusCode).json(json);
  }
}
```

## Error Handling Pattern

Recommended error handling pattern in Stratix applications:

```typescript
import { AppError, NotFoundError, DatabaseError } from '@stratix/errors';

class UserService {
  async findById(id: string): Promise<User> {
    try {
      const user = await this.repository.findById(id);

      if (!user) {
        throw new NotFoundError('User not found', { userId: id });
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error; // Re-throw known errors
      }

      // Wrap unknown errors
      throw new DatabaseError('Failed to fetch user', {
        userId: id,
        originalError: (error as Error).message
      });
    }
  }
}
```

## Integration with HTTP

Works seamlessly with `@stratix/http-fastify`:

```typescript
import { FastifyHTTPPlugin } from '@stratix/http-fastify';
import { NotFoundError } from '@stratix/errors';

httpPlugin.get('/users/:id', async (request) => {
  const user = await userService.findById(request.params.id);

  if (!user) {
    throw new NotFoundError('User not found', {
      userId: request.params.id
    });
  }

  return { body: user };
});

// Error middleware automatically handles AppError instances
```

## Exports

### Error Classes

- `AppError` - Base error class
- `BadRequestError` - 400 error
- `UnauthorizedError` - 401 error
- `ForbiddenError` - 403 error
- `NotFoundError` - 404 error
- `ConflictError` - 409 error
- `UnprocessableEntityError` - 422 error
- `InternalServerError` - 500 error
- `DatabaseError` - 500 error (database-specific)
- `ExternalServiceError` - 503 error

### Enums

- `ErrorCode` - Standardized error codes
- `ErrorSeverity` - Error severity levels

## License

MIT
