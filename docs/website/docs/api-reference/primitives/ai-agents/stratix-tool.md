---
id: stratix-tool
title: StratixTool
sidebar_label: StratixTool
---

# AgentTool

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Base class for AI Agent Tools. Tools are reusable capabilities that agents can invoke during execution. Each tool is an Entity with identity, validation logic, and execution behavior. Tools extend the capabilities of agents beyond text generation.

Tools provide structured actions like database queries, API calls, calculations, or any external operation the agent needs to perform.

**Key Features:**
- Extends Entity (tools have identity)
- Generic input/output types for type safety
- Built-in validation before execution
- Result pattern for error handling
- LLM provider integration (JSON Schema)
- Factory method for quick tool creation
- Composable and reusable across agents

## Import

```typescript
import { AgentTool, EntityId } from '@stratix/primitives';
import type { ToolDefinition } from '@stratix/primitives';
```

## Type Signature

```typescript
abstract class AgentTool<TInput, TOutput> extends Entity<'AgentTool'> {
  abstract readonly name: string;
  abstract readonly description: string;

  abstract getDefinition(): ToolDefinition;
  abstract validate(input: unknown): Result<TInput, DomainError>;
  abstract execute(input: TInput): Promise<Result<TOutput, DomainError>>;

  async run(input: unknown): Promise<Result<TOutput, DomainError>>;
  
  static fromFunctions<TInput, TOutput>(options: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    validate: (input: unknown) => Result<TInput, DomainError>;
    execute: (input: TInput) => Promise<Result<TOutput, DomainError>>;
  }): AgentTool<TInput, TOutput>;
}

interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>; // JSON Schema
}
```

## Usage Examples

### Basic Tool

```typescript
import { AgentTool, EntityId, Result, Success, Failure, DomainError } from '@stratix/primitives';

interface WeatherInput {
  location: string;
}

interface WeatherOutput {
  temperature: number;
  conditions: string;
  humidity: number;
}

class WeatherTool extends AgentTool<WeatherInput, WeatherOutput> {
  readonly name = 'get_weather';
  readonly description = 'Gets current weather for a location';

  constructor(private apiKey: string) {
    super(EntityId.create<'AgentTool'>(), new Date(), new Date());
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City name or coordinates'
          }
        },
        required: ['location']
      }
    };
  }

  validate(input: unknown): Result<WeatherInput, DomainError> {
    if (typeof input !== 'object' || input === null) {
      return Failure.create(
        new DomainError('INVALID_INPUT', 'Input must be an object')
      );
    }

    const { location } = input as any;
    if (typeof location !== 'string' || location.trim().length === 0) {
      return Failure.create(
        new DomainError('INVALID_LOCATION', 'Location must be non-empty string')
      );
    }

    return Success.create({ location: location.trim() });
  }

  async execute(input: WeatherInput): Promise<Result<WeatherOutput, DomainError>> {
    try {
      const response = await fetch(
        `https://api.weather.com/v1?location=${input.location}&key=${this.apiKey}`
      );
      const data = await response.json();

      return Success.create({
        temperature: data.temp,
        conditions: data.conditions,
        humidity: data.humidity
      });
    } catch (error) {
      return Failure.create(
        new DomainError('WEATHER_API_ERROR', `Failed to fetch weather: ${error}`)
      );
    }
  }
}

// Usage
const tool = new WeatherTool('api-key');
const result = await tool.run({ location: 'San Francisco' });

if (result.isSuccess) {
  console.log(`Temperature: ${result.value.temperature}°F`);
  console.log(`Conditions: ${result.value.conditions}`);
}
```

### Quick Tool with fromFunctions

```typescript
const calculatorTool = AgentTool.fromFunctions({
  name: 'calculator',
  description: 'Performs basic arithmetic operations',
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
      a: { type: 'number' },
      b: { type: 'number' }
    },
    required: ['operation', 'a', 'b']
  },
  validate: (input: unknown) => {
    const { operation, a, b } = input as any;
    if (!['add', 'subtract', 'multiply', 'divide'].includes(operation)) {
      return Failure.create(new DomainError('INVALID_OP', 'Invalid operation'));
    }
    if (typeof a !== 'number' || typeof b !== 'number') {
      return Failure.create(new DomainError('INVALID_NUMS', 'Numbers required'));
    }
    return Success.create({ operation, a, b });
  },
  execute: async ({ operation, a, b }) => {
    let result: number;
    switch (operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide':
        if (b === 0) return Failure.create(new DomainError('DIV_ZERO', 'Division by zero'));
        result = a / b;
        break;
    }
    return Success.create({ result });
  }
});
```

### Database Query Tool

```typescript
class DatabaseQueryTool extends AgentTool<
  { query: string; params: unknown[] },
  { rows: unknown[] }
