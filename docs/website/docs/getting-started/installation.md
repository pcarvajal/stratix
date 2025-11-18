# Installation

**Get a production-ready DDD/CQRS application with Enterprise AI Agents in minutes.**

Stratix exists to help development teams build production-ready applications with Domain-Driven Design, CQRS, and AI Agents without sacrificing type safety, testability, or architecture. We're not another LLM wrapper - we treat AI agents as first-class citizens in DDD architecture with proven patterns and production-ready from day one.

## Quick Start (Recommended)

The fastest way to start with Stratix:

### 1. Install CLI Globally

```bash
npm install -g @stratix/cli
```

Or with your preferred package manager:

```bash
# pnpm (recommended - faster, disk-efficient)
pnpm add -g @stratix/cli

# yarn
yarn global add @stratix/cli
```



### 2. Create Your Project

```bash
stratix new my-app
```

The CLI guides you through setup:

```bash
Create Stratix Project

? Project name: my-app
? Package manager: pnpm (recommended)
? Project structure: 
  ❯ DDD (Domain-Driven Design)         - For single context, microservices
    Modular Monolith                   - For multiple contexts, scalability
? Initialize git repository? Yes
```

**What gets created:**
- Complete TypeScript configuration (strict mode)
- Project structure (DDD or Modular)
- Dependency injection configured (Awilix)
- Logger setup (Console)
- CQRS infrastructure (InMemory)
- Git repository initialized
- Dependencies installed automatically

### 3. Start Developing

```bash
cd my-app
npm run dev
```

Your application is running! Now add features:

### 4. Generate Your First Bounded Context

```bash
# Generate complete context: 16 files instantly
stratix g context Products --props "name:string,price:number,stock:number"
```

**Generated files:**
- Entity (AggregateRoot) with type-safe properties
- 3 Commands (Create/Update/Delete) + Handlers
- 2 Queries (GetById/List) + Handlers
- Repository interface + InMemory implementation
- 3 Domain events (Created/Updated/Deleted)
- ContextPlugin with auto-wiring

**That's it!** You now have a complete bounded context ready for production.

**About DDD Implementation:** Stratix generators create full DDD implementations (AggregateRoot, ValueObject, DomainEvent) by default. However, using all DDD patterns is optional. You can adapt to simpler entities or partial implementations. The key requirement is keeping all domain logic in the domain layer for proper separation of concerns.

---

## CLI Commands Reference

### Generate Individual Components

When you need fine-grained control:

```bash
# Entity
stratix g entity Customer --props "name:string,email:string"

# Value Object
stratix g value-object Money --props "amount:number,currency:string"
stratix g vo Email --props "value:string"  # Short alias

# Command
stratix g command CreateOrder --input "customerId:string,total:number"

# Query
stratix g query GetOrderById --input "id:string" --output "Order"
stratix g query ListProducts --output "Product[]"

# Repository
stratix g repository Product
stratix g repo Order  # Short alias

# Event Handler
stratix g event-handler ProductCreated
stratix g eh OrderPlaced --handler SendConfirmationEmail  # Short alias

# Plugin
stratix g plugin EmailService
```

### Add Production Extensions

Install production-ready extensions with automatic dependency resolution:

```bash
# HTTP Framework
stratix add http          # Fastify integration

# Validation
stratix add validation    # Zod schemas

# Authentication & Authorization
stratix add auth          # JWT + RBAC

# Mappers
stratix add mappers       # Entity-to-DTO mapping

# Database Migrations
stratix add migrations    # Version control for DB schemas

# Error Handling
stratix add errors        # Structured error taxonomy

# Databases
stratix add postgres      # PostgreSQL
stratix add mongodb       # MongoDB
stratix add redis         # Redis caching

# Messaging
stratix add rabbitmq      # RabbitMQ event bus

# Observability
stratix add opentelemetry # Traces, metrics, logs

# Secrets
stratix add secrets       # AWS Secrets Manager, etc.

# AI Providers
stratix add ai-openai     # OpenAI GPT models
stratix add ai-anthropic  # Anthropic Claude

# List all available
stratix add list
```

