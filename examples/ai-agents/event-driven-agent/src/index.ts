import {
  AIAgent,
  AgentResult,
  AgentContext,
  EntityId,
  AgentVersionFactory,
  AgentCapabilities,
  type AIAgentEvent,
  type ModelConfig,
  type DomainEvent,
} from '@stratix/primitives';

/**
 * Simple in-memory event bus for demonstration
 */
class InMemoryEventBus {
  private handlers: Array<(event: DomainEvent) => void> = [];

  subscribe(handler: (event: DomainEvent) => void): void {
    this.handlers.push(handler);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const handler of this.handlers) {
        handler(event);
      }
    }
  }
}

/**
 * Audit log service that records all agent activities
 */
class AuditLogService {
  private logs: Array<{
    timestamp: Date;
    eventType: string;
    agentId: string;
    agentName: string;
    details: any;
  }> = [];

  handleEvent(event: DomainEvent): void {
    const aiEvent = event as AIAgentEvent;
    this.logs.push({
      timestamp: aiEvent.occurredAt,
      eventType: aiEvent.eventType,
      agentId: aiEvent.agentId,
      agentName: aiEvent.agentName,
      details: aiEvent,
    });
  }

  printLogs(): void {
    console.log('\n=== AUDIT LOG ===');
    console.log('Total entries:', this.logs.length);
    this.logs.forEach((log, index) => {
      console.log(`\n[${index + 1}] ${log.timestamp.toISOString()}`);
      console.log(`  Event: ${log.eventType}`);
      console.log(`  Agent: ${log.agentName} (${log.agentId})`);

      switch (log.eventType) {
        case 'AgentExecutionStarted':
          console.log(`  Input:`, log.details.input);
          break;
        case 'AgentExecutionCompleted':
          console.log(`  Duration: ${log.details.durationMs}ms`);
          console.log(`  Tokens: ${log.details.tokensUsed || 'N/A'}`);
          console.log(`  Cost: $${log.details.cost || 'N/A'}`);
          break;
        case 'AgentExecutionFailed':
          console.log(`  Error: ${log.details.error}`);
          console.log(`  Duration: ${log.details.durationMs}ms`);
          break;
        case 'AgentToolUsed':
          console.log(`  Tool: ${log.details.toolName}`);
          console.log(`  Arguments:`, log.details.toolArguments);
          break;
      }
    });
  }
}

/**
 * Metrics collector service
 */
class MetricsCollector {
  private metrics = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalDuration: 0,
    totalTokens: 0,
    totalCost: 0,
    toolUsage: new Map<string, number>(),
  };

  handleEvent(event: DomainEvent): void {
    const aiEvent = event as AIAgentEvent;
    switch (aiEvent.eventType) {
      case 'AgentExecutionStarted':
        this.metrics.totalExecutions++;
        break;

      case 'AgentExecutionCompleted':
        this.metrics.successfulExecutions++;
        this.metrics.totalDuration += aiEvent.durationMs;
        if (aiEvent.tokensUsed) {
          this.metrics.totalTokens += aiEvent.tokensUsed;
        }
        if (aiEvent.cost) {
          this.metrics.totalCost += aiEvent.cost;
        }
        break;

      case 'AgentExecutionFailed':
        this.metrics.failedExecutions++;
        this.metrics.totalDuration += aiEvent.durationMs;
        break;

      case 'AgentToolUsed':
        const count = this.metrics.toolUsage.get(aiEvent.toolName) || 0;
        this.metrics.toolUsage.set(aiEvent.toolName, count + 1);
        break;
    }
  }

  printMetrics(): void {
    console.log('\n=== METRICS ===');
    console.log(`Total Executions: ${this.metrics.totalExecutions}`);
    console.log(`Successful: ${this.metrics.successfulExecutions}`);
    console.log(`Failed: ${this.metrics.failedExecutions}`);
    console.log(
      `Average Duration: ${(this.metrics.totalDuration / this.metrics.totalExecutions).toFixed(2)}ms`
    );
    console.log(`Total Tokens: ${this.metrics.totalTokens}`);
    console.log(`Total Cost: $${this.metrics.totalCost.toFixed(4)}`);

    if (this.metrics.toolUsage.size > 0) {
      console.log('\nTool Usage:');
      this.metrics.toolUsage.forEach((count, toolName) => {
        console.log(`  - ${toolName}: ${count} times`);
      });
    }
  }
}

/**
 * Simple customer support agent that demonstrates domain events
 */
class CustomerSupportAgent extends AIAgent<
  { query: string },
  { response: string; sentiment: string }
