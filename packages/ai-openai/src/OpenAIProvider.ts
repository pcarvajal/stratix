import OpenAI from 'openai';
import type {
  LLMProvider,
  ChatParams,
  ChatResponse,
  ChatChunk,
  EmbeddingParams,
  EmbeddingResponse,
} from '@stratix/core';
import type { AgentMessage, TokenUsage, ToolCall } from '@stratix/core';

/**
 * Pricing per 1M tokens for OpenAI models (as of January 2025)
 * Source: https://openai.com/api/pricing/
 * Update these values as pricing changes
 */
const MODEL_PRICING = {
  'gpt-4o': { input: 5.0, output: 20.0 },
  'gpt-4o-mini': { input: 0.6, output: 2.4 },
  'gpt-4': { input: 30.0, output: 60.0 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'gpt-4-turbo-preview': { input: 10.0, output: 30.0 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'gpt-3.5-turbo-16k': { input: 3.0, output: 4.0 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
  'text-embedding-3-large': { input: 0.13, output: 0 },
  'text-embedding-ada-002': { input: 0.1, output: 0 },
};

/**
 * OpenAI provider implementation for Stratix AI Agents.
 *
 * Supports GPT-4, GPT-3.5, and embeddings models with function calling.
 *
 * @example
 * ```typescript
 * const provider = new OpenAIProvider({
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   organization: 'org-123'
 * });
 *
 * const response = await provider.chat({
 *   model: 'gpt-4',
 *   messages: [
 *     { role: 'user', content: 'Hello!', timestamp: new Date() }
 *   ],
 *   temperature: 0.7
 * });
 * ```
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  readonly models = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4-turbo-preview',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
  ];

  private client: OpenAI;

  constructor(config: { apiKey: string; organization?: string; baseURL?: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      baseURL: config.baseURL,
    });
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    const messages = this.convertMessages(params.messages);

    const completion = await this.client.chat.completions.create({
      model: params.model,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens,
      tools: params.tools ? this.convertTools(params.tools) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      response_format: params.responseFormat
        ? this.convertResponseFormat(params.responseFormat)
        : undefined,
    });

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error('No completion choice returned from OpenAI');
    }

    const content = choice.message.content || '';
    const toolCalls = choice.message.tool_calls
      ? this.extractToolCalls(choice.message.tool_calls)
      : undefined;

    const usage: TokenUsage = {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    };

    return {
      content,
      toolCalls,
      usage,
      finishReason: this.mapFinishReason(choice.finish_reason),
    };
  }

  async *streamChat(params: ChatParams): AsyncIterable<ChatChunk> {
    const messages = this.convertMessages(params.messages);

    const stream = await this.client.chat.completions.create({
      model: params.model,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens,
      tools: params.tools ? this.convertTools(params.tools) : undefined,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield {
          content: delta.content,
          isComplete: chunk.choices[0]?.finish_reason !== null,
        };
      }
    }
  }

  async embeddings(params: EmbeddingParams): Promise<EmbeddingResponse> {
    const response = await this.client.embeddings.create({
      model: params.model,
      input: params.input,
    });

    const embeddings = response.data.map((item) => item.embedding);

    const usage: TokenUsage = {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: 0,
      totalTokens: response.usage.total_tokens,
    };

    return {
      embeddings,
      usage,
    };
  }

  /**
   * Calculates the cost of a chat completion based on token usage
   *
   * @param model - The model used
   * @param usage - Token usage information
   * @returns Cost in USD
   */
  calculateCost(model: string, usage: TokenUsage): number {
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
    if (!pricing) {
      console.warn(`No pricing information for model: ${model}`);
      return 0;
    }

    const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  private convertMessages(
    messages: AgentMessage[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private convertTools(
    tools: Array<{ name: string; description: string; parameters: Record<string, unknown> }>
  ): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  private convertResponseFormat(format: {
    type: string;
    schema?: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): any {
    if (format.type === 'json_object') {
      return { type: 'json_object' };
    }
    if (format.type === 'json_schema' && format.schema) {
      // OpenAI requires additionalProperties: false for structured outputs
      const schemaWithAdditionalProps = {
        ...format.schema,
        additionalProperties: false,
      };

      return {
        type: 'json_schema',
        json_schema: {
          name: 'response_schema',
          schema: schemaWithAdditionalProps,
          strict: true,
        },
      };
    }
    return undefined;
  }

  private extractToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
  ): ToolCall[] {
    return toolCalls.map((tc) => ({
      name: tc.function.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      arguments: JSON.parse(tc.function.arguments),
    }));
  }

  private mapFinishReason(
    reason: string | null | undefined
  ): 'stop' | 'length' | 'tool_calls' | 'content_filter' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      case 'content_filter':
        return 'content_filter';
      default:
        return 'stop';
    }
  }
}
