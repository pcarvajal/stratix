---
sidebar_position: 3
title: Quick Start
description: Build your first Stratix application in 5 minutes
---

# Quick Start

Build a complete CRUD API with Stratix in just 5 minutes. This tutorial will guide you through creating a simple product management system.

## What You'll Build

A REST API for managing products with:
- ✅ Domain entities and value objects
- ✅ CQRS commands and queries
- ✅ HTTP endpoints
- ✅ In-memory repository
- ✅ Type-safe error handling

## Step 1: Create a New Project

```bash
# Create a new project
stratix new product-api --pm pnpm --structure ddd

# Navigate to the project
cd product-api
```

## Step 2: Add HTTP Extension

```bash
# Install the Fastify HTTP plugin
stratix add http
```

This installs `@stratix/http-fastify` and its dependencies.

## Step 3: Generate Domain Entity

```bash
# Generate a Product entity
stratix generate entity Product --props '[
  {"name":"id","type":"string"},
  {"name":"name","type":"string"},
  {"name":"price","type":"number"},
  {"name":"stock","type":"number"}
]'
```

This creates:
- `src/domain/entities/Product.ts` - The Product entity
- Type-safe entity with validation

## Step 4: Generate Repository

```bash
# Generate repository for Product
stratix generate repository Product
```

This creates:
- `src/domain/repositories/IProductRepository.ts` - Repository interface
- `src/infrastructure/repositories/InMemoryProductRepository.ts` - In-memory implementation

## Step 5: Generate Commands

```bash
# Create Product command
stratix generate command CreateProduct --props '[
  {"name":"name","type":"string"},
  {"name":"price","type":"number"},
  {"name":"stock","type":"number"}
]'

# Update Product command
stratix generate command UpdateProduct --props '[
  {"name":"id","type":"string"},
  {"name":"name","type":"string"},
  {"name":"price","type":"number"},
  {"name":"stock","type":"number"}
]'

# Delete Product command
stratix generate command DeleteProduct --props '[
  {"name":"id","type":"string"}
]'
```

This creates commands and their handlers in:
- `src/application/commands/` - Command definitions
- `src/application/handlers/` - Command handlers

## Step 6: Generate Queries

```bash
# Get Product by ID query
stratix generate query GetProductById --props '[
  {"name":"id","type":"string"}
]' --return-type "Product"

# List all Products query
stratix generate query ListProducts --return-type "Product[]"
```

This creates queries and their handlers.

## Step 7: Create HTTP Routes

Create `src/infrastructure/http/ProductRoutes.ts`:

```typescript
import { FastifyHTTPPlugin, HttpErrorImpl } from '@stratix/http-fastify';
import { CommandBus, QueryBus } from '@stratix/core';
import { CreateProductCommand } from '../../application/commands/CreateProduct';
import { GetProductByIdQuery } from '../../application/queries/GetProductById';
import { ListProductsQuery } from '../../application/queries/ListProducts';

export function registerProductRoutes(
  http: FastifyHTTPPlugin,
  commandBus: CommandBus,
  queryBus: QueryBus
) {
  // Create product
  http.post('/products', async (request) => {
    const { name, price, stock } = request.body;
    
    const result = await commandBus.dispatch(
      new CreateProductCommand(name, price, stock)
    );
    
    if (result.isFailure) {
      throw HttpErrorImpl.badRequest(result.error.message);
    }
    
    return { statusCode: 201, body: result.value };
  });

  // Get product by ID
  http.get('/products/:id', async (request) => {
    const { id } = request.params;
    
    const result = await queryBus.execute(
      new GetProductByIdQuery(id)
    );
    
    if (result.isFailure) {
      throw HttpErrorImpl.notFound('Product not found');
    }
    
    return { body: result.value };
  });

  // List all products
  http.get('/products', async (request) => {
    const result = await queryBus.execute(new ListProductsQuery());
    
    if (result.isFailure) {
      throw HttpErrorImpl.internalServerError(result.error.message);
    }
    
    return { body: result.value };
  });
}
```

## Step 8: Configure the Application

Update `src/index.ts`:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/di-awilix';
import { ConsoleLogger } from '@stratix/core';
import { FastifyHTTPPlugin } from '@stratix/http-fastify';
import { InMemoryCommandBus, InMemoryQueryBus } from '@stratix/core';
import { registerProductRoutes } from './infrastructure/http/ProductRoutes';

async function bootstrap() {
  // Create buses
  const commandBus = new InMemoryCommandBus();
  const queryBus = new InMemoryQueryBus();
  
  // Create HTTP plugin
  const httpPlugin = new FastifyHTTPPlugin({ port: 3000 });
  
  // Register routes
  registerProductRoutes(httpPlugin, commandBus, queryBus);
  
  // Build application
  const app = await ApplicationBuilder.create()
    .useContainer(new AwilixContainer())
    .useLogger(new ConsoleLogger())
    .usePlugin(httpPlugin)
    .build();
  
  // Start application
  await app.start();
  
  console.log('🚀 Server running on http://localhost:3000');
}

bootstrap().catch(console.error);
```

## Step 9: Build and Run

```bash
# Build the project
pnpm build

# Run the server
pnpm start
```

You should see:
```
🚀 Server running on http://localhost:3000
```

## Step 10: Test Your API

### Create a Product

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "stock": 10
  }'
```

### Get All Products

```bash
curl http://localhost:3000/products
```

### Get Product by ID

```bash
curl http://localhost:3000/products/{id}
```

## What You've Learned

Congratulations! 🎉 You've just built a complete CRUD API with:

- ✅ **Domain-Driven Design** - Entities and repositories
- ✅ **CQRS Pattern** - Commands and queries with handlers
- ✅ **HTTP Server** - Fastify integration
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Result Pattern** - Explicit error handling
- ✅ **Clean Architecture** - Separation of concerns

## Next Steps

Now that you've built your first application, explore:

1. **[Project Structure](./project-structure)** - Understand the project organization
2. **[Core Concepts](../core-concepts/architecture-overview)** - Learn DDD and hexagonal architecture
3. **[Core Concepts](../core-concepts/architecture-overview)** - Understand Stratix architecture
4. **[AI Agents](../ai-agents/ai-agents-overview)** - Build AI-powered features
5. **[AI Agents](../ai-agents/ai-agents-overview)** - Add AI capabilities to your app

## Add More Features

### Add Validation

```bash
stratix add validation
```

Then add Zod schemas to validate requests.

### Add Database

```bash
stratix add postgres
```

Replace the in-memory repository with PostgreSQL.

### Add AI Agent

```bash
stratix add ai-openai
```

Create an AI agent for product recommendations.

### Add Authentication

```bash
stratix add auth
```

Protect your endpoints with JWT authentication.

## Full Example

The complete code for this tutorial is available in the [examples directory](https://github.com/pcarvajal/stratix/tree/main/examples/quick-start).

## Getting Help

- **Documentation**: [Full documentation](../core-concepts/architecture-overview)
- **Examples**: [More examples](https://github.com/pcarvajal/stratix/tree/main/examples)
- **Community**: [GitHub Discussions](https://github.com/pcarvajal/stratix/discussions)
