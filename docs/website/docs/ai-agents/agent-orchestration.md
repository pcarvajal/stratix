---
sidebar_position: 6
title: Agent Orchestration
description: Multi-agent workflows and coordination
---

# Agent Orchestration

Coordinate multiple AI agents to solve complex problems.

## Agent Orchestrator

```typescript
import { StratixAgentOrchestrator } from '@stratix/runtime';

const orchestrator = new StratixAgentOrchestrator();

// Register agents
orchestrator.registerAgent('support', supportAgent);
orchestrator.registerAgent('sales', salesAgent);
orchestrator.registerAgent('technical', technicalAgent);
```

## Routing Strategies

### Intent-Based Routing

```typescript
const result = await orchestrator.route(userInput, {
  strategy: 'intent-based',
  fallback: 'support'
});
```

### Sequential Workflow

```typescript
// Agent 1 → Agent 2 → Agent 3
const step1 = await agent1.run(input);
const step2 = await agent2.run(step1.output);
const step3 = await agent3.run(step2.output);
```

### Parallel Execution

```typescript
const [result1, result2, result3] = await Promise.all([
  agent1.run(input),
  agent2.run(input),
  agent3.run(input)
]);
```

## Multi-Agent Example

```typescript
export class CustomerServiceOrchestrator {
  constructor(
    private supportAgent: SupportAgent,
    private salesAgent: SalesAgent,
    private technicalAgent: TechnicalAgent
  ) {}

  async handle(query: string): Promise<string> {
    // Classify intent
    const intent = await this.classifyIntent(query);

    // Route to appropriate agent
    switch (intent) {
      case 'support':
        return (await this.supportAgent.run(query)).output;
      case 'sales':
        return (await this.salesAgent.run(query)).output;
      case 'technical':
        return (await this.technicalAgent.run(query)).output;
      default:
        return (await this.supportAgent.run(query)).output;
    }
  }

  private async classifyIntent(query: string): Promise<string> {
    // Use classifier agent or simple rules
    if (query.includes('buy') || query.includes('price')) {
      return 'sales';
    }
    if (query.includes('error') || query.includes('bug')) {
      return 'technical';
    }
    return 'support';
  }
}
```

## Best Practices

### 1. Clear Agent Responsibilities

```typescript
// ✅ Good: Specialized agents
supportAgent  // Customer support
salesAgent    // Sales inquiries
technicalAgent // Technical issues

// ❌ Bad: Generic agent
generalAgent  // Does everything
```

### 2. Handle Failures

```typescript
const result = await agent1.run(input);

if (result.isFailure) {
  // Fallback to another agent
  return await fallbackAgent.run(input);
}
```

### 3. Track Costs

```typescript
let totalCost = 0;
for (const result of results) {
  totalCost += result.metadata.cost;
}
console.log('Total cost:', totalCost);
```

## Next Steps

- **[Agent Testing](./agent-testing)** - Testing strategies
- **[Creating Agents](./creating-agents)** - Build agents
