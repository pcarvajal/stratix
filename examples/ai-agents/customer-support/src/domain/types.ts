import { z } from 'zod';

/**
 * Support ticket input schema
 */
export const SupportTicketSchema = z.object({
  ticketId: z.string(),
  customerId: z.string(),
  subject: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string()
});

export type SupportTicket = z.infer<typeof SupportTicketSchema>;

/**
 * Support response output schema
 */
export const SupportResponseSchema = z.object({
  response: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  suggestedActions: z.array(z.string()),
  escalate: z.boolean(),
  estimatedResolutionTime: z.number()
});

export type SupportResponse = z.infer<typeof SupportResponseSchema>;

/**
 * Knowledge base article
 */
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  relevanceScore: number;
}

/**
 * Customer interaction history
 */
export interface CustomerInteraction {
  date: Date;
  type: string;
  summary: string;
  resolved: boolean;
}
