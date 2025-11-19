# Introduction

Welcome to **Stratix** - the fastest path from idea to production-ready application. Build scalable, maintainable systems with **Domain-Driven Design**, **Hexagonal Architecture**, **CQRS**, **Enterprise AI Agents**, and **distributable custom plugins** in minutes.

:::caution Pre-release Status
Stratix is currently in active development. The API may change as we work toward stability. Recommended for early adopters and testing. See our [Versioning Policy](./versioning.md) for details.
:::

## What is Stratix?

Stratix is a **production-first TypeScript framework** that eliminates boilerplate while delivering enterprise-grade architecture. Get a complete DDD/CQRS application in minutes instead of hours of manual setup.

### Two Core Strengths

**1. Lightning-Fast DDD/CQRS Setup**

Traditional setup is slow, error-prone, and inconsistent. You spend hours configuring TypeScript, wiring dependencies, creating base classes, implementing patterns, and writing boilerplate before writing actual business logic.

Stratix CLI generates production-ready code with one command. Focus on business logic from minute one.

**2. The Enterprise AI Agent Framework**

We're not another LLM wrapper. Stratix treats **AI agents as first-class citizens** in Domain-Driven Design architecture. Agents are domain entities with the same rigor as your business logic - type-safe, testable, and production-ready from day one.

Build intelligent applications where AI agents live in your domain layer, integrate with CQRS patterns, and follow proven enterprise architecture principles.

### Lightning-Fast DDD/CQRS Setup

```bash
# Traditional approach: Hours of manual work
# - Configure TypeScript, ESLint, DI container
# - Create entity base classes
# - Implement CQRS infrastructure
# - Write repository patterns
# - Setup event handling
# - Create first bounded context

# Stratix approach: Minutes
stratix new my-app
cd my-app
stratix g context Products --props "name:string,price:number"
npm run dev
```

**Result:** Production-ready code in minutes instead of hours.

### Extensibility: Custom Plugins for Enterprise

Stratix is built on a **plugin-first architecture**. Write custom, distributable plugins to encapsulate business logic, integrations, or infrastructure concerns - then share them across teams or publish to npm.

**Enterprise use case: Multi-tenant SaaS Platform**

Imagine building a SaaS platform where each client needs custom integrations (payment gateways, CRM systems, notification channels). With Stratix plugins:

```typescript
// @your-company/payment-processors - Distributable plugin
export class StripePaymentPlugin implements Plugin {
  name = 'stripe-payment';
  version = '1.0.0';
  
  async initialize(context: PluginContext): Promise<void> {
    // Register payment service
    context.container.register('paymentService', () => 
      new StripePaymentService(this.config)
    );
  }
  
  async start(): Promise<void> {
    // Initialize Stripe SDK
  }
}

// Client A configuration
const clientAApp = await ApplicationBuilder.create()
  .usePlugin(new StripePaymentPlugin({ apiKey: clientA.stripeKey }))
  .usePlugin(new SalesforcePlugin({ apiKey: clientA.salesforceKey }))
  .usePlugin(new SlackNotificationsPlugin({ webhook: clientA.slackWebhook }))
  .build();

// Client B configuration - different plugins
const clientBApp = await ApplicationBuilder.create()
  .usePlugin(new PayPalPaymentPlugin({ apiKey: clientB.paypalKey }))
  .usePlugin(new HubSpotPlugin({ apiKey: clientB.hubspotKey }))
  .usePlugin(new TeamsNotificationsPlugin({ webhook: clientB.teamsWebhook }))
  .build();
```

**Benefits:**
- **Reusability**: Write once, use across multiple clients
- **Distribution**: Publish internal plugins to private npm registry
- **Isolation**: Each plugin manages its own dependencies and lifecycle
- **Testability**: Test plugins independently before deployment
- **Monetization**: Sell specialized plugins as products

**Common enterprise plugin patterns:**
- **Authentication adapters**: SAML, OAuth2, LDAP, Custom SSO
- **Payment gateways**: Stripe, PayPal, Square, regional processors
- **CRM integrations**: Salesforce, HubSpot, Dynamics 365
- **Notification channels**: Slack, Teams, Email, SMS, Push
- **Compliance modules**: GDPR logging, audit trails, data encryption
- **Analytics connectors**: Mixpanel, Amplitude, custom dashboards

### The Enterprise AI Agent Framework

