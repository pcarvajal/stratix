---
sidebar_position: 1
title: CLI Overview
description: Stratix CLI for project scaffolding and code generation
---

# CLI Overview

The Stratix CLI (`@stratix/cli`) is a powerful command-line tool for creating projects, generating code, and managing extensions.

## Installation

```bash
# Global installation
npm install -g @stratix/cli

# Or use with npx
npx @stratix/cli new my-app
```

## Available Commands

| Command | Description |
|---------|-------------|
| `new` | Create a new Stratix project |
| `generate` (or `g`) | Generate code (entities, commands, queries, etc.) |
| `add` | Add extensions to your project |
| `info` | Display project information |

## Quick Start

```bash
# Create a new project
stratix new my-app

# Navigate to project
cd my-app

# Generate an entity
stratix generate entity Product

# Add an extension
stratix add @stratix/http-fastify

# Display project info
stratix info
```

## Command Structure

```bash
stratix <command> [options] [arguments]
```

### Global Options

```bash
--help, -h      Show help
--version, -v   Show version
--verbose       Enable verbose output
--quiet         Suppress output
```

## Interactive Mode

Most commands support interactive mode when arguments are omitted:

```bash
# Interactive project creation
stratix new

# Interactive code generation
stratix generate

# Interactive extension installation
stratix add
```

## Non-Interactive Mode

Provide all arguments for CI/CD pipelines:

```bash
stratix new my-app --template ddd --skip-install
stratix generate entity Product --path src/domain/entities
stratix add @stratix/http-fastify --skip-install
```

## Project Templates

The CLI supports multiple project templates:

- **DDD** (Default) - Domain-Driven Design structure
- **Modular** - Bounded contexts for microservices
- **Minimal** - Bare-bones setup

```bash
stratix new my-app --template modular
```

## Code Generators

Generate boilerplate code:

- **Entity** - Domain entities
- **Value Object** - Value objects
- **Command** - CQRS commands
- **Query** - CQRS queries
- **Repository** - Repository interfaces
- **Quality** - Quality checks (tests, linting)

```bash
stratix generate entity User
stratix generate command CreateUser
stratix generate query GetUserById
```

## Extension Management

Add official and third-party extensions:

```bash
# HTTP server
stratix add @stratix/http-fastify

# Database
stratix add @stratix/postgres

# AI providers
stratix add @stratix/ai-openai
stratix add @stratix/ai-anthropic
```

## Configuration

The CLI reads configuration from:

1. **Command-line flags** (highest priority)
2. **stratix.config.js** in project root
3. **package.json** `stratix` field
4. **Default values** (lowest priority)

### stratix.config.js

```javascript
module.exports = {
  template: 'ddd',
  generators: {
    entity: {
      path: 'src/domain/entities',
      suffix: '.entity.ts'
    },
    command: {
      path: 'src/application/commands',
      suffix: '.command.ts'
    }
  }
};
```

## Best Practices

### 1. Use Interactive Mode for Learning

```bash
stratix new  # Learn available options
```

### 2. Use Non-Interactive for Automation

```bash
stratix new my-app --template ddd --skip-install
```

### 3. Customize Generators

```javascript
// stratix.config.js
module.exports = {
  generators: {
    entity: {
      path: 'src/domain',
      template: 'custom-entity.hbs'
    }
  }
};
```

### 4. Version Lock in CI/CD

```bash
npx @stratix/cli@0.1.3 new my-app
```

## Next Steps

- **[new Command](./new-command)** - Create projects
- **[generate Commands](./generate-commands)** - Code generation
- **[add Command](./add-command)** - Extension management
- **[info Command](./info-command)** - Project information
