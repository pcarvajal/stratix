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

##### `context <name>` - Complete Bounded Context
Generates a complete bounded context with domain, application, and infrastructure layers.

**Options:**
- `--props <props>` - Entity properties (e.g., "name:string,price:number")

**Example:**
```bash
stratix g context Products --props "name:string,price:number,stock:number"
```

**Generated files (13-16):**
- Domain: Entity (AggregateRoot), Repository interface, Domain events (Created/Updated/Deleted)
- Application: Commands (Create/Update/Delete), Queries (GetById/List), Handlers
- Infrastructure: InMemory repository implementation
- ContextPlugin with auto-wiring

##### `entity <name>` - Domain Entity
Generates a domain entity or aggregate root.

**Options:**
- `--props <props>` - Entity properties
- `--no-aggregate` - Generate as Entity instead of AggregateRoot

**Example:**
```bash
stratix g entity Product --props "name:string,price:number"
stratix g entity Order --no-aggregate
```

##### `value-object <name>` (alias: `vo`)
Generates a domain value object.

**Options:**
- `--props <props>` - Value object properties

**Example:**
```bash
stratix g value-object Email --props "value:string"
stratix g vo Address --props "street:string,city:string,zipCode:string"
```

##### `command <name>` - CQRS Command
Generates a command with its handler.

**Options:**
- `--input <props>` - Input properties (alias: `--props`)

**Example:**
```bash
stratix g command CreateProduct --input "name:string,price:number"
```

##### `query <name>` - CQRS Query
Generates a query with its handler.

**Options:**
- `--input <props>` - Input properties (alias: `--props`)
- `--output <type>` - Output type (default: "any")

**Example:**
```bash
stratix g query GetProductById --input "id:string" --output "Product"
stratix g query ListProducts --output "Product[]"
```

##### `repository <entityName>` (alias: `repo`)
Generates a repository interface and implementation.

**Options:**
- `--no-implementation` - Generate only the interface

**Example:**
```bash
stratix g repository Product
stratix g repo Order --no-implementation
```

##### `event-handler <eventName>` (alias: `eh`)
Generates a domain event handler.

**Options:**
- `--handler <name>` - Custom handler name

**Example:**
```bash
stratix g event-handler ProductCreated
stratix g eh OrderPlaced --handler SendConfirmationEmail
```

##### `plugin <name>`
Generates a custom plugin with lifecycle methods.

**Options:**
- `--no-health-check` - Generate without health check method

**Example:**
```bash
stratix g plugin MyCustomPlugin
stratix g plugin EmailService --no-health-check
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

**Available Extensions (14):**

**Production Extensions:**
- `http` - Fastify HTTP server integration
- `validation` - Zod-based schema validation
- `mappers` - Entity-to-DTO mapping utilities
- `auth` - JWT authentication and RBAC authorization
- `migrations` - Database migration system
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

# 4. Generate bounded contexts
stratix g context Products --props "name:string,price:number,stock:number"
stratix g context Orders --props "customerId:string,total:number,status:string"

# 5. Check project info
stratix info

# 6. Generate additional artifacts as needed
stratix g entity Customer --props "email:string,name:string"
stratix g value-object Money --props "amount:number,currency:string"
stratix g command CreateOrder --input "customerId:string,items:OrderItem[]"
stratix g query GetOrdersByCustomer --input "customerId:string" --output "Order[]"

# 7. Build and run (using standard npm scripts)
pnpm install
pnpm build
pnpm start
```

## Features

-  **Quick Project Setup** - Create production-ready projects in seconds
-  **8 Code Generators** - Generate entities, commands, queries, and complete bounded contexts
-  **Extension Manager** - Install 14 Stratix extensions with automatic dependency resolution
-  **Interactive Mode** - Smart prompts guide you through project creation
-  **Flexible Options** - CLI flags or interactive prompts, your choice
-  **Project Info** - Instant overview of your Stratix project
-  **DDD & CQRS** - Follows Domain-Driven Design and CQRS patterns
-  **Type-Safe** - Full TypeScript support with strict typing

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
