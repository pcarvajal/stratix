---
sidebar_position: 2
title: Creating Agents
description: Build your first AI agent with Stratix
---

# Creating Agents

Learn how to create production-ready AI agents using Stratix's `AIAgent` base class.

## Basic Agent Structure

```typescript
import { AIAgent, AgentResult, AgentCapabilities, AgentVersionFactory, EntityId } from '@stratix/core';
import type { LLMProvider } from '@stratix/core';

export class MyAgent extends AIAgent<InputType, OutputType> {
  // Required metadata
  readonly name = 'My Agent';
  readonly description = 'What this agent does';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.TEXT_GENERATION];
  
  // Model configuration
  readonly model = {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 1000
  };

  constructor(private llmProvider: LLMProvider) {
    super(EntityId.create<'AIAgent'>(), new Date(), new Date());
  }

  // Implement execution logic
  protected async execute(input: InputType): Promise<AgentResult<OutputType>> {
    // Your agent logic here
  }
}
```

## Complete Example: Customer Support Agent

```typescript
import { AIAgent, AgentResult, AgentCapabilities, AgentVersionFactory } from '@stratix/core';

interface SupportQuery {
  question: string;
  customerTier: 'free' | 'premium' | 'enterprise';
  previousInteractions?: number;
}

interface SupportResponse {
  answer: string;
  confidence: number;
  suggestedActions: string[];
}

export class CustomerSupportAgent extends AIAgent<SupportQuery, SupportResponse> {
  readonly name = 'Customer Support Agent';
  readonly description = 'Provides customer support responses with contextual awareness';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.TEXT_GENERATION];
  
  readonly model = {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 500
  };

  constructor(private llmProvider: LLMProvider) {
    super(EntityId.create<'AIAgent'>(), new Date(), new Date());
  }

  protected async execute(input: SupportQuery): Promise<AgentResult<SupportResponse>> {
    // Build context-aware prompt
    const systemPrompt = this.buildSystemPrompt(input.customerTier);
    const userPrompt = this.buildUserPrompt(input);

    // Call LLM
    const response = await this.llmProvider.chat({
      model: this.model.model,
      messages: [
        { role: 'system', content: systemPrompt, timestamp: new Date() },
        { role: 'user', content: userPrompt, timestamp: new Date() }
      ],
      temperature: this.model.temperature,
      maxTokens: this.model.maxTokens
    });

    // Parse and structure response
    const structuredResponse = this.parseResponse(response.content);

    return AgentResult.success(structuredResponse, {
      model: response.model,
      totalTokens: response.usage.totalTokens,
      cost: this.llmProvider.calculateCost(this.model.model, response.usage)
    });
  }

  private buildSystemPrompt(tier: string): string {
    const baseTone = 'You are a helpful customer support agent.';
    
    switch (tier) {
      case 'enterprise':
        return `${baseTone} Provide detailed, technical responses with priority support.`;
      case 'premium':
        return `${baseTone} Provide thorough responses with helpful suggestions.`;
      default:
        return `${baseTone} Provide clear, concise responses.`;
    }
  }

  private buildUserPrompt(input: SupportQuery): string {
    let prompt = `Question: ${input.question}`;
    
    if (input.previousInteractions) {
      prompt += `\n\nNote: Customer has ${input.previousInteractions} previous interactions.`;
    }
    
    return prompt;
  }

  private parseResponse(content: string): SupportResponse {
    // Parse LLM response into structured format
    return {
      answer: content,
      confidence: 0.85,
      suggestedActions: ['Check documentation', 'Contact support']
    };
  }
}
```

## Agent Metadata

### Name and Description

```typescript
readonly name = 'Product Recommendation Agent';
readonly description = 'Analyzes user preferences and recommends products';
```

### Versioning

```typescript
import { AgentVersionFactory } from '@stratix/core';

readonly version = AgentVersionFactory.create('1.2.0');
```

