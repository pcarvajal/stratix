---
sidebar_position: 4
title: add Command
description: Add extensions and plugins to your project
---

# add Command

Add official and third-party extensions to your Stratix project.

## Usage

```bash
stratix add <extension> [options]
```

## Interactive Mode

```bash
stratix add
```

Browse and select from available extensions.

## Non-Interactive Mode

```bash
stratix add @stratix/http-fastify
stratix add @stratix/postgres --skip-install
```

## Official Extensions

### HTTP Servers

```bash
# Fastify (Recommended)
stratix add @stratix/http-fastify

# Express
stratix add @stratix/http-express
```

### Databases

```bash
# PostgreSQL
stratix add @stratix/postgres

# MongoDB
stratix add @stratix/mongodb

# Redis
stratix add @stratix/redis
```

### AI Providers

```bash
# OpenAI
stratix add @stratix/ai-openai

# Anthropic (Claude)
stratix add @stratix/ai-anthropic
```

### Message Queues

```bash
# RabbitMQ
stratix add @stratix/rabbitmq

# Kafka
stratix add @stratix/kafka
```

### Utilities

```bash
# Logging
stratix add @stratix/logger

# Validation
stratix add @stratix/validation

# Caching
stratix add @stratix/cache
```

### Testing

```bash
# Testing utilities
stratix add @stratix/testing
```

### Dependency Injection

```bash
# Awilix (Recommended)
stratix add @stratix/di-awilix
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--skip-install` | Don't run package manager install | `false` |
| `--dev` | Install as dev dependency | `false` |
| `--exact` | Install exact version | `false` |

## What Happens

When you add an extension:

1. **Package Installation** - Extension is added to `package.json`
2. **Configuration** - Creates config files if needed
3. **Example Code** - Generates usage examples
4. **Documentation** - Links to extension docs

## Examples

### Add HTTP server

```bash
stratix add @stratix/http-fastify
```

**Creates:**
- `src/infrastructure/http/http.plugin.ts`
- Example route in `src/infrastructure/http/routes/`

### Add database

```bash
stratix add @stratix/postgres
```

**Creates:**
- `src/infrastructure/persistence/postgres.plugin.ts`
- Example repository implementation

### Add AI provider

```bash
stratix add @stratix/ai-openai
```

**Creates:**
- `src/infrastructure/ai/openai.plugin.ts`
- Example agent in `src/domain/agents/`

### Add multiple extensions

```bash
stratix add @stratix/http-fastify @stratix/postgres @stratix/ai-openai
```

## Third-Party Extensions

```bash
stratix add <package-name>
```

The CLI will:
- Install the package
- Detect if it's a Stratix plugin
- Generate basic integration code

## Extension Configuration

After adding an extension, configure it in `src/main.ts`:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { FastifyHTTPPlugin } from '@stratix/http-fastify';
import { PostgresPlugin } from '@stratix/postgres';

const app = await ApplicationBuilder.create()
  .usePlugin(new FastifyHTTPPlugin({ port: 3000 }))
  .usePlugin(new PostgresPlugin({
    host: 'localhost',
    port: 5432,
    database: 'myapp'
  }))
  .build();

await app.start();
```

## Best Practices

### 1. Add Extensions Early

```bash
# Set up infrastructure first
stratix add @stratix/http-fastify
stratix add @stratix/postgres
stratix add @stratix/di-awilix
```

### 2. Use Official Extensions

```bash
# ✅ Official, well-maintained
stratix add @stratix/http-fastify

# ⚠️ Third-party, verify compatibility
stratix add some-random-plugin
```

### 3. Skip Install in CI/CD

```bash
stratix add @stratix/http-fastify --skip-install
```

## Removing Extensions

To remove an extension:

```bash
# Remove package
npm uninstall @stratix/http-fastify

# Remove plugin registration from src/main.ts
# Remove generated files
```

## Next Steps

- **[CLI Overview](./cli-overview)** - All commands
- **[Plugin Architecture](../plugins/plugin-architecture)** - Create plugins