> {
  readonly name = 'Customer Support Agent';
  readonly description = 'Handles customer support queries with domain event tracking';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [
    AgentCapabilities.CUSTOMER_SUPPORT,
    AgentCapabilities.SENTIMENT_ANALYSIS,
  ];
  readonly model: ModelConfig = {
    provider: 'mock',
    model: 'mock-model',
    temperature: 0.7,
    maxTokens: 500,
  };

  constructor(id: EntityId<'AIAgent'>, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
  }

  protected async execute(input: {
    query: string;
  }): Promise<AgentResult<{ response: string; sentiment: string }>> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate tool usage for sentiment analysis
    const sentiment = await this.analyzeSentiment(input.query);

    // Record tool usage event
    this.recordToolUsage('sentiment_analyzer', { text: input.query }, { sentiment });

    // Simulate tool usage for knowledge base search
    const articles = await this.searchKnowledgeBase(input.query);

    // Record tool usage event
    this.recordToolUsage('knowledge_base', { query: input.query }, { articles });

    // Generate response
    const response = this.generateResponse(input.query, sentiment, articles);

    // Return result with metadata
    return AgentResult.success(
      { response, sentiment },
      {
        model: this.model.model,
        duration: 100,
        totalTokens: 150,
        cost: 0.0015,
      }
    );
  }

  private async analyzeSentiment(_text: string): Promise<string> {
    // Mock sentiment analysis
    const sentiments = ['positive', 'neutral', 'negative'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  private async searchKnowledgeBase(_query: string): Promise<string[]> {
    // Mock knowledge base search
    return ['Article 1: How to reset password', 'Article 2: Billing FAQ'];
  }

  private generateResponse(query: string, sentiment: string, articles: string[]): string {
    return `Thank you for your inquiry about "${query}". Based on our knowledge base, here are some helpful resources: ${articles.join(', ')}. Your inquiry has been noted with ${sentiment} sentiment.`;
  }
}

/**
 * Agent that intentionally fails to demonstrate error events
 */
class FailingAgent extends CustomerSupportAgent {
  protected async execute(): Promise<AgentResult<{ response: string; sentiment: string }>> {
    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Throw an error to demonstrate failed execution events
    throw new Error('Simulated failure for demonstration');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Event-Driven AI Agent Example ===\n');
  console.log('This example demonstrates how AI Agents emit domain events');
  console.log('following DDD patterns with the Aggregate Root pattern.\n');

  // Setup event bus and subscribers
  const eventBus = new InMemoryEventBus();
  const auditLog = new AuditLogService();
  const metrics = new MetricsCollector();

  // Subscribe services to events
  eventBus.subscribe(event => auditLog.handleEvent(event));
  eventBus.subscribe(event => metrics.handleEvent(event));

  // Create agent
  const agent = new CustomerSupportAgent(
    EntityId.create<'AIAgent'>(),
    new Date(),
    new Date()
  );

  // Create context for traceability
  const context = new AgentContext({
    userId: 'user-123',
    sessionId: 'session-abc-001',
    environment: 'production',
    metadata: { channel: 'web', department: 'support' },
  });
  agent.setContext(context);

  console.log('Agent created:', agent.name);
  console.log('Agent ID:', agent.getAgentId().value);
  console.log('Version:', agent.version.value);
  console.log('Context:', context.sessionId, '\n');

  // Example 1: Successful execution
  console.log('--- Example 1: Successful Execution ---');
  const result1 = await agent.executeWithEvents({
    query: 'How do I reset my password?',
  });

  let events = agent.pullDomainEvents();
  await eventBus.publish(events);

  console.log('Result:', result1.data);
  console.log('Events emitted:', events.length);

  // Example 2: Another successful execution
  console.log('\n--- Example 2: Another Query ---');
  const result2 = await agent.executeWithEvents({
    query: 'What are your business hours?',
  });

  events = agent.pullDomainEvents();
  await eventBus.publish(events);

  console.log('Result:', result2.data);
  console.log('Events emitted:', events.length);

  // Example 3: Failed execution
  console.log('\n--- Example 3: Failed Execution ---');
  const failingAgent = new FailingAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
  failingAgent.setContext(context);

  try {
    await failingAgent.executeWithEvents({
      query: 'This will fail',
    });
  } catch (error) {
    console.log('Execution failed as expected:', (error as Error).message);
  }

  events = failingAgent.pullDomainEvents();
  await eventBus.publish(events);
  console.log('Events emitted:', events.length);

  // Print audit log
  auditLog.printLogs();

  // Print metrics
  metrics.printMetrics();

  console.log('\n=== Summary ===');
  console.log('This example demonstrated:');
  console.log('1. Automatic domain event recording for all agent operations');
  console.log('2. Publishing events to an event bus');
  console.log('3. Multiple subscribers consuming the same events');
  console.log('4. Audit logging for compliance');
  console.log('5. Metrics collection for observability');
  console.log('6. Tool usage tracking');
  console.log('7. Error handling and failed execution tracking');
  console.log('\nThis is what makes Stratix different from other LLM wrappers:');
  console.log('AI Agents are first-class citizens in DDD architecture.');
}

main().catch(console.error);
