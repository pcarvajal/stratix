# Stratix AI Agents - Learning Path

Welcome to the Stratix AI Agents learning environment! This project will guide you step-by-step from basic agent concepts to production-ready AI agents.

## Quick Start

```bash
# Interactive menu (recommended)
pnpm start

# Or run specific examples
pnpm run example:echo
pnpm run example:mock
```

## Learning Path

This project contains 6 progressively more advanced examples. Start with Level 1 and work your way up.

### Level 1: Echo Agent (5 min) - FREE

**What you'll learn:**
- Basic agent structure
- Agent lifecycle
- Type-safe inputs/outputs
- Result pattern
- No LLM, no API key required

**Run it:**
```bash
pnpm run example:echo
```

**Files:**
- `src/agents/01-echo/EchoAgent.ts`
- `src/agents/01-echo/README.md`

---

### Level 2: Mock Agent (10 min) - FREE

**What you'll learn:**
- LLM provider pattern
- Testing with mock providers
- Deterministic responses
- Cost simulation
- No API key required

**Run it:**
```bash
pnpm run example:mock
```

**Files:**
- `src/agents/02-mock/MockAgent.ts`
- `src/agents/02-mock/MockLLMProvider.ts`
- `src/agents/02-mock/README.md`

---

### Level 3: Basic LLM (15 min) - REQUIRES API KEY

**What you'll learn:**
- Setting up OpenAI or Anthropic
- First real LLM call
- Prompt engineering basics
- Real cost tracking

**Status:** Coming in Phase 3

**Setup:**
```bash
# Get API key from:
# OpenAI: https://platform.openai.com/api-keys
# Anthropic: https://console.anthropic.com

# Add to .env
OPENAI_API_KEY=sk-your-key-here
# or
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Estimated cost:** ~$0.01-0.05

---

### Level 4: Agent with Tools (20 min) - REQUIRES API KEY

**What you'll learn:**
- Creating custom tools
- Tool calling patterns
- Function calling
- Complex workflows

**Status:** Coming in Phase 3

**Estimated cost:** ~$0.05-0.10

---

### Level 5: Agent with Memory (20 min) - REQUIRES API KEY

**What you'll learn:**
- Short-term memory (session)
- Long-term memory (persistent)
- Context management
- Memory stores

**Status:** Coming in Phase 3

**Estimated cost:** ~$0.05-0.10

---

### Level 6: Production Agent (30 min) - REQUIRES API KEY

**What you'll learn:**
- Error handling
- Retries and fallbacks
- Budget enforcement
- Monitoring
- Production best practices

**Status:** Coming in Phase 3

**Estimated cost:** ~$0.10-0.20

---

## Total Learning Investment

- **Time:** ~2 hours
- **Cost:** ~$0.30-0.50 (for Levels 3-6)
- **Prerequisites:** Basic TypeScript knowledge
- **Reward:** Production-ready AI agent skills

## Getting Your API Keys

### OpenAI

1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Pricing:** ~$0.01-0.03 per 1K tokens (GPT-4)

### Anthropic

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

**Pricing:** ~$0.015-0.075 per 1K tokens (Claude 3)

## Project Structure

```
src/
├── agents/
│   ├── 01-echo/              # Level 1: No LLM
│   │   ├── EchoAgent.ts
│   │   ├── index.ts
│   │   └── README.md
│   ├── 02-mock/              # Level 2: Mock LLM
│   │   ├── MockAgent.ts
│   │   ├── MockLLMProvider.ts
│   │   ├── index.ts
│   │   └── README.md
│   ├── 03-basic-llm/         # Level 3: Real LLM (coming soon)
│   ├── 04-with-tools/        # Level 4: Tools (coming soon)
│   ├── 05-with-memory/       # Level 5: Memory (coming soon)
│   └── 06-production/        # Level 6: Production (coming soon)
└── index.ts                  # Interactive menu
```

## Core Concepts

### Agents

Agents are the core abstraction in Stratix. They process inputs and produce outputs using AI.

```typescript
class MyAgent extends AIAgent<Input, Output> {
  readonly name = 'My Agent';
  readonly version = AgentVersion.create('1.0.0');
  readonly capabilities = [AgentCapability.TEXT_GENERATION];

  async execute(input: Input): Promise<AgentResult<Output>> {
    // Your logic here
  }
}
```

### Orchestrator

The orchestrator manages agent execution, retries, budgets, and audit logging.

```typescript
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  llmProvider,
  options
);

