# @stratix/ext-http-fastify

Fastify HTTP integration plugin for Stratix framework. Provides a production-ready HTTP server with route management, error handling, and CORS support.

## Installation

```bash
npm install @stratix/ext-http-fastify
# or
pnpm add @stratix/ext-http-fastify
# or
yarn add @stratix/ext-http-fastify
```

## Features

- Fastify-based HTTP server with excellent performance
- Type-safe route handlers
- Built-in error handling with custom error types
- CORS support
- Request/response marshaling
- JSON schema validation support
- Health check integration
- Prefix support for API versioning

## Usage

### Basic Setup

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { FastifyHTTPPlugin } from '@stratix/ext-http-fastify';
import { ConsoleLoggerPlugin } from '@stratix/impl-logger-console';

const app = await ApplicationBuilder.create()
  .usePlugin(new ConsoleLoggerPlugin())
  .usePlugin(new FastifyHTTPPlugin({
    port: 3000,
    prefix: '/api/v1',
    cors: true,
  }))
  .build();

await app.start();
```

### Route Definition

```typescript
import { FastifyHTTPPlugin, HttpErrorImpl } from '@stratix/ext-http-fastify';

const httpPlugin = new FastifyHTTPPlugin({ port: 3000 });

httpPlugin.route({
  method: 'GET',
  path: '/users/:id',
  handler: async (request) => {
    const userId = request.params.id;

    const user = await userRepository.findById(userId);

    if (!user) {
      throw HttpErrorImpl.notFound('User not found');
    }

    return {
      statusCode: 200,
      body: { id: user.id, name: user.name }
    };
  }
});
```

### Shorthand Methods

```typescript
// GET request
httpPlugin.get('/users', async (request) => {
  const users = await userRepository.findAll();
  return { body: users };
});

// POST request
httpPlugin.post('/users', async (request) => {
  const userData = request.body;
  const user = await userService.create(userData);
  return { statusCode: 201, body: user };
});

// PUT request
httpPlugin.put('/users/:id', async (request) => {
  const user = await userService.update(request.params.id, request.body);
  return { body: user };
});

// DELETE request
httpPlugin.delete('/users/:id', async (request) => {
  await userService.delete(request.params.id);
  return { statusCode: 204 };
});
```

### Error Handling

```typescript
import { HttpErrorImpl } from '@stratix/ext-http-fastify';

httpPlugin.post('/products', async (request) => {
  const { name, price } = request.body;

  if (!name || !price) {
    throw HttpErrorImpl.badRequest('Name and price are required');
  }

  if (price < 0) {
    throw HttpErrorImpl.unprocessableEntity('Price must be positive');
  }

  const product = await productService.create({ name, price });
  return { statusCode: 201, body: product };
});
```

### Available Error Methods

- `HttpErrorImpl.badRequest(message, details?)` - 400
- `HttpErrorImpl.unauthorized(message?, details?)` - 401
- `HttpErrorImpl.forbidden(message?, details?)` - 403
- `HttpErrorImpl.notFound(message?, details?)` - 404
- `HttpErrorImpl.conflict(message, details?)` - 409
- `HttpErrorImpl.unprocessableEntity(message, details?)` - 422
- `HttpErrorImpl.internalServerError(message?, details?)` - 500
- `HttpErrorImpl.serviceUnavailable(message?, details?)` - 503

### CORS Configuration

```typescript
const httpPlugin = new FastifyHTTPPlugin({
  port: 3000,
  cors: {
    origin: ['https://example.com', 'https://app.example.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});
```

### Schema Validation

```typescript
httpPlugin.route({
  method: 'POST',
  path: '/users',
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  },
  handler: async (request) => {
    const user = await userService.create(request.body);
    return { statusCode: 201, body: user };
  }
});
```

### Integration with CQRS

```typescript
import { CommandBus } from '@stratix/abstractions';
import { CreateProductCommand } from './commands/CreateProduct';

httpPlugin.post('/products', async (request) => {
  const commandBus = container.resolve<CommandBus>('commandBus');

  const result = await commandBus.dispatch(
    new CreateProductCommand(request.body)
  );

  if (result.isFailure) {
    throw HttpErrorImpl.badRequest(result.error.message);
  }

  return { statusCode: 201, body: result.value };
});
```

## Configuration Options

```typescript
interface FastifyHTTPPluginOptions {
  port?: number;              // Default: 3000
  host?: string;              // Default: '0.0.0.0'
  prefix?: string;            // API prefix, e.g., '/api/v1'
  cors?: boolean | CorsOptions;
  logger?: boolean;           // Enable Fastify internal logger
  trustProxy?: boolean;       // Trust proxy headers
}
```

## Type Safety

The plugin provides full TypeScript support with generic types:

```typescript
interface CreateUserBody {
  name: string;
  email: string;
}

interface UserParams {
  id: string;
}

interface UserQuery {
  include?: string;
}

httpPlugin.route<CreateUserBody, UserQuery, UserParams>({
  method: 'POST',
  path: '/users/:id',
  handler: async (request) => {
    // request.body is typed as CreateUserBody
    // request.params is typed as UserParams
    // request.query is typed as UserQuery

    const { name, email } = request.body;
    const userId = request.params.id;
    const include = request.query.include;

    return { body: { id: userId, name, email } };
  }
});
```

## Health Checks

The plugin automatically provides health check functionality:

```typescript
const health = await app.healthCheck('fastify-http');
console.log(health.healthy); // true/false
```

## License

MIT
