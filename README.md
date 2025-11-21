<div align="center">
  <img src="public/logo-light.png" alt="Stratix Logo" width="200"/>

# Stratix

**Build scalable, maintainable applications with Domain-Driven Design, hexagonal architecture, and CQRS.**

Production-ready from day one with type safety, dependency injection, AI agents as first-class citizens, and enterprise patterns.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-0.2.x-orange.svg)](https://github.com/pcarvajal/stratix)

[Documentation](https://pcarvajal.github.io/stratix/) | [Getting Started](https://pcarvajal.github.io/stratix)

</div>

> **Pre-release Notice**: Stratix is in active development. The API may change until version 1.0.0.

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

## Documentation

Complete documentation is available at [pcarvajal.github.io/stratix](https://pcarvajal.github.io/stratix/)

## Contributing

Contributions are welcome!

## License

MIT License - see [LICENSE](./LICENSE) file for details.