Version changes when:
- **Major** (1.x.x → 2.x.x): Breaking changes in input/output
- **Minor** (x.1.x → x.2.x): New features, backwards compatible
- **Patch** (x.x.1 → x.x.2): Bug fixes

### Capabilities

```typescript
readonly capabilities = [
  AgentCapabilities.TEXT_GENERATION,
  AgentCapabilities.FUNCTION_CALLING
];
```

## Model Configuration

```typescript
readonly model = {
  provider: 'openai',      // or 'anthropic', 'custom'
  model: 'gpt-4o',         // Specific model
  temperature: 0.7,        // 0.0 = deterministic, 1.0 = creative
  maxTokens: 1000,         // Maximum response length
  topP: 0.9,              // Optional: nucleus sampling
  frequencyPenalty: 0,    // Optional: reduce repetition
  presencePenalty: 0      // Optional: encourage new topics
};
```

## Error Handling

```typescript
protected async execute(input: InputType): Promise<AgentResult<OutputType>> {
  try {
    const response = await this.llmProvider.chat({...});
    return AgentResult.success(output, metadata);
  } catch (error) {
    if (error instanceof LLMProviderError) {
      return AgentResult.failure(
        new AgentExecutionError('LLM provider failed', error)
      );
    }
    return AgentResult.failure(error);
  }
}
```

## Streaming Responses

```typescript
export class StreamingAgent extends AIAgent<string, string> {
  async *stream(input: string): AsyncGenerator<string> {
    const stream = this.llmProvider.streamChat({
      model: this.model.model,
      messages: [
        { role: 'user', content: input, timestamp: new Date() }
      ]
    });

    for await (const chunk of stream) {
      yield chunk.content;
    }
  }
}

// Usage
for await (const chunk of agent.stream('Tell me a story')) {
  process.stdout.write(chunk);
}
```

## Testing Agents

```typescript
import { MockLLMProvider } from '@stratix/testing';

describe('CustomerSupportAgent', () => {
  let agent: CustomerSupportAgent;
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider({
      responses: [
        'To reset your password, click "Forgot Password" on the login page.'
      ]
    });
    agent = new CustomerSupportAgent(mockProvider);
  });

  it('should provide password reset instructions', async () => {
    const result = await agent.run({
      question: 'How do I reset my password?',
      customerTier: 'free'
    });

    expect(result.isSuccess).toBe(true);
    expect(result.output.answer).toContain('Forgot Password');
  });

  it('should track token usage', async () => {
    const result = await agent.run({
      question: 'Test question',
      customerTier: 'premium'
    });

    expect(result.metadata.totalTokens).toBeGreaterThan(0);
    expect(result.metadata.cost).toBeGreaterThan(0);
  });
});
```

## Best Practices

### 1. Use Descriptive Names

```typescript
// ✅ Good
readonly name = 'Customer Support Agent';

// ❌ Bad
readonly name = 'Agent1';
```

### 2. Version Your Agents

```typescript
readonly version = AgentVersionFactory.create('1.0.0');
```

### 3. Handle Errors Gracefully

```typescript
try {
  const response = await this.llmProvider.chat({...});
  return AgentResult.success(output, metadata);
} catch (error) {
  return AgentResult.failure(error);
}
```

### 4. Structure Your Output

```typescript
// ✅ Good: Structured output
interface ProductRecommendation {
  productId: string;
  reason: string;
  confidence: number;
}

// ❌ Bad: Unstructured string
type Output = string;
```

### 5. Test with Mocks

```typescript
const mockProvider = new MockLLMProvider({
  responses: ['Expected response']
});
```

## Next Steps

- **[LLM Providers](./llm-providers)** - OpenAI, Anthropic, custom providers
- **[Agent Tools](./agent-tools)** - Function calling
- **[Agent Memory](./agent-memory)** - Conversation history
- **[Agent Testing](./agent-testing)** - Testing strategies
