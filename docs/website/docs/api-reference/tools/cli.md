# @stratix/cli

Code generation and project scaffolding CLI for Stratix applications.

## Installation

```bash
npm install -g @stratix/cli
```

## Commands

### stratix new

Create a new Stratix project with complete DDD structure.

```bash
stratix new <project-name> [options]
```

**Options:**

- `--pm <manager>` - Package manager: npm, pnpm, yarn (default: npm)
- `--structure <type>` - Project structure: ddd, modular (default: ddd)
- `--no-git` - Skip git initialization
- `--skip-install` - Skip dependency installation

**Examples:**

```bash
# Interactive mode
stratix new my-app

# With options
stratix new my-app --pm pnpm --structure ddd
stratix new my-app --pm npm --no-git --skip-install
```

**Generated Structure:**

```
my-app/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── repositories/
│   ├── application/
│   │   ├── commands/
│   │   └── queries/
│   ├── infrastructure/
│   │   └── persistence/
│   └── index.ts
├── test/
├── stratix.config.ts
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── .gitignore
```

---

### stratix generate context

Generate a complete bounded context with domain, application, and infrastructure layers.

```bash
stratix generate context <name> --props "<properties>"
```

**Alias:** `stratix g context`

**Options:**

- `--props <props>` - Entity properties (required): "name:type,age:number"
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix generate context Products --props "name:string,price:number,stock:number"
stratix g context Orders --props "customerId:string,total:number,status:string"
```

**Generated Files (16 total):**

```
src/contexts/products/
├── domain/
│   ├── entities/Product.ts              # AggregateRoot
│   ├── repositories/ProductRepository.ts # Repository interface
│   └── events/ProductCreated.ts         # Domain event
├── application/
│   ├── commands/
│   │   ├── CreateProduct.ts             # Command
│   │   ├── CreateProductHandler.ts      # Handler
│   │   ├── UpdateProduct.ts
│   │   ├── UpdateProductHandler.ts
│   │   ├── DeleteProduct.ts
│   │   └── DeleteProductHandler.ts
│   └── queries/
│       ├── GetProductById.ts            # Query
│       ├── GetProductByIdHandler.ts     # Handler
│       ├── ListProducts.ts
│       └── ListProductsHandler.ts
├── infrastructure/
│   └── persistence/
│       └── InMemoryProductRepository.ts # Repository impl
├── ProductsContextPlugin.ts             # Auto-wiring plugin
└── index.ts                             # Exports
```

---

### stratix generate entity

Generate a domain entity or aggregate root.

```bash
stratix generate entity <name> [options]
```

**Alias:** `stratix g entity`

**Options:**

- `--props <props>` - Entity properties: "name:type,age:number"
- `--no-aggregate` - Generate as Entity instead of AggregateRoot
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix g entity Product --props "name:string,price:number,stock:number"
stratix g entity Customer --props "name:string,email:string" --no-aggregate
```

**Generated File:**

```typescript
// src/domain/entities/Product.ts
import { AggregateRoot } from '@stratix/core';
import { EntityId } from '@stratix/core';

export class Product extends AggregateRoot<EntityId<'Product'>> {
  private constructor(
    id: EntityId<'Product'>,
    private _name: string,
    private _price: number,
    private _stock: number,
  ) {
    super(id);
  }

  static create(props: {
    name: string;
    price: number;
    stock: number;
  }): Product {
    const id = EntityId.create<'Product'>('Product');
    return new Product(id, props.name, props.price, props.stock);
  }

  get name(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name;
  }

  // ... more getters/setters
}
```

---

### stratix generate value-object

Generate a domain value object.

```bash
stratix generate value-object <name> --props "<properties>"
```

**Alias:** `stratix g vo`

**Options:**

- `--props <props>` - Value object properties (required)
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix g vo Money --props "amount:number,currency:string"
stratix g vo Address --props "street:string,city:string,zipCode:string"
```

**Generated File:**

```typescript
// src/domain/value-objects/Money.ts
import { ValueObject } from '@stratix/core';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  static create(props: {
    amount: number;
    currency: string;
  }): Money {
    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error('Money.currency cannot be empty');
    }
    return new Money(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  equals(other: Money): boolean {
    return this.props.amount === other.props.amount && 
           this.props.currency === other.props.currency;
  }
}
```

---

### stratix generate command

Generate a CQRS command with handler.

```bash
stratix generate command <name> [options]
```

**Alias:** `stratix g command`

**Options:**

- `--input <props>` - Input properties: "userId:string,amount:number"
- `--props <props>` - Alias for --input
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix g command CreateOrder --input "customerId:string,total:number"
stratix g command UpdateStock --props "productId:string,quantity:number"
```

