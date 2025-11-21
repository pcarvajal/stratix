---
sidebar_position: 3
title: generate Commands
description: Code generation for entities, commands, queries, and more
---

# generate Commands

Generate boilerplate code with the `generate` (or `g`) command.

## Usage

```bash
stratix generate <generator> <name> [options]
stratix g <generator> <name> [options]
```

## Available Generators

| Generator | Description |
|-----------|-------------|
| `entity` | Domain entity |
| `value-object` | Value object |
| `command` | CQRS command |
| `query` | CQRS query |
| `repository` | Repository interface |
| `context` | Bounded context (modular architecture) |
| `quality` | Quality checks (tests, linting) |

## entity Generator

Generate a domain entity:

```bash
stratix generate entity Product
stratix g entity User --path src/domain/entities
```

**Generated files:**
- `product.entity.ts` - Entity class
- `product.entity.spec.ts` - Unit tests

**Example output:**

```typescript
import { Entity, EntityId } from '@stratix/core';

export interface ProductProps {
  name: string;
  price: number;
  stock: number;
}

export class Product extends Entity<ProductProps> {
  private constructor(
    id: EntityId<'Product'>,
    props: ProductProps,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, props, createdAt, updatedAt);
  }

  static create(props: ProductProps): Product {
    return new Product(
      EntityId.create<'Product'>(),
      props,
      new Date(),
      new Date()
    );
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get stock(): number {
    return this.props.stock;
  }
}
```

## value-object Generator

Generate a value object:

```bash
stratix generate value-object Email
stratix g value-object Price --path src/domain/value-objects
```

**Generated files:**
- `email.vo.ts` - Value object class
- `email.vo.spec.ts` - Unit tests

**Example output:**

```typescript
import { ValueObject, Result, Success, Failure } from '@stratix/core';

export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(value: string): Result<Email> {
    if (!value || value.trim().length === 0) {
      return Failure.create('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Failure.create('Invalid email format');
    }

    return Success.create(new Email({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
```

## command Generator

Generate a CQRS command:

```bash
stratix generate command CreateProduct
stratix g command UpdateUser --path src/application/commands
```

**Generated files:**
- `create-product.command.ts` - Command class
- `create-product.handler.ts` - Command handler
- `create-product.handler.spec.ts` - Unit tests

**Example output:**

```typescript
// create-product.command.ts
import { Command } from '@stratix/core';

export class CreateProductCommand implements Command {
  constructor(
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number
  ) {}
}

// create-product.handler.ts
import { CommandHandler, Result, Success } from '@stratix/core';
import { CreateProductCommand } from './create-product.command';
import { Product } from '../../domain/entities/product.entity';

export class CreateProductHandler 
  implements CommandHandler<CreateProductCommand, Product> {
  
  constructor(
    private productRepository: IProductRepository
  ) {}

  async handle(command: CreateProductCommand): Promise<Result<Product>> {
    const product = Product.create({
      name: command.name,
      price: command.price,
      stock: command.stock
    });

    await this.productRepository.save(product);

    return Success.create(product);
  }
}
```

## query Generator

Generate a CQRS query:

```bash
stratix generate query GetProductById
stratix g query GetAllUsers --path src/application/queries
```

**Generated files:**
- `get-product-by-id.query.ts` - Query class
- `get-product-by-id.handler.ts` - Query handler
- `get-product-by-id.handler.spec.ts` - Unit tests

## repository Generator

Generate a repository interface:

```bash
stratix generate repository Product
stratix g repository User --path src/domain/repositories
```

**Generated files:**
- `product.repository.ts` - Repository interface
- `postgres-product.repository.ts` - PostgreSQL implementation

## context Generator

Generate a complete bounded context for modular architecture projects:

```bash
stratix generate context Order
stratix g context Product --props '[{"name":"name","type":"string"},{"name":"price","type":"number"}]'
```

**Generated files:**
- `order/domain/entities/Order.ts` - Entity/Aggregate root
- `order/domain/repositories/OrderRepository.ts` - Repository interface
- `order/infrastructure/repositories/InMemoryOrderRepository.ts` - In-memory implementation
- `order/application/commands/CreateOrder.ts` - Create command
- `order/application/commands/CreateOrderHandler.ts` - Command handler
- `order/application/queries/GetOrderById.ts` - Get by ID query
- `order/application/queries/GetOrderByIdHandler.ts` - Query handler
- `order/application/queries/ListOrders.ts` - List query
- `order/application/queries/ListOrdersHandler.ts` - List handler
- `order/index.ts` - Barrel exports

**Example output structure:**

```
src/contexts/order/
├── domain/
│   ├── entities/
│   │   └── Order.ts
│   └── repositories/
│       └── OrderRepository.ts
├── application/
│   ├── commands/
│   │   ├── CreateOrder.ts
│   │   └── CreateOrderHandler.ts
│   └── queries/
│       ├── GetOrderById.ts
│       ├── GetOrderByIdHandler.ts
│       ├── ListOrders.ts
│       └── ListOrdersHandler.ts
├── infrastructure/
│   └── repositories/
│       └── InMemoryOrderRepository.ts
└── index.ts
```

**With properties:**

```bash
stratix g context Product --props '[
  {"name":"name","type":"string"},
  {"name":"price","type":"number"},
  {"name":"stock","type":"number"}
]'
```

This creates a complete bounded context with the specified properties in the entity. The context generator is ideal for modular monolith projects where you want to keep related functionality together.

**Note:** This generator automatically creates all necessary files and intelligent dependencies. If an entity or repository is missing, it will be created automatically.

## quality Generator

Generate quality checks:

```bash
stratix generate quality
stratix g quality --tests --lint
```

**Generated files:**
- `jest.config.js` - Jest configuration
- `.eslintrc.js` - ESLint rules
- `.prettierrc` - Prettier config

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--path` | Output directory | Auto-detected |
| `--skip-tests` | Skip test file generation | `false` |
| `--dry-run` | Preview without creating files | `false` |

## Examples

### Generate entity with custom path

```bash
stratix g entity Product --path src/modules/catalog/domain
```

### Generate command without tests

```bash
stratix g command CreateProduct --skip-tests
```

### Preview generation

```bash
stratix g entity Product --dry-run
```

## Best Practices

### 1. Use Consistent Naming

```bash
# ✅ Good: PascalCase
stratix g entity Product
stratix g command CreateProduct

# ❌ Bad: inconsistent
stratix g entity product
stratix g command create-product
```

### 2. Organize by Feature

```bash
stratix g entity Product --path src/domain/entities
stratix g command CreateProduct --path src/application/commands
```

### 3. Generate Tests

```bash
# Always generate tests (default)
stratix g entity Product
```

## Next Steps

- **[add Command](./add-command)** - Add extensions
- **[CLI Overview](./cli-overview)** - All commands
- **[Domain Modeling](../core-concepts/domain-modeling)** - Entity patterns
