# create-stratix

Scaffolding tool for creating new Stratix projects with zero configuration.

## Installation

No installation required! Use with npx:

```bash
npx create-stratix my-project
```

Or with pnpm:

```bash
pnpm create stratix my-project
```

## Usage

### Interactive Mode

Simply run without arguments for an interactive experience:

```bash
npx create-stratix
```

You'll be prompted for:
1. Project name
2. Template choice (ai-agent-starter, rest-api, microservice, worker, minimal)
3. Package manager (pnpm, npm, yarn)
4. Git initialization

### Command Line Mode

Skip prompts by providing options:

```bash
npx create-stratix my-project --template rest-api --pm pnpm --no-git
```

**Options**:
- `--template <template>` - Template to use
- `--pm <manager>` - Package manager (npm, pnpm, yarn)
- `--no-git` - Skip git initialization

## Templates

### ai-agent-starter

Interactive learning path for AI agents. Start here to learn how to build intelligent agents with Stratix.

```bash
npx create-stratix my-learning --template ai-agent-starter
```

**Includes**:
- Interactive menu with 6 progressive levels
- Level 1: Echo Agent (no API key needed)
- Level 2: Mock Agent with testing patterns (no API key needed)
- Level 3-6: Real LLM, Tools, Memory, Production (requires API keys)
- Complete documentation for each level
- Example implementations
- Mock LLM providers for testing

**Learning Path**:
```
Level 1: Echo Agent         [FREE] (5 min)  - Agent fundamentals
Level 2: Mock Agent         [FREE] (10 min) - Testing patterns
Level 3: Basic LLM          [API]  (15 min) - First LLM integration
Level 4: Agent with Tools   [API]  (20 min) - Function calling
Level 5: Agent with Memory  [API]  (20 min) - Context management
Level 6: Production Agent   [API]  (30 min) - Production patterns
```

**Cost Estimate**: ~$0.30-0.50 for all API-based levels

**Perfect For**:
- Learning AI agent patterns
- Understanding LLM integration
- Testing strategies for AI agents
- Production-ready AI patterns

**After Creation**:
```bash
cd my-learning
pnpm start  # Opens interactive menu
```

### minimal

Bare minimum Stratix setup. Perfect for learning or starting from scratch.

```bash
npx create-stratix my-app --template minimal
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

Complete REST API with CQRS pattern and Fastify.

```bash
npx create-stratix my-api --template rest-api
```

**Includes**:
- Fastify HTTP server
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

Background job processor application.

```bash
npx create-stratix my-worker --template worker
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

Microservice with RabbitMQ messaging.

```bash
npx create-stratix my-service --template microservice
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

## After Creation

### Start Development

```bash
cd my-project
pnpm install
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

## Examples

### Learn AI Agents

```bash
npx create-stratix my-learning --template ai-agent-starter --pm pnpm
cd my-learning
pnpm install
pnpm start
```

The interactive menu will guide you through all levels. Start with Level 1 (Echo Agent) - no API key needed!

### Create a REST API

```bash
npx create-stratix my-api --template rest-api --pm pnpm
cd my-api
pnpm install
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
npx create-stratix my-service --template microservice --pm pnpm
cd my-service

# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Start service
pnpm install
pnpm run dev
```

### Create a Worker

```bash
npx create-stratix my-worker --template worker --pm pnpm
cd my-worker
pnpm install
pnpm run dev
```

## Template Customization

After project creation, you can customize:

1. **Dependencies**: Add packages as needed
   ```bash
   pnpm add <package>
   ```

2. **Configuration**: Update `tsconfig.json`, linting rules, etc.

3. **Structure**: The templates provide a starting point - modify as needed

## Environment Variables

Templates include `.gitignore` with `.env` excluded. Create a `.env` file:

```bash
# .env
PORT=3000
NODE_ENV=development

# For microservice template
RABBITMQ_URL=amqp://localhost:5672

# For worker template
REDIS_URL=redis://localhost:6379
```

## Project Structure

All templates follow the same clean architecture structure:

```
src/
├── domain/              # Business logic (pure)
│   ├── entities/       # Domain entities and aggregates
│   ├── value-objects/  # Value objects
│   ├── events/         # Domain events
│   └── repositories/   # Repository interfaces
├── application/         # Use cases and orchestration
│   ├── commands/       # Write operations
│   ├── queries/        # Read operations
│   └── events/         # Event handlers
├── infrastructure/      # External concerns
│   ├── persistence/    # Database implementations
│   ├── http/          # HTTP controllers
│   └── messaging/      # Message queue implementations
└── index.ts            # Application entry point
```

## Next Steps

After creating your project:

1. Read the generated README.md
2. Explore the example code
3. Run the development server
4. Add your domain entities
5. Implement use cases
6. Add infrastructure implementations

## Troubleshooting

### Permission Denied

```bash
chmod +x node_modules/.bin/create-stratix
```

### Port Already in Use

Change the port in `.env` or `src/index.ts`:

```typescript
const PORT = process.env.PORT || 3001;
```

### RabbitMQ Connection Failed (Microservice)

Ensure RabbitMQ is running:

```bash
docker ps | grep rabbitmq
```

## See Also

- [Quick Start Guide](../../getting-started/quick-start.md)
- [Project Structure](../../core-concepts/architecture.md)
