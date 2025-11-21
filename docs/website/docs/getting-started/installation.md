---
sidebar_position: 2
title: Installation
description: Install Stratix CLI and create your first project
---

# Installation

This guide will help you install Stratix and create your first project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm**, **pnpm**, or **yarn** package manager

```bash
# Check your Node.js version
node --version

# Should output v18.0.0 or higher
```

## Install the CLI

Stratix provides a global CLI tool for creating projects and generating code.

### Using npm

```bash
npm install -g @stratix/cli
```

### Using pnpm

```bash
pnpm add -g @stratix/cli
```

### Using yarn

```bash
yarn global add @stratix/cli
```

### Verify Installation

```bash
stratix --version

# Should output: @stratix/cli/0.3.0 (or later)
```

## Create Your First Project

### Interactive Mode (Recommended)

The easiest way to create a new project is using interactive mode:

```bash
stratix new
```

You'll be prompted for:
- **Project name** - Name of your project directory
- **Package manager** - npm, pnpm, or yarn
- **Project structure** - DDD or Modular
- **Git initialization** - Whether to initialize a git repository
- **Install dependencies** - Whether to install dependencies automatically

### Non-Interactive Mode

You can also create a project with command-line options:

```bash
stratix new my-app --pm pnpm --structure ddd
```

**Options:**
- `--pm <manager>` - Package manager (npm, pnpm, yarn)
- `--structure <type>` - Project structure (ddd, modular)
- `--no-git` - Skip git initialization
- `--skip-install` - Skip dependency installation

### Examples

```bash
# Create with pnpm and DDD structure
stratix new my-ecommerce --pm pnpm --structure ddd

# Create without git and skip install
stratix new my-api --no-git --skip-install

# Create with modular structure
stratix new my-service --structure modular
```

## Project Structure

After creation, your project will have this structure:

```
my-app/
├── src/
│   ├── domain/              # Domain layer (entities, value objects)
│   ├── application/         # Application layer (use cases, CQRS)
│   └── infrastructure/      # Infrastructure layer (plugins, adapters)
├── tests/                   # Test files
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

Learn more about [Project Structure](./project-structure).

## Install Extensions

Stratix provides 14 official extensions for common functionality:

```bash
cd my-app

# Install HTTP server
stratix add http

# Install database
stratix add postgres

# Install AI provider
stratix add ai-openai

# Install validation
stratix add validation

# List all available extensions
stratix add list
```

**Note:** The `stratix add` command uses simplified names for official Stratix extensions. External dependencies (like `pg`, `redis`, etc.) are automatically installed from the public npm registry.

**Available Extensions:**

### Production Extensions
- `http` - Fastify HTTP server
- `validation` - Zod schema validation
- `mappers` - Entity-to-DTO mapping
- `auth` - JWT authentication & RBAC
- `errors` - Structured error handling

### Database & Infrastructure
- `postgres` - PostgreSQL integration
- `mongodb` - MongoDB integration
- `redis` - Redis caching
- `rabbitmq` - RabbitMQ messaging
- `opentelemetry` - Observability
- `secrets` - Secrets management

### AI Providers
- `ai-openai` - OpenAI LLM provider
- `ai-anthropic` - Anthropic Claude provider

## Build and Run

### Install Dependencies

If you skipped installation during project creation:

```bash
cd my-app
npm install
# or
pnpm install
# or
yarn install
```

### Build the Project

```bash
npm run build
# or
pnpm build
# or
yarn build
```

### Run in Development Mode

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

### Run in Production Mode

```bash
npm start
# or
pnpm start
# or
yarn start
```

## Verify Your Installation

Create a simple entity to verify everything works:

```bash
# Generate an entity
stratix generate entity Product --props '[{"name":"id","type":"string"},{"name":"name","type":"string"},{"name":"price","type":"number"}]'

# Build the project
npm run build

# If it builds successfully, you're all set! 🎉
```

## IDE Setup

### VS Code (Recommended)

Install these extensions for the best experience:

- **ESLint** - Linting support
- **Prettier** - Code formatting
- **TypeScript and JavaScript Language Features** - Built-in

### WebStorm / IntelliJ IDEA

WebStorm has built-in support for TypeScript, ESLint, and Prettier.

## Troubleshooting

### Node.js Version Issues

If you encounter errors about Node.js version:

```bash
# Check your version
node --version

# Upgrade Node.js if needed
# Using nvm:
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### Permission Errors (npm global install)

If you get permission errors installing globally with npm:

```bash
# Option 1: Use npx (no global install needed)
npx @stratix/cli new my-app

# Option 2: Fix npm permissions
# See: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

### Package Manager Not Found

Ensure your chosen package manager is installed:

```bash
# Install pnpm
npm install -g pnpm

# Install yarn
npm install -g yarn
```

### CLI Version Mismatch

If you see version-related errors or unexpected behavior:

```bash
# Check CLI version
stratix --version

# Update to latest
npm update -g @stratix/cli
# or
pnpm update -g @stratix/cli
# or
yarn global upgrade @stratix/cli
```

## Next Steps

Now that you have Stratix installed:

1. **[Quick Start](./quick-start)** - Build your first application in 5 minutes
2. **[Project Structure](./project-structure)** - Understand the project organization
3. **[Core Concepts](../core-concepts/architecture-overview)** - Learn the fundamental concepts
4. **[CLI Reference](../cli/cli-overview)** - Explore all CLI commands

## Getting Help

If you encounter issues:

- Check the [GitHub Issues](https://github.com/pcarvajal/stratix/issues)
- Ask in [GitHub Discussions](https://github.com/pcarvajal/stratix/discussions)
