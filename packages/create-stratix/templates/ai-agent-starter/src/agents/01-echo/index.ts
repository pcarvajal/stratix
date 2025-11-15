// @ts-nocheck
import { AgentContext } from '@stratix/primitives';
import {
  StratixAgentOrchestrator,
  InMemoryAgentRepository,
  InMemoryExecutionAuditLog,
} from '@stratix/impl-ai-agents';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
import { EchoAgent, type EchoInput, type EchoOutput } from './EchoAgent.js';

/**
 * Level 1: Echo Agent Example
 *
 * Run this to see the simplest possible agent in action.
 * No API key required!
 */
export async function runEchoExample() {
  console.log('\n=== Level 1: Echo Agent ===\n');
  console.log('This is the simplest possible agent.');
  console.log('- No API key required');
  console.log('- No external dependencies');
  console.log('- Learn agent fundamentals\n');

  // 1. Create infrastructure
  const repository = new InMemoryAgentRepository();
  const auditLog = new InMemoryExecutionAuditLog();

  // Create a dummy LLM provider (not used by Echo Agent)
  const llmProvider = new OpenAIProvider({
    apiKey: 'not-needed-for-echo-agent',
  });

  // 2. Create orchestrator
  const orchestrator = new StratixAgentOrchestrator(repository, auditLog, llmProvider, {
    auditEnabled: true,
    budgetEnforcement: false,
    autoRetry: false,
    maxRetries: 0,
  });

  // 3. Create and register Echo Agent
  const echoAgent = new EchoAgent();
  orchestrator.registerAgent(echoAgent);

  console.log(`Agent: ${echoAgent.name} v${echoAgent.version.value}`);
  console.log(`Capabilities: ${echoAgent.capabilities.join(', ')}\n`);

  // 4. Create execution context
  const context = new AgentContext({
    sessionId: 'echo-example-session',
    environment: 'development',
    metadata: { level: 1, example: 'echo' },
  });

  // 5. Test cases
  const testCases: EchoInput[] = [
    { message: 'Hello, Stratix!' },
    { message: 'How are you?', name: 'Alice' },
    { message: 'Testing the Echo Agent', name: 'Bob' },
    { message: 'This is amazing!' },
  ];

  console.log('--- Running Test Cases ---\n');

  for (let i = 0; i < testCases.length; i++) {
    const input = testCases[i];
    const testNum = i + 1;

    console.log(`Test ${testNum}/${testCases.length}:`);
    console.log(`  Input: "${input.message}"${input.name ? ` (from ${input.name})` : ''}`);

    const startTime = Date.now();
    const result = await orchestrator.executeAgent(echoAgent.getAgentId(), input, context);
    const duration = Date.now() - startTime;

    if (result.isSuccess()) {
      const data = result.data as EchoOutput;
      console.log(`  Output: "${data.response}"`);
      console.log(`  Timestamp: ${data.timestamp.toISOString()}`);
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Cost: $0.00 (no LLM)\n`);
    } else {
      console.log(`  Error: ${result.error?.message}\n`);
    }
  }

  // 6. Show statistics
  console.log('--- Execution Statistics ---\n');
  const stats = await auditLog.getStatistics({
    agentId: echoAgent.getAgentId(),
  });

  console.log(`Total Executions: ${stats.totalExecutions}`);
  console.log(`Successful: ${stats.successfulExecutions}`);
  console.log(`Failed: ${stats.failedExecutions}`);
  console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
  console.log(`Total Cost: $${stats.totalCost.toFixed(4)} (all free!)`);

  // 7. Show execution history
  console.log('\n--- Recent Executions ---\n');
  const history = await auditLog.getAgentHistory(echoAgent.getAgentId(), 3);

  for (const execution of history) {
    const status = execution.success ? '✓' : '✗';
    console.log(
      `${status} [${execution.startTime.toISOString()}] Duration: ${execution.duration}ms`
    );
  }

  console.log('\n=== Level 1 Complete! ===\n');
  console.log('Key Learnings:');
  console.log('1. Agents extend AIAgent<TInput, TOutput>');
  console.log('2. Type-safe inputs and outputs');
  console.log('3. Result pattern (success/failure)');
  console.log('4. Orchestrator manages execution');
  console.log('5. Audit logs track everything\n');
  console.log('Next: Try Level 2 (Mock Agent) to learn testing!\n');
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEchoExample().catch(console.error);
}