Stratix exists to help development teams build production-ready applications with Domain-Driven Design, CQRS, and **AI Agents** without sacrificing type safety, testability, or architecture.

**AI Agents as Domain Entities:**

```typescript
import { AIAgent, AgentResult, AgentContext } from '@stratix/core';
import { OpenAIProvider } from '@stratix/ai-openai';

// AI Agent = Domain Entity (not a service or utility)
class CustomerSupportAgent extends AIAgent<SupportTicket, SupportResponse> {
  readonly name = 'Customer Support Agent';
  readonly description = 'Handles customer support inquiries';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = ['ticket_routing', 'sentiment_analysis'];
  
  readonly model = {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  };

  async execute(ticket: SupportTicket): Promise<AgentResult<SupportResponse>> {
    // Agent logic with full type safety
    const context = new AgentContext({
      sessionId: ticket.id,
      environment: 'production',
      budget: 0.50 // USD limit
    });
    
    const result = await this.llmProvider.chat({
      model: this.model.model,
      messages: this.buildMessages(ticket),
      tools: this.getTools()
    });
    
    return AgentResult.success(this.parseResponse(result));
  }
}
```

**Production patterns built-in:**
- **Budget enforcement**: Per-execution cost limits with automatic tracking
- **Audit logging**: Every agent execution logged for compliance
- **Automatic retries**: Exponential backoff for transient failures
- **Multi-LLM support**: OpenAI, Anthropic, or custom providers
- **Tool integration**: Type-safe function calling with validation
- **Memory management**: Short and long-term memory with pluggable stores
- **Streaming support**: Real-time response streaming

**Agent Orchestration:**

```typescript
import { StratixAgentOrchestrator } from '@stratix/ai-runtime';

const orchestrator = new StratixAgentOrchestrator(
  agentRepository,
  auditLog,
  llmProvider,
  {
    auditEnabled: true,
    budgetEnforcement: true,
    autoRetry: true,
    maxRetries: 3
  }
);

// Register agents
orchestrator.registerAgent(supportAgent);
orchestrator.registerAgent(analysisAgent);

// Execute with full observability
const result = await orchestrator.execute(
  supportAgent.id,
  ticket,
  { budget: 1.00, maxExecutionTime: 30000 }
);

console.log('Cost:', result.executionTrace.totalCost);
console.log('Tokens:', result.executionTrace.totalTokens);
```

**Why this matters:**
- Agents are **testable** with mock LLM providers
- Agents follow **DDD patterns** (Aggregate Root, Domain Events)
- Agents integrate with **CQRS** (Commands trigger agents, Queries use results)
- Agents are **observable** (traces, metrics, audit logs)
- Agents are **production-ready** (budget limits, retries, error handling)

### Modularity: Architecture That Scales

Stratix supports **two structures** optimized for different complexity levels:

#### DDD Structure (Default)
**For:** Small apps, microservices, single bounded context
```
src/
├── domain/          # Business logic (DDD patterns optional but recommended)
├── application/     # Use cases (CQRS)
└── infrastructure/  # External concerns
```

**Domain Layer Flexibility:** While Stratix provides full DDD primitives (AggregateRoot, ValueObject, DomainEvent), their use is optional. You can use simple entities or partial DDD implementation. The key requirement is keeping all domain logic in this layer for proper separation of concerns.

#### Modular Structure
**For:** Modular monoliths, multiple bounded contexts, gradual microservice migration
```
src/
└── contexts/        # Independent bounded contexts
    ├── products/    # Each context = plugin
    ├── orders/      # Extract to microservice = copy folder
    └── customers/   # Zero code changes needed
```

**Key advantage:** Extract contexts to microservices **without rewriting domain code**. Deploy as monolith, scale to microservices when needed.

### Ease: Zero Configuration, Maximum Productivity

Stratix makes complex patterns simple:

**Generate complete bounded context (16 files):**
```bash
stratix g context Products --props "name:string,price:number,stock:number"
```

**Generated automatically:**
- Entity (AggregateRoot) - DDD patterns included by default
- 3 Commands (Create/Update/Delete) + Handlers
- 2 Queries (GetById/List) + Handlers
- Repository interface + InMemory implementation
- 3 Domain events (Created/Updated/Deleted)
- ContextPlugin with auto-wiring

**Note:** Full DDD implementation is optional. You can use simple entities or partial DDD. The framework requirement is keeping domain logic in the domain layer.

