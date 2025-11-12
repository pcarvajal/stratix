import { AgentContext } from '@stratix/primitives';
import {
  StratixAgentOrchestrator,
  InMemoryAgentRepository,
  InMemoryExecutionAuditLog
} from '@stratix/impl-ai-agents';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
import { EchoAgent, type EchoOutput } from './EchoAgent.js';

/**
 * Echo Agent Example
 *
 * Demonstrates basic usage of the Stratix AI Agent framework.
 * This example doesn't require an API key since it doesn't call an LLM.
 */
async function main() {
  console.log('=== Stratix AI Agents: Echo Agent Example ===\n');

  // 1. Create infrastructure components
  const repository = new InMemoryAgentRepository();
  const auditLog = new InMemoryExecutionAuditLog();

  // Create a dummy LLM provider (not used by Echo Agent)
  const llmProvider = new OpenAIProvider({
    apiKey: 'not-needed-for-echo-agent'
  });

  // 2. Create orchestrator
  const orchestrator = new StratixAgentOrchestrator(
    repository,
    auditLog,
    llmProvider,
    {
      auditEnabled: true,
      budgetEnforcement: false,
      autoRetry: false,
      maxRetries: 0
    }
  );

  // 3. Create and register Echo Agent
  const echoAgent = new EchoAgent();
  orchestrator.registerAgent(echoAgent);

  console.log(`Registered agent: ${echoAgent.name} v${echoAgent.version.value}`);
  console.log(`Capabilities: ${echoAgent.capabilities.join(', ')}\n`);

  // 4. Create execution context
  const context = new AgentContext({
    sessionId: 'example-session-1',
    environment: 'development',
    metadata: { example: 'echo-agent' }
  });

  // 5. Execute agent with different inputs
  console.log('--- Test 1: Simple message ---');
  const result1 = await orchestrator.executeAgent(
    echoAgent.getAgentId(),
    { message: 'Hello, Stratix!' },
    context
  );

  if (result1.isSuccess()) {
    const data = result1.data as EchoOutput;
    console.log(`Response: ${data.response}`);
    console.log(`Timestamp: ${data.timestamp.toISOString()}`);
  }

  console.log('\n--- Test 2: Message with name ---');
  const result2 = await orchestrator.executeAgent(
    echoAgent.getAgentId(),
    { message: 'How are you?', name: 'Alice' },
    context
  );

  if (result2.isSuccess()) {
    const data = result2.data as EchoOutput;
    console.log(`Response: ${data.response}`);
  }

  console.log('\n--- Test 3: Multiple messages ---');
  const messages = [
    { message: 'Good morning!', name: 'Bob' },
    { message: 'Testing the agent', name: 'Charlie' },
    { message: 'This is amazing!' }
  ];

  for (const input of messages) {
    const result = await orchestrator.executeAgent(
      echoAgent.getAgentId(),
      input,
      context
    );

    if (result.isSuccess()) {
      const data = result.data as EchoOutput;
      console.log(`- ${data.response}`);
    }
  }

  // 6. View execution statistics
  console.log('\n--- Execution Statistics ---');
  const stats = await auditLog.getStatistics({});
  console.log(`Total executions: ${stats.totalExecutions}`);
  console.log(`Successful: ${stats.successfulExecutions}`);
  console.log(`Failed: ${stats.failedExecutions}`);
  console.log(`Average duration: ${stats.averageDuration.toFixed(2)}ms`);
  console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);

  // 7. View agent history
  console.log('\n--- Agent History ---');
  const history = await auditLog.getAgentHistory(echoAgent.getAgentId(), 3);
  console.log(`Last ${history.length} executions:`);

  for (const execution of history) {
    console.log(`- [${execution.startTime.toISOString()}] ${execution.success ? 'SUCCESS' : 'FAILED'} - Duration: ${execution.duration}ms`);
  }

  console.log('\n=== Example Complete ===');
}

// Run the example
main().catch(error => {
  console.error('Error running example:', error);
  process.exit(1);
});