> {
  readonly name = 'database_query';
  readonly description = 'Executes SQL queries';

  constructor(private db: Database) {
    super(EntityId.create<'AgentTool'>(), new Date(), new Date());
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'SQL query to execute' },
          params: { type: 'array', description: 'Query parameters' }
        },
        required: ['query']
      }
    };
  }

  validate(input: unknown): Result<{ query: string; params: unknown[] }, DomainError> {
    const { query, params = [] } = input as any;
    if (typeof query !== 'string') {
      return Failure.create(new DomainError('INVALID_QUERY', 'Query must be string'));
    }
    // Validate safe SQL (no DROP, DELETE without WHERE, etc.)
    if (this.isUnsafeQuery(query)) {
      return Failure.create(new DomainError('UNSAFE_QUERY', 'Query not allowed'));
    }
    return Success.create({ query, params: Array.isArray(params) ? params : [] });
  }

  async execute(input: { query: string; params: unknown[] }): Promise<Result<{ rows: unknown[] }, DomainError>> {
    try {
      const rows = await this.db.query(input.query, input.params);
      return Success.create({ rows });
    } catch (error) {
      return Failure.create(
        new DomainError('QUERY_ERROR', `Database error: ${error}`)
      );
    }
  }

  private isUnsafeQuery(query: string): boolean {
    const unsafe = /\b(DROP|TRUNCATE|DELETE\s+FROM(?!\s+WHERE))\b/i;
    return unsafe.test(query);
  }
}
```

### Registering Tools with Agent

```typescript
class DataAnalysisAgent extends AIAgent<AnalysisRequest, AnalysisResult> {
  private tools: AgentTool<unknown, unknown>[];

  constructor(
    id: EntityId<'AIAgent'>,
    private db: Database
  ) {
    super(id, new Date(), new Date());
    
    // Register tools
    this.tools = [
      new DatabaseQueryTool(db),
      calculatorTool,
      new ChartGeneratorTool()
    ];
  }

  protected async execute(request: AnalysisRequest): Promise<AgentResult<AnalysisResult>> {
    // Agent can use tools during execution
    const queryTool = this.tools.find(t => t.name === 'database_query');
    const calcTool = this.tools.find(t => t.name === 'calculator');

    // Execute query
    const queryResult = await queryTool!.run({
      query: 'SELECT SUM(amount) FROM sales WHERE date > ?',
      params: [request.startDate]
    });

    if (queryResult.isFailure) {
      throw new Error(queryResult.error.message);
    }

    // Process results...
    return {
      output: { /* analysis results */ },
      usage: { tokens: 200, cost: 0.003 },
      metadata: {}
    };
  }

  getToolDefinitions(): ToolDefinition[] {
    return this.tools.map(t => t.getDefinition());
  }
}
```

## Best Practices

- **Do:** Validate all inputs before execution
- **Do:** Return Result types for error handling
- **Do:** Use descriptive names and descriptions
- **Do:** Provide JSON Schema for LLM integration
- **Do:** Keep tools focused (single responsibility)
- **Don't:** Execute side effects in validate()
- **Don't:** Throw exceptions (use Result pattern)
- **Don't:** Allow unsafe operations without validation

## Common Pitfalls

### Pitfall 1: Skipping Validation

**Problem:**
```typescript
async execute(input: unknown): Promise<Result<Output, DomainError>> {
  // BAD: Using input without validation
  const result = await api.call((input as any).param);
}
```

**Solution:**
```typescript
async run(input: unknown): Promise<Result<Output, DomainError>> {
  // Validation happens automatically in run()
  // execute() receives validated input
}
```

### Pitfall 2: Throwing Exceptions

**Problem:**
```typescript
async execute(input: Input): Promise<Result<Output, DomainError>> {
  if (invalid) throw new Error('Invalid'); // BAD
}
```

**Solution:**
```typescript
async execute(input: Input): Promise<Result<Output, DomainError>> {
  if (invalid) return Failure.create(new DomainError('CODE', 'Invalid'));
}
```

## Type Safety

AgentTool provides compile-time type safety:

```typescript
const tool = new WeatherTool('key');

// Type-safe execution
const result = await tool.run({ location: 'NYC' });
if (result.isSuccess) {
  const temp: number = result.value.temperature; // TypeScript knows type
}
```

## Related Components

- [AIAgent](./ai-agent.md) - Agents that use tools
- [Entity](../entity.md) - Parent class
- [Result](../result.md) - Error handling pattern

## See Also

- [Package README](../../../../packages/primitives/README.md)

