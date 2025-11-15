import { AgentContext } from '@stratix/primitives';
import {
  StratixAgentOrchestrator,
  InMemoryAgentRepository,
  InMemoryExecutionAuditLog,
  InMemoryAgentMemory
} from '@stratix/impl-ai-agents';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
import { CustomerSupportAgent } from './CustomerSupportAgent.js';
import type { SupportTicket, SupportResponse } from './domain/types.js';

/**
 * Customer Support Agent Example
 *
 * Demonstrates advanced features of the Stratix AI Agent framework:
 * - Real LLM integration (OpenAI GPT-4)
 * - Tool usage (knowledge base, customer history)
 * - Structured outputs with Zod validation
 * - Memory management
 * - Cost tracking
 * - Sentiment analysis
 *
 * REQUIREMENTS:
 * - Set OPENAI_API_KEY environment variable
 * - This example makes actual API calls and will incur costs
 */
async function main() {
  console.log('=== Stratix AI Agents: Customer Support Agent Example ===\n');

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENAI_API_KEY environment variable not set');
    console.error('Set it with: export OPENAI_API_KEY=your-key-here');
    process.exit(1);
  }

  // 1. Create infrastructure components
  const repository = new InMemoryAgentRepository();
  const auditLog = new InMemoryExecutionAuditLog();
  const memory = new InMemoryAgentMemory();

  const llmProvider = new OpenAIProvider({
    apiKey
  });

  // 2. Create orchestrator
  const orchestrator = new StratixAgentOrchestrator(
    repository,
    auditLog,
    llmProvider,
    {
      auditEnabled: true,
      budgetEnforcement: true,
      autoRetry: true,
      maxRetries: 2
    }
  );

  // 3. Create and register Customer Support Agent
  const supportAgent = new CustomerSupportAgent(llmProvider);
  supportAgent.setMemory(memory);
  orchestrator.registerAgent(supportAgent);

  console.log(`Registered agent: ${supportAgent.name} v${supportAgent.version.value}`);
  console.log(`Capabilities: ${supportAgent.capabilities.join(', ')}`);
  console.log(`Model: ${supportAgent.model.provider}/${supportAgent.model.model}\n`);

  // 4. Create execution context with budget
  const context = new AgentContext({
    userId: 'agent-user-1',
    sessionId: 'support-session-1',
    environment: 'development',
    metadata: { example: 'customer-support' }
  });

  // Set budget to $1 (should be enough for a few requests)
  context.setBudget(1.00);

  // 5. Test different support scenarios
  const testTickets: SupportTicket[] = [
    {
      ticketId: 'T-001',
      customerId: 'cust-123',
      subject: 'Cannot log in to my account',
      description: 'I forgot my password and the reset email is not arriving',
      priority: 'high',
      category: 'account'
    },
    {
      ticketId: 'T-002',
      customerId: 'cust-456',
      subject: 'Billing question',
      description: 'I was charged twice this month. Can I get a refund?',
      priority: 'medium',
      category: 'billing'
    },
    {
      ticketId: 'T-003',
      customerId: 'cust-789',
      subject: 'Feature request',
      description: 'Can you add dark mode to the application?',
      priority: 'low',
      category: 'feature_request'
    }
  ];

  // Process each ticket
  for (let i = 0; i < testTickets.length; i++) {
    const ticket = testTickets[i];

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Processing Ticket ${i + 1}/${testTickets.length}: ${ticket.ticketId}`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`Subject: ${ticket.subject}`);
    console.log(`Description: ${ticket.description}`);
    console.log(`Priority: ${ticket.priority} | Category: ${ticket.category}\n`);

    try {
      const result = await orchestrator.executeAgent(
        supportAgent.getAgentId(),
        ticket,
        context
      );

      if (result.isSuccess()) {
        const response = result.data as SupportResponse;

        console.log('\n--- Agent Response ---');
        console.log(response.response);
        console.log('\n--- Analysis ---');
        console.log(`Sentiment: ${response.sentiment}`);
        console.log(`Escalate: ${response.escalate ? 'YES' : 'NO'}`);
        console.log(`Suggested Actions: ${response.suggestedActions.join(', ')}`);
        console.log(`Estimated Resolution: ${response.estimatedResolutionTime} hours`);

        console.log('\n--- Execution Metadata ---');
        console.log(`Model: ${result.metadata.model}`);
        console.log(`Tokens: ${result.metadata.totalTokens}`);
        console.log(`Cost: $${result.metadata.cost?.toFixed(4)}`);
        console.log(`Budget Remaining: $${context.getRemainingBudget()?.toFixed(4)}`);

      } else {
        console.error('\nFailed to process ticket:');
        console.error(result.error?.message);
      }

    } catch (error) {
      console.error('\nError processing ticket:', error);
    }

    // Check if budget exceeded
    if (context.isBudgetExceeded()) {
      console.log('\n  Budget exceeded! Stopping execution.');
      break;
    }

    // Small delay between requests
    if (i < testTickets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 6. View overall statistics
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('Overall Statistics');
  console.log(`${'='.repeat(70)}\n`);

  const stats = await auditLog.getStatistics({
    agentId: supportAgent.getAgentId()
  });

  console.log(`Total Executions: ${stats.totalExecutions}`);
  console.log(`Successful: ${stats.successfulExecutions}`);
  console.log(`Failed: ${stats.failedExecutions}`);
  console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
  console.log(`Total Cost: $${stats.totalCost.toFixed(4)}`);
  console.log(`Average Cost per Ticket: $${stats.averageCost.toFixed(4)}`);

  console.log('\n=== Example Complete ===');
}

// Run the example
main().catch(error => {
  console.error('Error running example:', error);
  process.exit(1);
});
