# create-stratix

Scaffold a new Stratix application with zero configuration. Build production-ready applications using Domain-Driven Design, Hexagonal Architecture, CQRS patterns, and AI agents.

## Usage

```bash
# With npm
npm create stratix@latest

# With pnpm (recommended)
pnpm create stratix

# With yarn
yarn create stratix
```

## What You Get

- TypeScript configured with strict mode
- Stratix packages pre-installed
- Project structure following DDD and hexagonal architecture
- Testing setup with Vitest
- Build configuration
- Git repository initialized
- ESLint and Prettier configured

## Project Templates

Choose from 6 production-ready templates:

- **REST API** - Complete REST API with authentication, CQRS commands/queries, and repository pattern
- **Microservice** - Event-driven service with message queue integration (RabbitMQ)
- **Monolith** - Modular monolith architecture with bounded contexts
- **Worker** - Background job processor for async tasks
- **AI Agent Starter** - Learn AI agents step-by-step with progressive examples (no API key needed for Level 1)
- **Minimal** - Bare minimum setup with core Stratix packages

## Interactive Prompts

The CLI will guide you through:

1. **Project name** - Must be a valid npm package name
2. **Template selection** - Choose from the 6 templates above
3. **Package manager** - npm, pnpm (recommended), or yarn
4. **Git initialization** - Automatically create initial commit

## Command Line Options

You can skip the interactive prompts by providing options:

```bash
npm create stratix@latest my-app \
  --template rest-api \
  --pm pnpm \
  --no-git \
  --skip-install
```

**Available options:**

- `--template <name>` - Template to use: `rest-api`, `microservice`, `worker`, `monolith`, `ai-agent-starter`, or `minimal`
- `--pm <manager>` - Package manager: `npm`, `pnpm`, or `yarn`
- `--no-git` - Skip git initialization
- `--skip-install` - Skip dependency installation

## Template Details

### ai-agent-starter

Learn AI agents step-by-step with progressive examples. No API key needed for Level 1!

```bash
npm create stratix@latest my-learning --template ai-agent-starter
```

The `ai-agent-starter` template includes progressive examples:

- **Level 1: Echo Agent** - Learn basic agent structure (no API key required)
- **Level 2: Calculator Agent** - Agent with tools
- **Level 3: Customer Support** - Production-ready agent with OpenAI/Anthropic
- **Level 4: Data Analysis** - Advanced agent with SQL and visualizations

Run `pnpm start` in the ai-agent-starter project to see an interactive menu.

**Perfect For**:
- Learning AI agent patterns
- Understanding LLM integration
- Testing strategies for AI agents
- Production-ready AI patterns

### minimal

Bare minimum setup with core Stratix packages. Perfect for learning or starting from scratch.

```bash
npm create stratix@latest my-app --template minimal
```

**Includes**:
- Basic ApplicationBuilder setup
- DI container configuration
- Console logger
- Directory structure for DDD

**Project Structure**:
```
my-app/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   └── repositories/
│   ├── application/
│   │   ├── commands/
│   │   └── queries/
│   ├── infrastructure/
│   │   └── persistence/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### rest-api

Complete REST API with authentication, CQRS pattern and Fastify.

```bash
npm create stratix@latest my-api --template rest-api
```

**Includes**:
- Fastify HTTP server
- Authentication
- Full CQRS setup (commands, queries, event bus)
- Example domain entity (Item)
- Repository pattern implementation
- HTTP controller
- Health check endpoint

**Endpoints**:
- `GET /health` - Health check
- `POST /items` - Create item
- `GET /items` - List items
- `GET /items/:id` - Get item

### worker

Background job processor for async tasks.

```bash
npm create stratix@latest my-worker --template worker
```

**Includes**:
- Job processor setup
- Event bus integration
- Example job processor
- Background task handling

**Use Cases**:
- Email sending
- Data processing
- Scheduled tasks
- Background jobs

### microservice

Event-driven service with message queue integration (RabbitMQ).

```bash
npm create stratix@latest my-service --template microservice
```

**Includes**:
- Full CQRS setup
- RabbitMQ plugin integration
- Fastify HTTP endpoints
- Event-driven communication
- Example task entity
- Health check endpoint

**Features**:
- Message queue integration
- Event publishing
- Event consumption
- Inter-service communication

### monolith

Modular monolith architecture with bounded contexts.

```bash
npm create stratix@latest my-monolith --template monolith
```

**Includes**:
- Multiple bounded contexts
- Shared kernel
- Domain event bus
- CQRS pattern
- Module isolation
- Unified HTTP API

**Perfect For**:
- Large applications with clear domain boundaries
- Teams wanting to start monolith and potentially split later
- Projects requiring strong domain separation

## Example Usage

### Interactive Mode

```bash
$ npm create stratix@latest

Welcome to Stratix!

Let's create your new application

✔ What is your project named? my-stratix-app
✔ Which template would you like to use? REST API - Complete REST API with authentication
✔ Which package manager do you want to use? pnpm (recommended)
✔ Initialize git repository? Yes

Creating project...
Installing dependencies...
Git initialized!

Your Stratix app is ready!

Next steps:

  cd my-stratix-app
  pnpm run dev

Happy coding!
```

### Command Line Mode

```bash
# Create a microservice with pnpm
npm create stratix@latest my-service --template microservice --pm pnpm

# Create an AI agent starter project
npm create stratix@latest ai-demo --template ai-agent-starter --pm pnpm

# Create minimal project without git
npm create stratix@latest minimal-app --template minimal --no-git
```

## After Creation

### Start Development

```bash
cd my-project
pnpm run dev
```

### Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm run typecheck` - Type check without emitting
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## Detailed Examples

### Learn AI Agents

```bash
npm create stratix@latest my-learning --template ai-agent-starter --pm pnpm
cd my-learning
pnpm run dev
```

The interactive menu will guide you through all levels. Start with Level 1 (Echo Agent) - no API key needed!

### Create a REST API

```bash
npm create stratix@latest my-api --template rest-api --pm pnpm
cd my-api
pnpm run dev
```

Test the API:

```bash
# Health check
curl http://localhost:3000/health

# Create item
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "A test item"}'

# Get items
curl http://localhost:3000/items
```

### Create a Microservice

```bash
npm create stratix@latest my-service --template microservice --pm pnpm
cd my-service

# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Start service
pnpm run dev
```

### Create a Worker

```bash
npm create stratix@latest my-worker --template worker --pm pnpm
cd my-worker
pnpm run dev
```

## Requirements

- Node.js 18.0.0 or higher
- npm, pnpm, or yarn

## Project Structure

All templates follow Stratix's layered architecture:

```
src/
├── domain/           # Domain layer (entities, value objects, repositories)
├── application/      # Application layer (use cases, commands, queries)
└── infrastructure/   # Infrastructure layer (persistence, HTTP, external services)
```

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [GitHub Repository](https://github.com/pcarvajal/stratix)
- [Examples](https://github.com/pcarvajal/stratix/tree/main/examples)
- [Quick Start Guide](../../getting-started/quick-start.md)
- [Project Structure](../../core-concepts/architecture.md)

## License

MIT
