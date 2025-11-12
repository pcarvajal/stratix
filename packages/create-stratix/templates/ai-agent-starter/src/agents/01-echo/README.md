# Level 1: Echo Agent

## Overview

The Echo Agent is the simplest possible AI agent in Stratix. It demonstrates core concepts without requiring an LLM or API key.

## What You'll Learn

1. **Agent Structure**
   - How to extend `AIAgent<TInput, TOutput>`
   - Required properties: name, version, capabilities
   - Input/output type safety

2. **Agent Lifecycle**
   - Creating an agent instance
   - Registering with the orchestrator
   - Executing the agent
   - Handling results

3. **Type Safety**
   - Defining input and output interfaces
   - TypeScript generics for type-safe execution
   - Result pattern (success/failure)

4. **No External Dependencies**
   - No LLM required
   - No API key needed
   - Runs completely offline
   - Zero cost

## Key Concepts

### Agent ID
Every agent has a unique `AgentId` generated at creation:
```typescript
const agentId = AgentId.create();
super(agentId);
```

### Version
Agents are versioned using semantic versioning:
```typescript
this.version = AgentVersion.create('1.0.0');
```

### Capabilities
Agents declare what they can do:
```typescript
readonly capabilities = [AgentCapability.TEXT_GENERATION];
```

### Execute Method
The core of every agent:
```typescript
async execute(input: EchoInput): Promise<AgentResult<EchoOutput>> {
  // Your logic here
  return AgentResult.success(output);
}
```

### Result Pattern
Stratix uses the Result pattern instead of throwing exceptions:
```typescript
// Success
return AgentResult.success({ response: '...' });

// Failure
return AgentResult.failure(new Error('Something went wrong'));
```

## Running the Example

From the project root:
```bash
pnpm run example:echo
```

Or run the interactive menu:
```bash
pnpm start
# Select "1. Echo Agent"
```

## What It Does

1. Takes a message and optional name
2. Echoes back the message with a greeting
3. Returns timestamp and agent name
4. Logs execution to audit log

## Example Output

```
=== Level 1: Echo Agent ===

This is the simplest possible agent.
- No API key required
- No external dependencies
- Learn agent fundamentals

Input: Hello, Stratix!

Output:
  Response: "Hello! You said: "Hello, Stratix!""
  Timestamp: 2024-01-15T10:30:00.000Z
  Processed by: Echo Agent

Execution completed in 2ms
Cost: $0.00 (no LLM used)
```

## Exercises

Try modifying the agent:

1. **Add a counter**
   ```typescript
   private executionCount = 0;

   async execute(input: EchoInput) {
     this.executionCount++;
     // Include count in response
   }
   ```

2. **Add message transformation**
   ```typescript
   // Convert to uppercase
   const response = input.message.toUpperCase();
   ```

3. **Add validation rules**
   ```typescript
   // Reject messages longer than 100 chars
   if (input.message.length > 100) {
     return AgentResult.failure(new Error('Message too long'));
   }
   ```

4. **Add metadata**
   ```typescript
   interface EchoOutput {
     response: string;
     timestamp: Date;
     processedBy: string;
     messageLength: number;  // Add this
     hasName: boolean;        // Add this
   }
   ```

## Next Steps

Once you understand Echo Agent, move to Level 2:
- **Mock Agent** - Learn testing with mock LLM providers
- See `../02-mock/README.md`

## Questions?

Common questions about this level:

**Q: Why no LLM?**
A: This level focuses on fundamentals. LLMs come in Level 3.

**Q: Is this production-ready?**
A: The pattern is, but real agents need LLMs for intelligence.

**Q: Can I deploy this?**
A: Yes, but it won't be very useful without an LLM.

**Q: What's next?**
A: Move to Level 2 to learn testing, then Level 3 for real LLM integration.