**Individual generators for fine control:**
```bash
stratix g entity Order --props "customerId:string,total:number"
stratix g command CreateOrder --input "customerId:string,items:OrderItem[]"
stratix g query GetOrderById --input "id:string" --output "Order"
stratix g vo Money --props "amount:number,currency:string"
```

### Production-Ready From Day One

Every generated file includes:
- **Type Safety**: Strict TypeScript, phantom types for EntityId
- **CQRS**: Commands, Queries, Handlers following best practices
- **DDD Patterns**: Entities, Aggregates, Value Objects, Domain Events (optional but recommended)
- **Dependency Injection**: Pre-configured Awilix container
- **Result Pattern**: Explicit error handling (no thrown exceptions in domain)
- **Event Sourcing**: Domain events tracked automatically
- **Hexagonal Architecture**: Clear boundaries between layers

**DDD Flexibility:** While Stratix generators create full DDD implementations by default, you're free to use simple entities or adapt patterns to your needs. The critical principle is maintaining domain logic separation in the domain layer, regardless of pattern depth.

### Key Features

#### Core Framework
- **Lightning-Fast CLI**: Generate complete bounded contexts instantly
- **Modular Architecture**: Monolith → Microservices without rewrites
- **Rich Primitives**: Money, Email, EntityId, and more built-in value objects
- **Type-Safe**: Strict TypeScript with phantom types and full inference
- **Result Pattern**: No try-catch in domain logic
- **Testing Utilities**: Built-in test helpers and factories

#### Plugin-First Architecture
- **14 Production Extensions**: HTTP, Auth, Validation, Postgres, Redis, RabbitMQ, and more
- **Custom Plugins**: Create distributable plugins for integrations and business logic
- **Enterprise Composition**: Mix and match plugins per client/deployment
- **Lifecycle Management**: Automatic initialization, startup, shutdown, health checks
- **Dependency Resolution**: Plugins declare dependencies, framework handles ordering
- **Distribution**: Publish plugins to npm, share across teams

#### Production Extensions
- **HTTP**: Fastify integration with route handlers
- **Auth**: JWT + RBAC authorization
- **Validation**: Zod-based schema validation
- **Database**: Postgres, MongoDB support
- **Caching**: Redis integration
- **Messaging**: RabbitMQ event bus
- **Migrations**: Database versioning system
- **Errors**: Structured error handling with taxonomy

#### Enterprise AI Agent Framework
- **Agents as Domain Entities**: Full DDD integration, not service wrappers
- **Type-Safe Execution**: `AIAgent<TInput, TOutput>` with complete type inference
- **Budget Enforcement**: Per-execution cost limits with automatic tracking
- **Production Patterns**: Retries, audit logging, tracing, observability
- **Multi-LLM Support**: OpenAI, Anthropic with unified interface
- **Tool Integration**: Type-safe function calling with validation
- **Memory Management**: Short and long-term memory stores
- **Streaming Support**: Real-time response streaming
- **Mock Providers**: Deterministic testing without API calls
- **Agent Orchestration**: Lifecycle management, coordination, monitoring

## Why Stratix?

### For Speed-Focused Teams

**Stop wasting time on setup. Start building features.**

Traditional DDD/CQRS setup requires:
- Hours of configuration and boilerplate
- Deep architectural knowledge
- Trial and error finding the right patterns
- Inconsistency across team members

Stratix delivers:
- Production-ready codebase in minutes
- Complete bounded contexts (16 files generated) instantly
- Zero architectural decisions needed
- Complete consistency across projects

**Real-world impact:**
```bash
# E-commerce platform with 5 bounded contexts
stratix new my-ecommerce --structure modular
cd my-ecommerce

# Minutes for complete platform (80+ files)
stratix g context Products --props "name:string,price:number,stock:number"
stratix g context Orders --props "customerId:string,total:number,status:string"
stratix g context Payments --props "orderId:string,amount:number,method:string"
stratix g context Shipping --props "orderId:string,address:string,status:string"
stratix g context Customers --props "email:string,name:string,tier:string"

# Result: Production-ready e-commerce platform
# Traditional approach: Many hours of manual work
```

### For Architects Planning Scale

**Build modular monolith, extract microservices without rewrites.**

Stratix's modular structure enables the **Strangler Fig Pattern** out of the box:

**Phase 1: Start as Monolith**
```typescript
// Deploy all contexts in single process
const app = await ApplicationBuilder.create()
  .usePlugin(new ProductsContextPlugin())
  .usePlugin(new OrdersContextPlugin())
  .usePlugin(new PaymentsContextPlugin())
  .build();
```

**Phase 2: Extract When Needed (Zero Code Changes)**
```typescript
// products-service/src/index.ts
const app = await ApplicationBuilder.create()
  .usePlugin(new ProductsContextPlugin())  // Same plugin!
  .build();

// orders-service/src/index.ts
const app = await ApplicationBuilder.create()
  .usePlugin(new OrdersContextPlugin())    // Same plugin!
  .build();
```

**Architectural benefits:**
- Bounded contexts as **independent plugins**
- Domain code **identical** in monolith and microservices
- Extract services **gradually** (no big-bang rewrites)
- Test deployment strategies **risk-free**
- Scale **only what needs scaling**

**When to use each structure:**

| Your Situation | Structure | Why |
|----------------|-----------|-----|
| MVP/Prototype | DDD | Fastest path, single context |
| Microservice | DDD | Focused domain, simple structure |
| Growing app (2-3 contexts) | DDD | Not complex enough for modular |
| Complex domain (3+ contexts) | Modular | Independent modules, future-proof |
| Planning scale to microservices | Modular | Zero refactoring when extracting |
| Multiple teams by domain | Modular | Each team owns a context |

### For Developers Who Hate Boilerplate

**Write business logic, not infrastructure.**

Stratix eliminates repetitive code:

**What you write:**
```bash
stratix g context Products --props "name:string,price:number,stock:number"
```

**What you get:**
```typescript
// Entity with type-safe properties
class Product extends AggregateRoot<'Product'> {
  get name(): string { return this._name; }
  get price(): number { return this._price; }
  get stock(): number { return this._stock; }
  
  static create(props: ProductProps): Product { /* validation */ }
}

// Commands with handlers
class CreateProduct implements Command { /* ... */ }
class CreateProductHandler implements CommandHandler { /* ... */ }

// Queries with handlers
class GetProductById implements Query { /* ... */ }
class GetProductByIdHandler implements QueryHandler { /* ... */ }

// Repository pattern
interface ProductRepository extends Repository<Product, ProductId> { /* ... */ }
class InMemoryProductRepository implements ProductRepository { /* ... */ }

// Domain events
class ProductCreated implements DomainEvent { /* ... */ }

// Auto-wired plugin
class ProductsContextPlugin extends BaseContextPlugin { /* ... */ }
```

**Focus on what matters:**
```typescript
// You write business logic
class Product extends AggregateRoot<'Product'> {
  decreaseStock(quantity: number): void {
    if (this._stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this._stock -= quantity;
    this.record(new StockDecreasedEvent(this.id, quantity));
  }
}
```

Stratix handles the rest: CQRS wiring, DI configuration, repository patterns, event handling.

### For Teams Building AI-Powered Applications

**AI Agents as domain entities, not afterthoughts.**

Stratix treats AI agents with the same rigor as traditional domain entities:

```typescript
import { AIAgent } from '@stratix/core';
import { OpenAIProvider } from '@stratix/ai-openai';

// AI Agent = Domain Entity
const supportAgent = AIAgent.create({
  name: 'CustomerSupport',
  description: 'Handles customer inquiries',
  systemPrompt: 'You are a helpful support agent',
  llmProvider: new OpenAIProvider({ apiKey: process.env.OPENAI_KEY }),
  tools: [searchTool, ticketTool],
  memoryStore: redisMemoryStore,
});

// Budget enforcement built-in
const result = await orchestrator.execute(supportAgent.id, {
  query: 'How do I reset my password?',
  maxCost: 0.10, // USD limit per execution
});

console.log(result.value.response);
console.log(result.value.totalCost); // Automatic cost tracking
```

**Production AI patterns included:**
- Budget enforcement (per execution, per user, per agent)
- Automatic retries with exponential backoff
- Cost tracking and audit logging
- Mock providers for deterministic testing
- Multi-LLM support (OpenAI, Anthropic, custom)

### For Teams Demanding Consistency

**Same patterns, same structure, everywhere.**

New team members productive from day one. All Stratix projects follow identical patterns:

