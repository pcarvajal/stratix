# Echo Agent Example

A simple example demonstrating the Stratix AI Agent framework.

## Overview

The Echo Agent is a minimal agent that:
- Accepts a message and optional name
- Returns a greeting with the echoed message
- Demonstrates basic agent lifecycle and execution
- Doesn't require an LLM API key (no actual AI calls)

## What This Example Demonstrates

- Creating a custom AI agent by extending `AIAgent<TInput, TOutput>`
- Defining agent metadata (name, version, capabilities, model config)
- Implementing the `execute()` method
- Using lifecycle hooks (`beforeExecute`, `afterExecute`)
- Setting up the orchestrator and infrastructure
- Registering and executing agents
- Viewing execution statistics and audit logs

## Running the Example

```bash
# From the project root
cd examples/ai-agents/echo-agent

# Install dependencies (if not already installed)
pnpm install

# Run the example
pnpm start
```

## Expected Output

```
=== Stratix AI Agents: Echo Agent Example ===

Registered agent: Echo Agent v1.0.0
Capabilities: customer_support

--- Test 1: Simple message ---
[EchoAgent] Received message: "Hello, Stratix!"
[EchoAgent] Response generated: "Hello! You said: Hello, Stratix!"
Response: Hello! You said: Hello, Stratix!
Timestamp: 2025-11-05T...

--- Test 2: Message with name ---
[EchoAgent] Received message: "How are you?"
[EchoAgent] Response generated: "Hello Alice! You said: How are you?"
Response: Hello Alice! You said: How are you?

--- Test 3: Multiple messages ---
- Hello Bob! You said: Good morning!
- Hello Charlie! You said: Testing the agent
- Hello! You said: This is amazing!

--- Execution Statistics ---
Total executions: 5
Successful: 5
Failed: 0
Average duration: 100.00ms
Total cost: $0.0000

--- Agent History ---
Last 3 executions:
- [2025-11-05T...] SUCCESS - Duration: 100ms
- [2025-11-05T...] SUCCESS - Duration: 100ms
- [2025-11-05T...] SUCCESS - Duration: 100ms

=== Example Complete ===
```

## Code Structure

```
echo-agent/
├── src/
│   ├── EchoAgent.ts    # Agent implementation
│   └── index.ts         # Example runner
├── package.json
├── tsconfig.json
└── README.md
```

## Key Concepts

### 1. Agent Definition

```typescript
export class EchoAgent extends AIAgent<EchoInput, EchoOutput> {
  readonly name = 'Echo Agent';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapability.CUSTOMER_SUPPORT];

  async execute(input: EchoInput): Promise<AgentResult<EchoOutput>> {
    // Implementation
  }
}
```

### 2. Type-Safe Inputs and Outputs

```typescript
interface EchoInput {
  message: string;
  name?: string;
}

interface EchoOutput {
  response: string;
  originalMessage: string;
  timestamp: Date;
}
```

### 3. Orchestrator Setup

```typescript
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  llmProvider,
  { auditEnabled: true, budgetEnforcement: false, ... }
);

orchestrator.registerAgent(echoAgent);
```

### 4. Agent Execution

```typescript
const context = new AgentContext({
  sessionId: 'session-id',
  environment: 'development'
});

const result = await orchestrator.executeAgent(
  agentId,
  { message: 'Hello!' },
  context
);
```

## Next Steps

After understanding this example:
1. Try the **Customer Support Agent** example for a real LLM integration
2. Learn about tools and function calling
3. Explore multi-agent orchestration
4. Add memory and context management

## Related Examples

- **customer-support-agent**: Full agent with LLM integration and tools
- **data-analysis-agent**: Agent with SQL and visualization tools (coming soon)
