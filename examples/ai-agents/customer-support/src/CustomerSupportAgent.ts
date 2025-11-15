import {
  AIAgent,
  AgentResult,
  AgentCapabilities,
  AgentVersionFactory,
  EntityId,
} from '@stratix/primitives';
import type { ModelConfig, AgentMessage } from '@stratix/primitives';
import type { LLMProvider } from '@stratix/abstractions';
import type { SupportTicket, SupportResponse } from './domain/types.js';
import { SupportResponseSchema } from './domain/types.js';
import { SearchKnowledgeBaseTool } from './tools/SearchKnowledgeBaseTool.js';
import { GetCustomerHistoryTool } from './tools/GetCustomerHistoryTool.js';

/**
 * Customer Support Agent that handles support tickets with AI.
 *
 * Features:
 * - Searches knowledge base for solutions
 * - Reviews customer history for context
 * - Generates empathetic, helpful responses
 * - Performs sentiment analysis
 * - Recommends escalation when needed
 *
 * @example
 * ```typescript
 * const agent = new CustomerSupportAgent(llmProvider);
 *
 * const result = await agent.execute({
 *   ticketId: 'T-123',
 *   customerId: 'cust-456',
 *   subject: 'Cannot log in',
 *   description: 'I forgot my password',
 *   priority: 'medium',
 *   category: 'account'
 * });
 * ```
 */
export class CustomerSupportAgent extends AIAgent<SupportTicket, SupportResponse> {
  readonly name = 'Customer Support Agent';
  readonly description = 'Handles customer support tickets with intelligent, empathetic responses';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [
    AgentCapabilities.CUSTOMER_SUPPORT,
    AgentCapabilities.KNOWLEDGE_RETRIEVAL,
    AgentCapabilities.SENTIMENT_ANALYSIS,
  ];
  readonly model: ModelConfig = {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
  };

  private knowledgeBaseTool: SearchKnowledgeBaseTool;
  private customerHistoryTool: GetCustomerHistoryTool;

  constructor(private llmProvider: LLMProvider) {
    const id = EntityId.create<'AIAgent'>();
    const now = new Date();
    super(id, now, now);

    this.knowledgeBaseTool = new SearchKnowledgeBaseTool();
    this.customerHistoryTool = new GetCustomerHistoryTool();
  }

  async execute(ticket: SupportTicket): Promise<AgentResult<SupportResponse>> {
    try {
      // 1. Get customer history for context
      const historyInput = await this.customerHistoryTool.validate({
        customerId: ticket.customerId,
      });
      const customerHistory = await this.customerHistoryTool.execute(historyInput);

      this.remember('customerHistory', customerHistory);

      // 2. Search knowledge base
      const kbInput = await this.knowledgeBaseTool.validate({
        query: `${ticket.subject} ${ticket.description}`,
      });
      const knowledgeArticles = await this.knowledgeBaseTool.execute(kbInput);

      this.remember('knowledgeArticles', knowledgeArticles);

      // 3. Build prompt with context
      const systemPrompt = this.buildSystemPrompt(customerHistory, knowledgeArticles);
      const userPrompt = this.buildUserPrompt(ticket);

      const messages: AgentMessage[] = [
        {
          role: 'system',
          content: systemPrompt,
          timestamp: new Date(),
        },
        {
          role: 'user',
          content: userPrompt,
          timestamp: new Date(),
        },
      ];

      // 4. Call LLM with structured output
      const response = await this.llmProvider.chat({
        model: this.model.model,
        messages,
        temperature: this.model.temperature,
        maxTokens: this.model.maxTokens,
        responseFormat: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              response: { type: 'string' },
              sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
              suggestedActions: { type: 'array', items: { type: 'string' } },
              escalate: { type: 'boolean' },
              estimatedResolutionTime: { type: 'number' },
            },
            required: ['response', 'sentiment', 'suggestedActions', 'escalate', 'estimatedResolutionTime'],
          },
        },
      });

      // 5. Parse and validate response
      const parsedResponse = SupportResponseSchema.parse(JSON.parse(response.content));

      // 6. Record cost
      if (this.currentContext) {
        this.currentContext.recordCost({
          provider: 'openai',
          model: this.model.model,
          inputTokens: response.usage.promptTokens,
          outputTokens: response.usage.completionTokens,
          cost: this.calculateCost(response.usage),
        });
      }

      return AgentResult.success(parsedResponse, {
        model: this.model.model,
        totalTokens: response.usage.totalTokens,
        cost: this.calculateCost(response.usage),
      });
    } catch (error) {
      return AgentResult.failure(error as Error, {
        model: this.model.model,
        stage: 'execution',
      });
    }
  }

  protected async beforeExecute(ticket: SupportTicket): Promise<void> {
    console.log(`[CustomerSupportAgent] Processing ticket ${ticket.ticketId}`);
    console.log(`Priority: ${ticket.priority} | Category: ${ticket.category}`);

    if (ticket.priority === 'urgent') {
      console.log('[CustomerSupportAgent] URGENT ticket - notifying human agents');
    }
  }

  protected async afterExecute(result: AgentResult<SupportResponse>): Promise<void> {
    if (result.isSuccess()) {
      console.log(
        `[CustomerSupportAgent] Response generated (sentiment: ${result.data.sentiment})`
      );

      if (result.data.escalate) {
        console.log('[CustomerSupportAgent] Escalation recommended - flagging for human review');
      }
    } else {
      console.error('[CustomerSupportAgent] Failed to generate response:', result.error);
    }
  }

  private buildSystemPrompt(customerHistory: any, knowledgeArticles: any): string {
    return `You are a customer support agent for our company.
Your goal is to provide helpful, empathetic, and professional responses to customer issues.

Customer context:
${
  customerHistory.history.length > 0
    ? `Previous interactions:\n${customerHistory.history
        .map(
          (h: any) =>
            `- ${h.date.toLocaleDateString()}: ${h.summary} (${h.resolved ? 'Resolved' : 'Unresolved'})`
        )
        .join('\n')}`
    : 'No previous interactions on record'
}

Relevant knowledge articles:
${
  knowledgeArticles.articles.length > 0
    ? knowledgeArticles.articles
        .map((a: any) => `- ${a.title}: ${a.content.slice(0, 150)}...`)
        .join('\n')
    : 'No relevant articles found'
}

Guidelines:
1. Be empathetic and understanding
2. Provide clear, actionable solutions
3. Reference knowledge articles when relevant
4. Suggest escalation if the issue is complex or sensitive
5. Analyze the sentiment of your response
6. Estimate resolution time when possible

Respond with a JSON object matching the required schema.`;
  }

  private buildUserPrompt(ticket: SupportTicket): string {
    return `Ticket #${ticket.ticketId} - Priority: ${ticket.priority}
Category: ${ticket.category}
Subject: ${ticket.subject}
Description: ${ticket.description}

Please provide a response to this customer.`;
  }

  private calculateCost(usage: { promptTokens: number; completionTokens: number }): number {
    // GPT-4o pricing (as of January 2025)
    // Source: https://openai.com/api/pricing/
    const inputCostPer1M = 5.0;
    const outputCostPer1M = 20.0;

    const inputCost = (usage.promptTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (usage.completionTokens / 1_000_000) * outputCostPer1M;

    return inputCost + outputCost;
  }
}