- **Same folder structure** (DDD or modular)
- **Same CQRS patterns** (Command/Query/Handler)
- **Same DI conventions** (Awilix container)
- **Same entity base classes** (Entity, AggregateRoot, ValueObject)
- **Same error handling** (Result pattern)
- **Same event handling** (Domain events)

**Onboarding time:**
- Traditional DDD project: 2-3 days to understand structure
- Stratix project: 1 hour (same patterns every time)

## Real-World Example: E-Commerce Platform

Build a production-ready e-commerce platform quickly:

```bash
# 1. Create modular project
stratix new my-ecommerce --structure modular --pm pnpm
cd my-ecommerce

# 2. Generate 5 bounded contexts
stratix g context Products --props "name:string,price:number,stock:number"
stratix g context Orders --props "customerId:string,total:number,status:string"
stratix g context Payments --props "orderId:string,amount:number,method:string"
stratix g context Shipping --props "orderId:string,address:string,status:string"
stratix g context Customers --props "email:string,name:string,tier:string"

# 3. Add production extensions
stratix add http validation auth postgres

# Done! 80+ files, complete platform architecture
```

**What you get:**
- 5 independent bounded contexts
- 15 commands (Create/Update/Delete per context)
- 10 queries (GetById/List per context)
- 5 repositories with in-memory implementations
- 15 domain events
- 5 auto-wired plugins
- HTTP server with Fastify
- JWT authentication + RBAC
- Zod validation
- Postgres integration
- Full type safety end-to-end

**Code example (auto-generated):**

```typescript
// src/contexts/products/domain/entities/Product.ts
import { AggregateRoot, EntityId } from '@stratix/core';

export type ProductId = EntityId<'Product'>;

export class Product extends AggregateRoot<'Product'> {
  private constructor(
    id: ProductId,
    private _name: string,
    private _price: number,
    private _stock: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get name(): string { return this._name; }
  get price(): number { return this._price; }
  get stock(): number { return this._stock; }

  // Add your business logic
  decreaseStock(quantity: number): void {
    if (this._stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this._stock -= quantity;
    this.record(new StockDecreasedEvent(this.id, quantity));
    this.touch();
  }

  static create(props: ProductProps, id?: ProductId): Product {
    // Validation included
    const productId = id ?? EntityId.create<'Product'>();
    const now = new Date();
    return new Product(productId, props.name, props.price, props.stock, now, now);
  }
}
```

**Deploy as monolith or microservices (same code):**

```typescript
// Option 1: Modular Monolith
const app = await ApplicationBuilder.create()
  .usePlugin(new ProductsContextPlugin())
  .usePlugin(new OrdersContextPlugin())
  .usePlugin(new PaymentsContextPlugin())
  .usePlugin(new ShippingContextPlugin())
  .usePlugin(new CustomersContextPlugin())
  .build();

// Option 2: Extract to Microservices (zero code changes!)
// products-service/src/index.ts
const app = await ApplicationBuilder.create()
  .usePlugin(new ProductsContextPlugin())  // Same plugin!
  .build();
```

## Design Philosophy

Stratix follows three core principles:

### 1. Speed Without Compromise

**Fast setup shouldn't mean poor quality.**

- **Not:** Rapid prototyping tools that create tech debt
- **Instead:** Production-ready code from minute one
- **Not:** Scaffolding that you rewrite later
- **Instead:** Battle-tested patterns you deploy to production

**Generate once, scale forever.** Code quality matches hand-written enterprise applications.

### 2. Modularity as Foundation

**Architecture should enable growth, not constrain it.**

- **Not:** Monolith with no extraction path
- **Instead:** Modular monolith ready for microservices
- **Not:** Microservices from day one (premature complexity)
- **Instead:** Start monolith, extract when data proves need

**Bounded contexts as plugins.** Extract to microservices by changing deployment config, not rewriting code.

### 3. Ease Through Consistency

**Complexity is the enemy of maintainability.**

- **Not:** Each developer's interpretation of DDD
- **Instead:** Same patterns, same structure, everywhere
- **Not:** Architectural discussions in every PR
- **Instead:** Framework enforces boundaries automatically

**Onboard developers in hours, not weeks.** Stratix projects look identical across teams and companies.

---

## Philosophy in Practice

**1. Architecture First**
Clean architecture isn't optional. Stratix enforces boundaries:
```
domain/          → Pure business logic (no framework dependencies)
application/     → Use cases (CQRS handlers)
infrastructure/  → External concerns (DB, HTTP, LLM providers)
```