### Project Information

```bash
stratix info
```

Shows:
- Installed Stratix packages
- Package manager
- Project structure
- Node version
- Quick command reference

---

## Choosing Your Structure

### DDD Structure (Default)

**Best for:** Single context, microservices, simple applications

```bash
stratix new my-service --structure ddd
```

**Generated structure:**
```
my-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── repositories/
│   ├── application/
│   │   ├── commands/
│   │   └── queries/
│   └── infrastructure/
│       └── persistence/
├── tsconfig.json
├── package.json
└── stratix.config.ts
```

**Use when:**
- Building focused microservice
- Single bounded context dominates
- Team prefers flat structure

**Domain Layer:** Generators create DDD patterns by default. Use as-is or adapt to simpler implementations. Essential requirement: keep domain logic in this layer.

### Modular Structure

**Best for:** Multiple contexts, modular monolith, scalability

```bash
stratix new my-platform --structure modular
```

**Generated structure:**
```
my-platform/
├── src/
│   ├── contexts/
│   │   ├── products/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── ProductsContextPlugin.ts
│   │   └── orders/
│   │       └── ...
│   └── index.ts
├── tsconfig.json
├── package.json
└── stratix.config.ts
```

**Use when:**
- Multiple bounded contexts (3+)
- Planning microservice extraction
- Team organized by domains

**Key advantage:** Extract to microservices by changing `index.ts`, not rewriting domain code. 

---

## Manual Installation (Advanced)

:::caution Not Recommended
Manual installation requires significant time and deep architectural knowledge. Use `stratix new` instead for production-ready setup in minutes.
:::

If you need full control or are integrating Stratix into existing project:

### 1. Install Core Packages

```bash
# Core framework (required)
npm install @stratix/primitives @stratix/abstractions @stratix/runtime

# Or with pnpm
pnpm add @stratix/primitives @stratix/abstractions @stratix/runtime
```



### 2. Install Implementations (Required)

You need at least one implementation for each abstraction:

```bash
# Dependency Injection (required)
npm install @stratix/impl-di-awilix

# Logger (required)
npm install @stratix/impl-logger-console

# CQRS buses (recommended)
npm install @stratix/impl-cqrs-inmemory
```

### 3. Install Production Extensions (Optional)

Choose based on your needs:

```bash
# Production Extensions (most common)
npm install @stratix/ext-http-fastify       # HTTP server
npm install @stratix/ext-validation-zod     # Validation
npm install @stratix/ext-auth               # JWT + RBAC
npm install @stratix/ext-mappers            # Entity-to-DTO
npm install @stratix/ext-migrations         # DB migrations
npm install @stratix/ext-errors             # Error handling

# Data & Infrastructure
npm install @stratix/ext-postgres           # PostgreSQL
npm install @stratix/ext-mongodb            # MongoDB
npm install @stratix/ext-redis              # Redis
npm install @stratix/ext-rabbitmq           # RabbitMQ
npm install @stratix/ext-opentelemetry      # Observability
npm install @stratix/ext-secrets            # Secrets management

# AI Providers
npm install @stratix/ext-ai-agents-openai      # OpenAI
npm install @stratix/ext-ai-agents-anthropic   # Anthropic
npm install @stratix/impl-ai-agents            # AI Orchestrator
```

### 4. Create Project Structure

```bash
# DDD Structure
mkdir -p src/{domain,application,infrastructure}
mkdir -p src/domain/{entities,value-objects,repositories}
mkdir -p src/application/{commands,queries}
mkdir -p src/infrastructure/{persistence,http}

# Or Modular Structure
mkdir -p src/contexts
```

### 5. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

:::info ESM Required
Stratix is **full ESM**. `module: "NodeNext"` is required.
:::

### 6. Configure package.json

Add to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

:::warning Important
The `"type": "module"` field is **required**. Stratix only supports ESM.
:::

### 7. Install Development Tools

```bash
npm install -D tsx typescript @types/node vitest
```

**Why tsx?**
- Hot reload with `tsx watch` (auto-restart on changes)
- Native ESM support
- Fast TypeScript execution (no build step in dev)

