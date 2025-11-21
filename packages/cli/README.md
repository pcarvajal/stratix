# @stratix/cli

Global CLI for Stratix framework - Create projects and generate code with powerful generators.

## Installation

```bash
npm install -g @stratix/cli
```

## Quick Start

```bash
# Create a new project
stratix new my-app

# Generate a bounded context
cd my-app
stratix generate context Products --props "name:string,price:number,stock:number"
```

## Commands

### `stratix new [project-name]`

Create a new Stratix project with minimal setup.

**Options:**
- `--pm <manager>` - Package manager (npm, pnpm, yarn)
- `--structure <type>` - Project structure (ddd, modular) - default: ddd
- `--no-git` - Skip git initialization
- `--skip-install` - Skip dependency installation

**Examples:**
```bash
# Interactive mode (prompts for options)
stratix new

# With project name
stratix new my-app

# With options
stratix new my-app --pm pnpm --structure ddd
stratix new my-app --no-git --skip-install
```

### `stratix generate <type> <name>`

Alias: `stratix g`

Generate code artifacts using built-in generators.

**Common Options:**
- `--dry-run` - Preview generated files without writing
- `--force` - Overwrite existing files

#### Available Generators

##### `entity <name>` - Domain Entity
Generates a domain entity or aggregate root.

**Options:**
- `--props <props>` - Entity properties as JSON array
- `--aggregate` - Generate as AggregateRoot (default: true)
- `--dry-run` - Preview generated files without writing
- `--force` - Overwrite existing files

**Example:**
```bash
stratix g entity Product --props '[{"name":"id","type":"string"},{"name":"name","type":"string"},{"name":"price","type":"number"}]'
```

##### `value-object <name>` (alias: `vo`)
Generates a domain value object.

**Options:**
- `--props <props>` - Value object properties as JSON array
- `--dry-run` - Preview generated files without writing

**Example:**
```bash
stratix g value-object Email --props '[{"name":"value","type":"string"}]'
stratix g vo Address --props '[{"name":"street","type":"string"},{"name":"city","type":"string"}]'
```

##### `command <name>` - CQRS Command
Generates a command with its handler.

**Options:**
- `--props <props>` - Input properties as JSON array
- `--no-handler` - Skip handler generation
- `--dry-run` - Preview generated files without writing

**Example:**
```bash
stratix g command CreateProduct --props '[{"name":"name","type":"string"},{"name":"price","type":"number"}]'
```

##### `query <name>` - CQRS Query
Generates a query with its handler.

**Options:**
- `--props <props>` - Input properties as JSON array
- `--return-type <type>` - Return type for the query (default: "any")
- `--no-handler` - Skip handler generation
- `--dry-run` - Preview generated files without writing

**Example:**
```bash
stratix g query GetProductById --props '[{"name":"id","type":"string"}]' --return-type "Product"
stratix g query ListProducts --return-type "Product[]"
```

##### `repository <entityName>` (alias: `repo`)
Generates a repository interface and implementation.

**Options:**
- `--no-implementation` - Generate only the interface
- `--dry-run` - Preview generated files without writing

**Example:**
```bash
stratix g repository Product
stratix g repo Order --no-implementation
```

##### `quality` - Quality Configuration
Generates quality configuration files (Prettier, ESLint, EditorConfig, .gitignore).

**Options:**
- `--no-prettier` - Skip Prettier config
- `--no-eslint` - Skip ESLint config
- `--no-editorconfig` - Skip EditorConfig
- `--no-gitignore` - Skip .gitignore
- `--dry-run` - Preview generated files without writing

**Example:**
```bash
stratix g quality
stratix g quality --no-gitignore
```

### `stratix add <extension>`

Install Stratix extensions to your project with automatic dependency resolution.

**Examples:**
```bash
# Install HTTP extension
stratix add http

# Install database extensions
stratix add postgres
stratix add mongodb
stratix add redis

# Install AI providers
stratix add ai-openai
stratix add ai-anthropic

# List all available extensions
stratix add list
```

**Available Extensions (13):**

**Production Extensions:**
- `http` - Fastify HTTP server integration
- `validation` - Zod-based schema validation
- `mappers` - Entity-to-DTO mapping utilities
- `auth` - JWT authentication and RBAC authorization
- `errors` - Structured error handling

**Data & Infrastructure:**
- `postgres` - PostgreSQL database integration
- `mongodb` - MongoDB database integration
- `redis` - Redis caching and session store
- `rabbitmq` - RabbitMQ message broker
- `opentelemetry` - Observability (traces, metrics, logs)
- `secrets` - Secrets management

**AI Providers:**
- `ai-openai` - OpenAI LLM provider
- `ai-anthropic` - Anthropic Claude provider

**Note:** The command automatically detects your package manager (npm/pnpm/yarn) and installs the extension with its peer dependencies.

### `stratix info`

Display project information including installed Stratix packages, environment details, and quick reference commands.

**Example output:**
```
Project Information

Project:
  Name:    my-app
  Version: 0.1.0

Environment:
  Package Manager: pnpm
  Project Structure: DDD/Hexagonal
  Node Version: v20.10.0

Stratix Packages:
  @stratix/core@0.1.3
  @stratix/runtime@0.1.3
  @stratix/http-fastify@0.1.3

Quick Commands:
  stratix g context <name>    - Generate bounded context
  stratix g entity <name>     - Generate entity
  stratix add <extension>     - Install extension
  stratix add list            - List available extensions
```

## Full Workflow Example

```bash
# 1. Create new project
stratix new my-ecommerce --pm pnpm

# 2. Navigate to project
cd my-ecommerce

# 3. Add extensions you need
stratix add http
stratix add postgres
stratix add validation

# 4. Generate bounded contexts and artifacts
stratix g entity Product --props '[{"name":"id","type":"string"},{"name":"name","type":"string"},{"name":"price","type":"number"}]'
stratix g entity Customer --props '[{"name":"email","type":"string"},{"name":"name","type":"string"}]'
stratix g value-object Money --props '[{"name":"amount","type":"number"},{"name":"currency","type":"string"}]'
stratix g command CreateOrder --props '[{"name":"customerId","type":"string"},{"name":"items","type":"OrderItem[]"}]'
stratix g query GetOrdersByCustomer --props '[{"name":"customerId","type":"string"}]' --return-type "Order[]"

# 5. Build and run (using standard npm scripts)
pnpm install
pnpm build
pnpm start
```

## Features

- ✨ **Quick Project Setup** - Create production-ready projects in seconds
- 🔨 **6 Code Generators** - Generate entities, commands, queries, repositories, value objects, and quality configs
- 📦 **Extension Manager** - Install 13 Stratix extensions with automatic dependency resolution
- 🎯 **Interactive Mode** - Smart prompts guide you through project creation
- ⚙️ **Flexible Options** - CLI flags or interactive prompts, your choice
- 📊 **Project Info** - Instant overview of your Stratix project
- 🏗️ **DDD & CQRS** - Follows Domain-Driven Design and CQRS patterns
- 🔒 **Type-Safe** - Full TypeScript support with strict typing

## Requirements

- Node.js >= 18.0.0
- npm, pnpm, or yarn

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [CLI Reference](https://stratix.dev/docs/cli/overview)
- [GitHub Repository](https://github.com/pcarvajal/stratix)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT - Copyright (c) 2025 P. Andrés Carvajal
