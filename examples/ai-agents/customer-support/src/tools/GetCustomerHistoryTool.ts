import { AgentTool } from '@stratix/abstractions';
import type { ToolDefinition } from '@stratix/abstractions';
import { z } from 'zod';
import type { CustomerInteraction } from '../domain/types.js';

const InputSchema = z.object({
  customerId: z.string()
});

const OutputSchema = z.object({
  history: z.array(z.object({
    date: z.date(),
    type: z.string(),
    summary: z.string(),
    resolved: z.boolean()
  }))
});

type Input = z.infer<typeof InputSchema>;
type Output = z.infer<typeof OutputSchema>;

/**
 * Tool for retrieving customer interaction history
 */
export class GetCustomerHistoryTool extends AgentTool<Input, Output> {
  readonly name = 'get_customer_history';
  readonly description = 'Retrieve customer interaction history and past support tickets';

  // Mock customer database
  private customerHistory: Map<string, CustomerInteraction[]> = new Map([
    ['cust-123', [
      {
        date: new Date('2025-10-15'),
        type: 'support_ticket',
        summary: 'Password reset request - resolved',
        resolved: true
      },
      {
        date: new Date('2025-10-20'),
        type: 'billing_inquiry',
        summary: 'Asked about subscription upgrade',
        resolved: true
      }
    ]],
    ['cust-456', [
      {
        date: new Date('2025-10-28'),
        type: 'technical_issue',
        summary: 'Login problems - resolved after cache clear',
        resolved: true
      }
    ]]
  ]);

  async execute(input: Input): Promise<Output> {
    const history = this.customerHistory.get(input.customerId) || [];

    return {
      history: history.map(interaction => ({
        date: interaction.date,
        type: interaction.type,
        summary: interaction.summary,
        resolved: interaction.resolved
      }))
    };
  }

  async validate(input: unknown): Promise<Input> {
    return InputSchema.parse(input);
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          customerId: {
            type: 'string',
            description: 'Customer ID to retrieve history for'
          }
        },
        required: ['customerId']
      }
    };
  }
}
