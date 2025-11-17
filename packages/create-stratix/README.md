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

Choose from 8 production-ready templates:

- **REST API Complete** - Production-ready REST API with all production extensions (Fastify, Zod, Auth, Migrations)
- **REST API** - Complete REST API with authentication, CQRS commands/queries, and repository pattern
- **Microservice** - Event-driven service with message queue integration (RabbitMQ)
- **Modular Monolith** - Bounded Contexts as Plugins (monolith to microservices ready)
- **Monolith** - Modular monolith with bounded contexts
- **Worker** - Background job processor for async tasks
- **AI Agent Starter** - Learn AI agents step-by-step (no API key needed for Level 1)
- **Minimal** - Bare minimum setup with core Stratix packages

## Interactive Prompts

The CLI will guide you through:

1. **Project name** - Must be a valid npm package name
2. **Template selection** - Choose from the 8 templates above
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

- `--template <name>` - Template to use: `rest-api`, `rest-api-complete`, `microservice`, `worker`, `monolith`, `modular-monolith`, `ai-agent-starter`, or `minimal`
- `--pm <manager>` - Package manager: `npm`, `pnpm`, or `yarn`
- `--no-git` - Skip git initialization
- `--skip-install` - Skip dependency installation

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

## AI Agent Starter Template

The `ai-agent-starter` template includes progressive examples:

- **Level 1: Echo Agent** - Learn basic agent structure (no API key required)
- **Level 2: Calculator Agent** - Agent with tools
- **Level 3: Customer Support** - Production-ready agent with OpenAI/Anthropic
- **Level 4: Data Analysis** - Advanced agent with SQL and visualizations

Run `pnpm start` in the ai-agent-starter project to see an interactive menu.

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

## Code Generators

Generate boilerplate code with the `generate` command:

```bash
# Inside your Stratix project
npx create-stratix generate entity Product --props "name:string,price:number,stock:number"
npx create-stratix g entity Product  # Short alias
```

**Available generators:**

- `entity <name>` - Generate domain entity or aggregate root
- `value-object <name>` - Generate value object
- `use-case <name>` - Generate command/query with handler
- `repository <name>` - Generate repository interface and implementation
- `context <name>` - Generate complete bounded context
- `test <name>` - Generate test file

**Entity generator options:**

```bash
--props <props>           # Properties: "name:string,age:number"
--aggregate              # Generate as AggregateRoot (default)
--no-aggregate           # Generate as Entity
--with-event <name>      # Generate domain event
--with-tests             # Generate test file
--dry-run                # Preview without writing files
--force                  # Overwrite existing files
```

**Example:**

```bash
npx create-stratix generate entity Order \
  --props "customerId:string,items:OrderItem[],total:Money" \
  --with-event OrderPlaced \
  --with-tests
```

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [GitHub Repository](https://github.com/pcarvajal/stratix)
- [Examples](https://github.com/pcarvajal/stratix/tree/main/examples)

## License

MIT