orchestrator.registerAgent(agent);
const result = await orchestrator.executeAgent(agentId, input, context);
```

### LLM Providers

Providers abstract the LLM API (OpenAI, Anthropic, etc.) behind a common interface.

```typescript
// OpenAI
const provider = new OpenAIProvider({ apiKey: '...' });

// Anthropic
const provider = new AnthropicProvider({ apiKey: '...' });

// Mock (for testing)
const provider = new MockLLMProvider({ responses: ['...'] });
```

### Result Pattern

Instead of throwing exceptions, Stratix uses the Result pattern:

```typescript
const result = await agent.execute(input);

if (result.isSuccess()) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Type Safety

All inputs and outputs are strongly typed:

```typescript
interface MyInput {
  message: string;
  context?: string;
}

interface MyOutput {
  response: string;
  confidence: number;
}

class MyAgent extends AIAgent<MyInput, MyOutput> {
  // TypeScript ensures type safety
}
```

## Common Commands

```bash
# Interactive menu
pnpm start

# Run specific example
pnpm run example:echo
pnpm run example:mock

# Build the project
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format code
pnpm format
```

## Tips for Success

1. **Start Simple:** Begin with Level 1 even if you're experienced
2. **Read the READMEs:** Each level has detailed docs in its folder
3. **Experiment:** Modify the code, break things, learn by doing
4. **Use Mock First:** Test with mock provider before using real LLMs
5. **Track Costs:** Set budgets in code to avoid surprise bills
6. **Ask Questions:** Open issues on GitHub if you get stuck

## Troubleshooting

### "Module not found" errors

```bash
pnpm install
```

### "API key not found" errors

Make sure your `.env` file exists and has the correct key:

```bash
cp .env.example .env
# Edit .env with your API key
```

### TypeScript errors

```bash
pnpm typecheck
```

### Examples not running

Make sure you're using Node.js 18 or higher:

```bash
node --version  # Should be >= 18.0.0
```

## Cost Management

### Setting Budgets

```typescript
const context = new AgentContext({ sessionId: '...' });
context.setBudget(1.0); // Max $1

const result = await orchestrator.executeAgent(agentId, input, context);

if (context.isBudgetExceeded()) {
  console.log('Budget exceeded!');
}
```

### Tracking Costs

```typescript
const stats = await auditLog.getStatistics({ agentId });

console.log(`Total cost: $${stats.totalCost}`);
console.log(`Average cost: $${stats.averageCost}`);
console.log(`Total executions: ${stats.totalExecutions}`);
```

### Estimating Costs

Use mock providers first to estimate:

```typescript
const provider = new MockLLMProvider({
  costPerRequest: 0.02  // Real GPT-4 cost
});

// Run your workflow
// Check audit log for total cost
```

## Next Steps

After completing this learning path:

1. **Build Your Own Agent**
   - Use the patterns you learned
   - Start with a simple use case
   - Test with mock provider first

2. **Try Other Templates**
   - `rest-api` - Add AI to REST APIs
   - `microservice` - AI in event-driven architecture
   - `worker` - Background AI processing

3. **Deploy to Production**
   - See deployment guides in main docs
   - Set up monitoring and observability
   - Implement proper error handling

4. **Join the Community**
   - GitHub: https://github.com/stratix-framework
   - Docs: https://stratix.dev
   - Discord: Coming soon

## Resources

### Official Docs
- [Stratix Documentation](https://stratix.dev)
- [AI Agents Guide](https://stratix.dev/docs/ai-agents)
- [API Reference](https://stratix.dev/docs/api-reference)

### LLM Provider Docs
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)

### Learning Resources
- [Prompt Engineering Guide](https://www.promptingguide.ai)
- [LangChain Docs](https://python.langchain.com) (similar concepts)

## Contributing

Found a bug? Have a suggestion? Want to add more examples?

- Open an issue: https://github.com/stratix-framework/stratix/issues
- Submit a PR: https://github.com/stratix-framework/stratix/pulls

Ideas for new examples:
- Code review agent
- Data analysis agent
- Content generation agent
- Translation agent
- Multi-agent workflows

## License

MIT License - See LICENSE file in project root

---

**Ready to start?** Run `pnpm start` and begin your AI agent journey!
