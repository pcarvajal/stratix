<div align="center">
  <img src="public/logo-no-bg.png" alt="Stratix Logo" width="200"/>

# Stratix

**Build scalable, maintainable applications with Domain-Driven Design, hexagonal architecture, and CQRS.**

Production-ready from day one with type safety, dependency injection, AI agents as first-class citizens, and enterprise patterns.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-0.4.0-orange.svg)](https://github.com/stratix-dev/stratix)

[Documentation](https://stratix-dev.github.io/stratix/) | [Getting Started](https://stratix-dev.github.io/stratix)

</div>

> **Pre-release Notice**: Stratix is in active development. The API may change until version 1.0.0.

## What's New in 0.4.0

- **Repository Migration**: Now available at `github.com/stratix-dev/stratix`
- **Enhanced Documentation**: Updated theme with official brand colors for better readability
- **Stratix Copilot**: Improved documentation with accurate workflow descriptions

See the [CHANGELOG](./CHANGELOG.md) for complete release notes.

## Features

- **Plugin Architecture** - Extensible plugin system with lifecycle management and health checks
- **Bounded Contexts** - Portable domain modules that work in monoliths or microservices
- **Domain Modeling** - Entity, AggregateRoot, ValueObject, and Repository patterns built-in
- **Result Pattern** - Explicit error handling without exceptions
- **CQRS** - Command and Query Responsibility Segregation with dedicated buses
- **AI Agents** - AI agents as first-class domain entities with production patterns
- **Type Safety** - Full TypeScript strict mode with phantom types
- **Production Extensions** - HTTP, validation, authentication, error handling
- **Code Generation** - CLI for scaffolding projects, contexts, entities, commands, and queries

## Quick Start

```bash
# Install CLI
npm install -g @stratix/cli

# Create project
stratix new my-app

# Generate bounded context
cd my-app
stratix generate context Products --props "name:string,price:number,stock:number"

# Start developing
npm run dev
```

**What you get:**

- Complete TypeScript project with strict mode
- ESLint and Prettier configured
- Domain, Application, and Infrastructure layers
- CQRS commands and queries with handlers
- Repository pattern with in-memory implementation
- Type-safe entity IDs and Result pattern
- Production-ready project structure

## Available Packages

### Core Packages
- [**@stratix/core**](https://www.npmjs.com/package/@stratix/core) - Domain primitives, abstractions, and default implementations (zero dependencies)
- [**@stratix/runtime**](https://www.npmjs.com/package/@stratix/runtime) - Application builder, plugin registry, and lifecycle management

### Database Plugins
- [**@stratix/db-postgres**](https://www.npmjs.com/package/@stratix/db-postgres) - PostgreSQL integration with repository patterns
- [**@stratix/db-mongodb**](https://www.npmjs.com/package/@stratix/db-mongodb) - MongoDB integration with aggregations and pagination
- [**@stratix/db-redis**](https://www.npmjs.com/package/@stratix/db-redis) - Redis caching, rate limiting, and distributed locks

### AI Plugins
- [**@stratix/ai-openai**](https://www.npmjs.com/package/@stratix/ai-openai) - OpenAI LLM provider for AI agents
- [**@stratix/ai-anthropic**](https://www.npmjs.com/package/@stratix/ai-anthropic) - Anthropic Claude provider for AI agents

### Infrastructure Plugins
- [**@stratix/http-fastify**](https://www.npmjs.com/package/@stratix/http-fastify) - Fastify HTTP server integration
- [**@stratix/msg-rabbitmq**](https://www.npmjs.com/package/@stratix/msg-rabbitmq) - RabbitMQ message broker with RPC and priority queues
- [**@stratix/di-awilix**](https://www.npmjs.com/package/@stratix/di-awilix) - Awilix dependency injection container
- [**@stratix/obs-opentelemetry**](https://www.npmjs.com/package/@stratix/obs-opentelemetry) - OpenTelemetry observability integration

### Utility Plugins
- [**@stratix/auth**](https://www.npmjs.com/package/@stratix/auth) - JWT authentication and RBAC authorization
- [**@stratix/validation-zod**](https://www.npmjs.com/package/@stratix/validation-zod) - Zod-based schema validation
- [**@stratix/mappers**](https://www.npmjs.com/package/@stratix/mappers) - Entity-to-DTO mapping utilities
- [**@stratix/errors**](https://www.npmjs.com/package/@stratix/errors) - Structured error handling
- [**@stratix/secrets**](https://www.npmjs.com/package/@stratix/secrets) - Secrets management

### Development Tools
- [**@stratix/cli**](https://www.npmjs.com/package/@stratix/cli) - Code generation and project scaffolding
- [**@stratix/testing**](https://www.npmjs.com/package/@stratix/testing) - Testing utilities and mocks

### VS Code Extension
- [**stratix-copilot-rag**](https://marketplace.visualstudio.com/items?itemName=stratix.stratix-copilot-rag) - GitHub Copilot extension with Stratix framework knowledge

## Documentation

Complete documentation is available at [stratix-dev.github.io/stratix](https://stratix-dev.github.io/stratix/)

## Contributing

Contributions are welcome!

## License

MIT License - see [LICENSE](./LICENSE) file for details.
