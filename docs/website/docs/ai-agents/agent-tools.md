---
sidebar_position: 4
title: Agent Tools
description: Function calling and tool integration for AI agents
---

# Agent Tools

Enable AI agents to call functions and interact with external systems using tools.

## What are Agent Tools?

Tools allow agents to:
- Call functions in your codebase
- Query databases
- Make API calls
- Perform calculations
- Access external services

## Basic Tool Definition

```typescript
const weatherTool = {
  name: 'get_weather',
  description: 'Get current weather for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name'
      },
      unit: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: 'Temperature unit'
      }
    },
    required: ['location']
  }
};
```

## Agent with Tools

```typescript
export class WeatherAgent extends AIAgent<string, string> {
  readonly name = 'Weather Agent';
  readonly capabilities = [
    AgentCapabilities.TEXT_GENERATION,
    AgentCapabilities.FUNCTION_CALLING
  ];

  protected async execute(input: string): Promise<AgentResult<string>> {
    const response = await this.llmProvider.chat({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: input, timestamp: new Date() }
      ],
      tools: [
        {
          name: 'get_weather',
          description: 'Get current weather',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string' }
            },
            required: ['location']
          }
        }
      ]
    });

    // Handle tool calls
    if (response.toolCalls) {
      const results = await this.executeTools(response.toolCalls);
      
      // Send results back to LLM
      const finalResponse = await this.llmProvider.chat({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: input, timestamp: new Date() },
          { role: 'assistant', content: response.content, timestamp: new Date(), toolCalls: response.toolCalls },
          ...results.map(r => ({
            role: 'tool' as const,
            content: JSON.stringify(r.result),
            toolCallId: r.id,
            timestamp: new Date()
          }))
        ]
      });

      return AgentResult.success(finalResponse.content, finalResponse.usage);
    }

    return AgentResult.success(response.content, response.usage);
  }

  private async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const call of toolCalls) {
      if (call.name === 'get_weather') {
        const args = JSON.parse(call.arguments);
        const weather = await this.getWeather(args.location);
        results.push({
          id: call.id,
          result: weather
        });
      }
    }

    return results;
  }

  private async getWeather(location: string): Promise<any> {
    // Call weather API
    return { temperature: 72, condition: 'sunny' };
  }
}
```

## Multiple Tools

```typescript
const tools = [
  {
    name: 'search_products',
    description: 'Search for products',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        category: { type: 'string' }
      }
    }
  },
  {
    name: 'get_product_details',
    description: 'Get product details',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string' }
      }
    }
  },
  {
    name: 'check_inventory',
    description: 'Check product inventory',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string' }
      }
    }
  }
];
```

## Best Practices

### 1. Clear Tool Descriptions

```typescript
// ✅ Good
description: 'Get current weather for a specific location'

// ❌ Bad
description: 'Weather'
```

### 2. Validate Tool Arguments

```typescript
private async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
  for (const call of toolCalls) {
    const args = JSON.parse(call.arguments);
    
    // Validate
    if (!args.location) {
      throw new Error('Location is required');
    }
    
    // Execute
    const result = await this.getWeather(args.location);
  }
}
```

### 3. Handle Errors

```typescript
try {
  const result = await this.executeTool(call);
  results.push({ id: call.id, result });
} catch (error) {
  results.push({
    id: call.id,
    error: error.message
  });
}
```

## Next Steps

- **[Agent Memory](./agent-memory)** - Conversation history
- **[Agent Orchestration](./agent-orchestration)** - Multi-agent workflows