### 8. Create Application Bootstrap

Create `src/index.ts`:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger, LogLevel } from '@stratix/impl-logger-console';

async function bootstrap() {
  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();
  logger.info('Application started');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await app.stop();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
```

### 9. Create Stratix Configuration (Optional)

Create `stratix.config.ts` to customize CLI generators:

```typescript
import { defineConfig } from '@stratix/cli';

export default defineConfig({
  structure: {
    type: 'ddd',
    sourceRoot: 'src',
    domainPath: 'src/domain',
    applicationPath: 'src/application',
    infrastructurePath: 'src/infrastructure',
  },
  generators: {
    context: {
      path: 'src/contexts',
      withTests: false,
    },
    entity: {
      path: 'src/domain/entities',
      aggregate: true,
      withTests: false,
    },
    valueObject: {
      path: 'src/domain/value-objects',
      withValidation: false,
      withTests: false,
    },
    command: {
      path: 'src/application/commands',
      withHandler: true,
      withTests: false,
    },
    query: {
      path: 'src/application/queries',
      withHandler: true,
      withTests: false,
    },
  },
});
```

### 10. Testing Setup (Optional)

For testing, create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

Install testing utilities:

```bash
npm install -D @stratix/testing vitest
```

---

## Verification

### Build Your Project

```bash
npm run build
```

**What this does:**
- Compiles TypeScript to JavaScript
- Generates type declarations
- Validates configuration
- Ensures all dependencies installed correctly

### Run Development Server

```bash
npm run dev
```

**Expected output:**
```
Application started
```

### Type Check

```bash
npm run typecheck
```

Validates TypeScript without building.

---

## Package Reference

All packages should use **same version** for compatibility:

| Package | Purpose |
|---------|---------|
| `@stratix/primitives` | Core classes (Entity, AggregateRoot, ValueObject) |
| `@stratix/abstractions` | Interfaces (zero runtime code) |
| `@stratix/runtime` | ApplicationBuilder, Plugin system |
| `@stratix/impl-di-awilix` | Dependency injection |
| `@stratix/impl-logger-console` | Console logger |
| `@stratix/impl-cqrs-inmemory` | In-memory CQRS buses |
| `@stratix/cli` | Code generators |
| `@stratix/testing` | Testing utilities |

**Production extensions:** All use the same version

---

## Troubleshooting

### ESM Issues

**Error:** `ERR_REQUIRE_ESM`

**Solution:** Add `"type": "module"` to `package.json` and use `import` not `require`.

### Module Resolution

**Error:** Cannot find module '@stratix/...'

**Solution:** 
1. Check TypeScript config: `"module": "NodeNext"`
2. Use `.js` extensions in imports: `import { ... } from './file.js'`
3. Ensure all packages installed: `npm install`

### Build Failures

**Error:** Type errors during build

**Solution:**
1. Delete `node_modules` and reinstall
2. Ensure all `@stratix/*` packages same version
3. Run `npm run typecheck` for detailed errors

### CLI Not Found

**Error:** `stratix: command not found`

**Solution:**
```bash
# Reinstall CLI globally
npm install -g @stratix/cli

# Or use npx
npx @stratix/cli new my-app
```

---

## Common Installation Patterns

### Pattern 1: Full Production Stack (Recommended)

Complete stack for production applications:

```bash
stratix new my-app --structure modular --pm pnpm
cd my-app

# Add all production extensions
stratix add http validation auth mappers migrations errors

# Add database
stratix add postgres

# Add caching
stratix add redis

# Generate contexts
stratix g context Products --props "name:string,price:number,stock:number"
stratix g context Orders --props "customerId:string,total:number,status:string"

# Start developing
pnpm run dev
```

**Result:** Production-ready modular monolith with full extension suite.

### Pattern 2: Microservice (Minimal)

Single-purpose microservice:

```bash
stratix new orders-service --structure ddd --pm pnpm
cd orders-service

# Add only what's needed
stratix add http postgres

# Generate domain
stratix g entity Order --props "customerId:string,total:number,status:string"
stratix g command CreateOrder --input "customerId:string,items:OrderItem[]"
stratix g query GetOrderById --input "id:string" --output "Order"

pnpm run dev
```

**Result:** Focused microservice with minimal dependencies.

### Pattern 3: AI-Powered Application

Application with AI agents:

```bash
stratix new ai-support --structure modular --pm pnpm
cd ai-support

# Production extensions
stratix add http auth validation

# AI providers
stratix add ai-openai

# Optional: Add Anthropic as fallback
stratix add ai-anthropic

# Generate domain contexts
stratix g context Customers --props "email:string,name:string,tier:string"
stratix g context Tickets --props "customerId:string,subject:string,status:string"

pnpm run dev
```

**Result:** AI-powered application with multi-LLM support.

### Pattern 4: Event-Driven System

Microservices communicating via events:

```bash
# Service 1: Products
stratix new products-service --structure ddd --pm pnpm
cd products-service
stratix add http rabbitmq postgres
stratix g context Products --props "name:string,price:number,stock:number"

# Service 2: Orders (separate terminal/repo)
stratix new orders-service --structure ddd --pm pnpm
cd orders-service
stratix add http rabbitmq postgres
stratix g context Orders --props "customerId:string,total:number,status:string"
```

**Result:** Multiple services with event-driven communication.

---

## Upgrade Guide

### Upgrading Stratix Packages

When new version released:

```bash
# Update CLI globally
npm update -g @stratix/cli

# In your project, update all packages
npm update @stratix/primitives @stratix/abstractions @stratix/runtime
npm update @stratix/impl-*
npm update @stratix/ext-*
```

**Or with pnpm:**
```bash
pnpm update -g @stratix/cli
pnpm update "@stratix/*" --latest
```

:::warning Version Compatibility
All `@stratix/*` packages should use **same version**. Mixing versions may cause issues.
:::

### Checking Current Versions

```bash
# In your project
stratix info

# Or manually
npm list @stratix/primitives @stratix/runtime
```

---

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:

1. **TypeScript and JavaScript Language Features** (built-in)
2. **ESLint** - For linting
3. **Prettier** - For formatting
4. **Error Lens** - Show errors inline

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### WebStorm/IntelliJ IDEA

1. Enable TypeScript service
2. Set Node.js interpreter
3. Enable ESLint and Prettier
4. Mark `src` as source root

---

## Environment Configuration

### Development Environment

Create `.env.development`:

```bash
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000

# Database (if using postgres)
DATABASE_URL=postgresql://localhost:5432/myapp_dev

# Redis (if using redis)
REDIS_URL=redis://localhost:6379

# RabbitMQ (if using rabbitmq)
RABBITMQ_URL=amqp://localhost:5672

# AI Providers (if using AI agents)
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

### Production Environment

Create `.env.production`:

```bash
NODE_ENV=production
LOG_LEVEL=info
PORT=8080

DATABASE_URL=postgresql://prod-db:5432/myapp
REDIS_URL=redis://prod-redis:6379
RABBITMQ_URL=amqp://prod-rabbitmq:5672

OPENAI_API_KEY=${SECRET_OPENAI_KEY}
ANTHROPIC_API_KEY=${SECRET_ANTHROPIC_KEY}
```

:::tip Use Secrets Management
For production, use `@stratix/ext-secrets` for AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault integration.
:::

---

## Next Steps

### Quick Path
Start building immediately:
```bash
stratix new my-app
cd my-app
stratix g context Products --props "name:string,price:number"
npm run dev
```

### Guided Path
Follow step-by-step tutorial:

[Quick Start Tutorial →](./quick-start.md)

### Deep Dive
Learn architecture and patterns:

[Core Concepts →](../core-concepts/architecture.md)

### Reference
Explore all CLI commands:

[CLI Reference →](../cli/overview.md)

---

**Need help?**
- [Documentation](https://stratix.dev/docs)
- [GitHub Discussions](https://github.com/pcarvajal/stratix/discussions)
- [Report Issues](https://github.com/pcarvajal/stratix/issues)
- [Star on GitHub](https://github.com/pcarvajal/stratix)
