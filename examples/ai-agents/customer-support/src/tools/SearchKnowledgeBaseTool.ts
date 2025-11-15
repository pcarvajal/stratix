import { AgentTool } from '@stratix/abstractions';
import type { ToolDefinition } from '@stratix/abstractions';
import { z } from 'zod';
import type { KnowledgeArticle } from '../domain/types.js';

const InputSchema = z.object({
  query: z.string().min(1)
});

const OutputSchema = z.object({
  articles: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    category: z.string(),
    relevanceScore: z.number()
  }))
});

type Input = z.infer<typeof InputSchema>;
type Output = z.infer<typeof OutputSchema>;

/**
 * Tool for searching the knowledge base
 */
export class SearchKnowledgeBaseTool extends AgentTool<Input, Output> {
  readonly name = 'search_knowledge_base';
  readonly description = 'Search company knowledge base for relevant articles and solutions';

  // Mock knowledge base
  private knowledgeBase: KnowledgeArticle[] = [
    {
      id: 'kb-001',
      title: 'How to reset your password',
      content: 'To reset your password, go to Settings > Security > Reset Password. Follow the email verification steps.',
      category: 'account',
      relevanceScore: 0
    },
    {
      id: 'kb-002',
      title: 'Billing issues and payment methods',
      content: 'You can update your payment method in Settings > Billing. We accept all major credit cards and PayPal.',
      category: 'billing',
      relevanceScore: 0
    },
    {
      id: 'kb-003',
      title: 'Troubleshooting login problems',
      content: 'If you cannot log in, first check your internet connection. Clear browser cache and try again. If issue persists, contact support.',
      category: 'technical',
      relevanceScore: 0
    },
    {
      id: 'kb-004',
      title: 'Understanding your subscription',
      content: 'Your subscription includes access to all features. You can upgrade or downgrade anytime in Settings > Subscription.',
      category: 'billing',
      relevanceScore: 0
    },
    {
      id: 'kb-005',
      title: 'Refund policy',
      content: 'We offer a 30-day money-back guarantee. Contact support with your order ID to request a refund.',
      category: 'billing',
      relevanceScore: 0
    }
  ];

  async execute(input: Input): Promise<Output> {
    // Simple keyword-based search (in production, use vector embeddings)
    const queryLower = input.query.toLowerCase();
    const results = this.knowledgeBase
      .map(article => ({
        ...article,
        relevanceScore: this.calculateRelevance(queryLower, article)
      }))
      .filter(article => article.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);

    return { articles: results };
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
          query: {
            type: 'string',
            description: 'Search query for finding relevant articles'
          }
        },
        required: ['query']
      }
    };
  }

  private calculateRelevance(query: string, article: KnowledgeArticle): number {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const contentLower = article.content.toLowerCase();

    // Title match (high weight)
    if (titleLower.includes(query)) score += 10;

    // Content match (medium weight)
    if (contentLower.includes(query)) score += 5;

    // Word match
    const queryWords = query.split(' ');
    for (const word of queryWords) {
      if (word.length < 3) continue;
      if (titleLower.includes(word)) score += 2;
      if (contentLower.includes(word)) score += 1;
    }

    return score;
  }
}