**2. Type Safety**
Leverage TypeScript to catch errors at compile time:
- Phantom types for `EntityId<'Product'>` (can't mix Product and Order IDs)
- Strict mode enabled by default
- Full inference in CQRS handlers

**3. Explicit Over Implicit**
No magic, just clear code:
- Result pattern instead of thrown exceptions
- Explicit handler registration (no reflection or decorators)
- Dependency injection visible in constructors

**4. Production Ready**
Every generated file includes patterns used in enterprise systems:
- Entity lifecycle methods (created, updated timestamps)
- Domain events tracked automatically
- Repository pattern with clear interfaces
- CQRS with explicit commands and queries

**5. AI Agents as First-Class Citizens**
Agents are domain entities, not service classes:
- Extend `AIAgent<TInput, TOutput>` base class
- Budget enforcement and cost tracking built-in
- Observable and testable by default

## Who is Stratix For?

### Perfect For

**Teams building modular monoliths** planning eventual microservice extraction  
**Architects** implementing DDD and hexagonal architecture  
**Developers** who hate boilerplate but love clean code  
**Startups** needing MVP → Enterprise without rewrites  
**Teams building AI-powered applications** with production-grade patterns  
**Tech leads** demanding consistency across projects  

### Not Ideal For

**CRUD apps** - Use Rails, Laravel, or Nest.js instead  
**Prototypes you'll throw away** - Don't need enterprise architecture  
**Non-TypeScript projects** - Stratix requires TypeScript  
**Serverless-only** - Better served by framework-less approaches  

### When to Choose Stratix

| Your Goal | Stratix Fit |
|-----------|------------|
| Build MVP in 2 weeks | Perfect (60s setup → focus on features) |
| Prototype for demo | Overkill (too much architecture) |
| Scale to 10+ microservices | Perfect (modular structure ready) |
| Simple CRUD API | Overkill (use simpler framework) |
| Complex domain with multiple contexts | Perfect (DDD patterns built-in) |
| Team of 10+ developers | Perfect (consistency enforced) |
| Solo developer learning DDD | Good (see patterns in action) |
| Serverless functions | Wrong tool (primitives ok, runtime too heavy) |

## Quick Comparison

**Stratix vs. Traditional Setup:**

| Task | Traditional | Stratix |
|------|------------|---------|
| Project setup | 30-60 min | Instant |
| Configure TS + DI + CQRS | 60-90 min | Included (0 min) |
| Create bounded context | 45-60 min | Instant |
| Add entity + commands | 20-30 min | Instant |
| Wire dependencies | 15-20 min | Auto (0 min) |
| **Total for e-commerce (5 contexts)** | **Many hours** | **Minutes** |

**Stratix vs. Other Frameworks:**

| Framework | Philosophy | Setup Time | DDD/CQRS | Modularity |
|-----------|-----------|------------|----------|------------|
| **Stratix** | Speed + Architecture | Minutes | Built-in | Modular by default |
| Nest.js | Decorator-heavy, opinionated | Minutes | Manual | Modules ≠ Bounded Contexts |
| Nx Monorepo | Tooling-focused | Minutes | None | Good (library-based) |
| ts-node + Express | Minimal, DIY | Hours | Manual | Manual |
| Rails/Laravel | Convention over configuration | Minutes | None | Monolithic |

**Key differences:**
- **Nest.js**: Requires manual CQRS setup, decorators everywhere, modules ≠ DDD bounded contexts
- **Nx**: Great tooling but no domain patterns, focuses on libraries not DDD
- **DIY**: Complete control but many hours per project
- **Stratix**: DDD/CQRS out of the box, bounded contexts as plugins, production-ready quickly

## Next Steps

Ready to build your first Stratix application?

### Option 1: Fastest Path (Recommended)
```bash
stratix new my-app
cd my-app
stratix g context Products --props "name:string,price:number"
npm run dev
```

### Option 2: Read Installation Guide
[Installation →](./installation.md)

### Option 3: See Complete Tutorial
[Quick Start →](./quick-start.md)

---

**Questions?**
- 📚 [Core Concepts](../core-concepts/architecture.md) - Deep dive into architecture
- 🛠️ [CLI Reference](../cli/overview.md) - All available commands
- 💡 [Examples](../../examples) - Real-world applications
- [GitHub Discussions](https://github.com/pcarvajal/stratix/discussions) - Ask the community