**Generated Files (2):**

```typescript
// src/application/commands/CreateOrder.ts
export interface CreateOrderCommand {
  customerId: string;
  total: number;
}

export class CreateOrder {
  constructor(public readonly data: CreateOrderCommand) {}
}
```

```typescript
// src/application/commands/CreateOrderHandler.ts
import type { CommandHandler } from '@stratix/core';
import { Result } from '@stratix/core';
import { CreateOrder } from './CreateOrder.js';

export class CreateOrderHandler implements CommandHandler<CreateOrder, void> {
  async handle(command: CreateOrder): Promise<Result<void>> {
    try {
      // TODO: Implement command logic
      console.log('Executing CreateOrder:', command.data);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
```

---

### stratix generate query

Generate a CQRS query with handler.

```bash
stratix generate query <name> [options]
```

**Alias:** `stratix g query`

**Options:**

- `--input <props>` - Input properties: "id:string"
- `--output <type>` - Output type: "Product" or "Product[]" (default: "any")
- `--props <props>` - Alias for --input
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix g query GetProductById --input "id:string" --output "Product"
stratix g query ListOrders --output "Order[]"
```

**Generated Files (2):**

```typescript
// src/application/queries/GetProductById.ts
export interface GetProductByIdQuery {
  id: string;
}

export class GetProductById {
  constructor(public readonly data: GetProductByIdQuery) {}
}
```

```typescript
// src/application/queries/GetProductByIdHandler.ts
import type { QueryHandler } from '@stratix/core';
import { Result } from '@stratix/core';
import { GetProductById } from './GetProductById.js';

