# Installation

Get started with Stratix in seconds.

## Using Stratix CLI (Recommended)

The fastest way to create a new Stratix application:

### Install CLI Globally

```bash
npm install -g @stratix/cli
```

Or with your preferred package manager:

```bash
# pnpm (recommended)
pnpm add -g @stratix/cli

# yarn
yarn global add @stratix/cli
```

### Create New Project

```bash
stratix new my-app
```

This will:
1. Create a new directory with your project name
2. Set up the project structure (DDD or Modular)
3. Generate configuration files
4. Optionally initialize a git repository
5. Optionally install dependencies

### Interactive Setup

The CLI will ask you a few questions:

```bash
🚀 Create Stratix Project

? Project name: my-app
? Package manager: pnpm
? Project structure: DDD (Domain-Driven Design)
? Initialize git repository? Yes
? Install dependencies? Yes
```

### Start Development

Once created, navigate to your project:

```bash
cd my-app
pnpm run dev
```

### Generate Code

Use the CLI to generate code artifacts:

```bash
# Generate a complete bounded context (16 files)
stratix generate context Products --props "name:string,price:number,stock:number"

# Generate individual components
stratix g entity Customer --props "name:string,email:string"
stratix g value-object Money --props "amount:number,currency:string"
stratix g command CreateOrder --input "customerId:string,total:number"
stratix g query GetOrderById --input "id:string" --output "Order"
```

Your Stratix application is now running! 

## Manual Installation

If you prefer to set up manually, you can install the core packages:

```bash
pnpm add @stratix/primitives @stratix/abstractions @stratix/runtime
```

### Add Implementations

You'll need at least one implementation for each abstraction:

```bash
# Dependency Injection
pnpm add @stratix/impl-di-awilix

# Logger
pnpm add @stratix/impl-logger-console

# CQRS (optional but recommended)
pnpm add @stratix/impl-cqrs-inmemory
```

### Add Extensions (Optional)

Install extensions based on your needs:

```bash
# Database
pnpm add @stratix/ext-postgres
# or
pnpm add @stratix/ext-mongodb

# Caching
pnpm add @stratix/ext-redis

# Message Queue
pnpm add @stratix/ext-rabbitmq

# Observability
pnpm add @stratix/ext-opentelemetry

# Secrets Management
pnpm add @stratix/ext-secrets
```

### Create Project Structure

Create the recommended folder structure:

```bash
mkdir -p src/{domain,application,infrastructure}
mkdir -p src/domain/{entities,value-objects,repositories}
mkdir -p src/application/{commands,queries}
mkdir -p src/infrastructure/{persistence,http}
```

### Basic Setup

Create `src/index.ts`:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

async function bootstrap() {
  const container = new AwilixContainer();
  const logger = new ConsoleLogger();

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();

  console.log('Application started!');
}

bootstrap().catch(console.error);
```

### Configure package.json

Add the following to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  }
}
```

**Important**: The `"type": "module"` field is required as Stratix is a full ESM framework.

### Install Development Tools

```bash
pnpm add -D tsx typescript @types/node
```

**tsx** is the recommended tool for development because it provides:
- Hot reload with `tsx watch` - automatically restarts when files change
- Native ESM support - works seamlessly with Stratix
- Fast TypeScript execution - no build step needed during development

## Testing Utilities

For testing, install:

```bash
pnpm add -D @stratix/testing vitest
```

## TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Verification

Verify your installation by running the build:

```bash
pnpm build
```

This will:
- Compile your TypeScript code
- Check for configuration issues
- Ensure all dependencies are properly installed

## Next Steps

Now that you have Stratix installed, let's create your first entity:

👉 [Quick Start](./quick-start.md)