export class GetProductByIdHandler implements QueryHandler<GetProductById, Product> {
  async handle(query: GetProductById): Promise<Result<Product>> {
    try {
      // TODO: Implement query logic
      console.log('Executing GetProductById:', query.data);
      return Result.ok({} as Product);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
```

---

### stratix generate repository

Generate a repository interface and in-memory implementation.

```bash
stratix generate repository <entityName> [options]
```

**Alias:** `stratix g repository`, `stratix g repo`

**Options:**

- `--no-implementation` - Generate only the interface
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix g repository Product
stratix g repo Order --no-implementation
```

**Generated Files (2 by default):**

```typescript
// src/domain/repositories/ProductRepository.ts
import type { Repository } from '@stratix/core';
import type { Product } from '../entities/Product.js';
import type { ProductId } from '../entities/Product.js';

export interface ProductRepository extends Repository<Product, ProductId> {
  findByName(name: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
}
```

```typescript
// src/infrastructure/persistence/InMemoryProductRepository.ts
import type { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import type { Product } from '../../domain/entities/Product.js';
import type { ProductId } from '../../domain/entities/Product.js';

export class InMemoryProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();

  async save(product: Product): Promise<void> {
    this.products.set(product.id.toString(), product);
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.toString()) ?? null;
  }

  async findByName(name: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.name === name) {
        return product;
      }
    }
    return null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.toString());
  }

  async exists(id: ProductId): Promise<boolean> {
    return this.products.has(id.toString());
  }
}
```

---

### stratix generate event-handler

Generate a domain event handler.

```bash
stratix generate event-handler <eventName> [options]
```

**Alias:** `stratix g event-handler`, `stratix g eh`

**Options:**

- `--handler <name>` - Custom handler name
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix g event-handler ProductCreated
stratix g eh OrderPlaced --handler NotifyCustomerHandler
```

**Generated File:**

```typescript
// src/application/event-handlers/ProductCreatedHandler.ts
import type { DomainEventHandler } from '@stratix/core';
import type { ProductCreated } from '../../domain/events/ProductCreated.js';

export class ProductCreatedHandler implements DomainEventHandler<ProductCreated> {
  constructor() {}

  async handle(event: ProductCreated): Promise<void> {
    console.log(`Handling ${event.eventName} event:`, event.payload);
    
    // TODO: Implement your business logic here
    // Examples:
    // - Send notification
    // - Update read model
    // - Trigger another process
    // - Log analytics
  }

  get eventName(): string {
    return 'ProductCreated';
  }
}
```

---

### stratix generate plugin

Generate a custom plugin for extending Stratix applications.

```bash
stratix generate plugin <name> [options]
```

**Alias:** `stratix g plugin`

**Options:**

- `--no-health-check` - Generate without health check method
- `--dry-run` - Preview files without writing
- `--force` - Overwrite existing files

**Examples:**

```bash
stratix g plugin Payment
stratix g plugin Cache --no-health-check
```

**Generated File:**

```typescript
// src/plugins/PaymentPlugin.ts
import type { Plugin, PluginContext, HealthCheckResult } from '@stratix/core';

export interface PaymentPluginOptions {
  // Add your plugin configuration options here
}

export class PaymentPlugin implements Plugin {
  readonly name = 'payment';
  readonly version = '0.1.0';
  readonly dependencies: string[] = [];

  constructor(private options: PaymentPluginOptions = {}) {}

  async initialize(context: PluginContext): Promise<void> {
    const { container, logger } = context;
    
    logger.info(`Initializing ${this.name} plugin`);

    // TODO: Register services with DI container
    // container.register('myService', () => new MyService(this.options));
  }

  async start(): Promise<void> {
    // TODO: Start plugin services
    // Examples:
    // - Connect to database
    // - Start HTTP server
    // - Subscribe to message queue
  }

  async stop(): Promise<void> {
    // TODO: Stop plugin services and cleanup
    // Examples:
    // - Close database connections
    // - Stop HTTP server
    // - Unsubscribe from message queue
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      // TODO: Implement health check logic
      return {
        healthy: true,
        message: 'Payment is healthy',
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Payment health check failed: ${error}`,
        error,
      };
    }
  }
}
```

---

### stratix add

Install Stratix extensions to your project.

```bash
stratix add <extension> [options]
```

**Options:**

- `--dev` - Install as dev dependency

**Examples:**

```bash
# Production extensions
stratix add http         # Fastify HTTP server
stratix add validation   # Zod validation
stratix add auth         # JWT authentication and RBAC
stratix add mappers      # Entity to DTO mappers
stratix add errors       # Structured error handling
stratix add migrations   # Database migrations

# Data & infrastructure
stratix add postgres     # PostgreSQL integration
stratix add mongodb      # MongoDB integration
stratix add redis        # Redis caching
stratix add rabbitmq     # RabbitMQ messaging

# AI providers
stratix add ai-openai    # OpenAI LLM provider
stratix add ai-anthropic # Anthropic Claude provider

# Observability
stratix add opentelemetry # OpenTelemetry
stratix add secrets       # Secrets management
```

**List Available Extensions:**

```bash
stratix add list
```

Output:

```
Available Stratix Extensions

Production Extensions:
  http            - Fastify HTTP server
  validation      - Zod-based validation
  mappers         - Entity to DTO mapping utilities
  auth            - JWT authentication and RBAC
  migrations      - Database migration system
  errors          - Structured error handling

Data & Infrastructure:
  postgres        - PostgreSQL database integration
  mongodb         - MongoDB database integration
  redis           - Redis caching and session store
  rabbitmq        - RabbitMQ message broker
  opentelemetry   - OpenTelemetry observability
  secrets         - Secrets management

AI Providers:
  ai-openai       - OpenAI LLM provider
  ai-anthropic    - Anthropic Claude provider

Usage: stratix add <extension>
```

---

### stratix info

Display project information including installed Stratix packages.

```bash
stratix info
```

**Example Output:**

```
Project Information

Project:
  Name:    my-ecommerce
  Version: 1.0.0

Environment:
  Package Manager: pnpm
  Project Structure: DDD/Hexagonal
  Node Version: v20.10.0

Stratix Packages:
  @stratix/core@0.1.3
  @stratix/core@0.1.3
  @stratix/runtime@0.1.3
  @stratix/di-awilix@0.1.3
  @stratix/http-fastify@0.1.3
  @stratix/db-postgres@0.1.3

Quick Commands:
  stratix g context <name>    - Generate bounded context
  stratix g entity <name>     - Generate entity
  stratix add <extension>     - Install extension
  stratix add list            - List available extensions
```

---

## Props Format

All generators support a props format for defining properties:

```bash
--props "name:type,age:number,email:string"
```

**Supported Types:**

- `string`
- `number`
- `boolean`
- `Date`
- Any custom type (e.g., `Money`, `UserId`)

**Examples:**

```bash
# Simple types
--props "name:string,age:number,active:boolean"

# Custom types
--props "id:UserId,price:Money,createdAt:Date"

# Multiple properties
--props "firstName:string,lastName:string,email:string,age:number"
```

---

## Common Workflows

### Create New Project

```bash
# 1. Create project
stratix new my-ecommerce --pm pnpm

# 2. Navigate to project
cd my-ecommerce

# 3. Generate bounded contexts
stratix g context Products --props "name:string,price:number,stock:number"
stratix g context Orders --props "customerId:string,total:number"
stratix g context Customers --props "name:string,email:string"

# 4. Install and run
pnpm install
pnpm run dev
```

### Add Features to Existing Project

```bash
# Generate new entity
stratix g entity Category --props "name:string,description:string"

# Generate value objects
stratix g vo Price --props "amount:number,currency:string"
stratix g vo Stock --props "quantity:number,reserved:number"

# Generate commands
stratix g command AddToCart --input "productId:string,quantity:number"
stratix g command Checkout --input "cartId:string,paymentMethod:string"

# Generate queries
stratix g query GetCartById --input "id:string" --output "Cart"
stratix g query ListAvailableProducts --output "Product[]"
```

### Dry Run Mode

Preview generated files before writing:

```bash
stratix g context Products --props "name:string,price:number" --dry-run
```

Output shows what would be created:

```
Would create: src/contexts/products/domain/entities/Product.ts
Would create: src/contexts/products/domain/repositories/ProductRepository.ts
Would create: src/contexts/products/domain/events/ProductCreated.ts
...
```

---

## Code Quality Tools

All projects generated with `stratix new` include pre-configured ESLint and Prettier for code quality and consistency.

### ESLint Configuration

Generated projects include `.eslintrc.json` with TypeScript-optimized rules:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  },
  "ignorePatterns": ["dist", "node_modules"]
}
```

**Usage:**

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Prettier Configuration

Generated projects include `.prettierrc` with framework-standard formatting rules:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Usage:**

```bash
# Format all files
npm run format

# Check formatting (CI)
npm run format -- --check
```

### IDE Integration

Both ESLint and Prettier integrate automatically with:
- **VS Code**: Install ESLint and Prettier extensions
- **WebStorm/IntelliJ**: Enable ESLint and Prettier in settings
- **Vim/Neovim**: Use ALE or CoC plugins

### Pre-commit Hooks (Optional)

Add Husky and lint-staged for automatic formatting:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Configuration

### stratix.config.ts

Generated in project root with `stratix new`:

```typescript
import { defineConfig } from '@stratix/cli';

export default defineConfig({
  projectName: 'my-app',
  structure: 'ddd',
  packageManager: 'pnpm',
});
```

---

## Best Practices

1. **Use Context Generator First**
   - Start with `stratix g context` to create complete bounded contexts
   - Generates 16 files with proper DDD structure
   - Includes CRUD operations out of the box

2. **Consistent Naming**
   - Use PascalCase for entity names: `Product`, `Order`, `Customer`
   - CLI automatically converts to appropriate cases

3. **Props Definition**
   - Define all required properties upfront
   - Use specific types when possible
   - Example: `UserId` instead of `string`

4. **Dry Run First**
   - Use `--dry-run` to preview before generating
   - Verify structure matches expectations

5. **Version Control**
   - Commit after each generation
   - Review generated code before modifications

---

## Troubleshooting

### Generator Not Found

```bash
Error: Command not found: stratix
```

**Solution:** Install CLI globally

```bash
npm install -g @stratix/cli
```

### Props Parse Error

```bash
Error: Invalid props format
```

**Solution:** Check props format

```bash
# Correct
--props "name:string,age:number"

# Incorrect (missing colon)
--props "name string,age number"
```

### File Already Exists

```bash
Skipped: src/domain/entities/Product.ts (already exists)
```

**Solution:** Use `--force` to overwrite

```bash
stratix g entity Product --props "name:string" --force
```

---

## See Also

- [Quick Start Guide](../../getting-started/quick-start.md)
- [Project Structure](../../core-concepts/project-structure.md)
- [Bounded Contexts](../../core-concepts/bounded-contexts.md)
