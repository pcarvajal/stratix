import Anthropic from '@anthropic-ai/sdk';
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
 * Pricing per 1M tokens for Anthropic models (as of 2025)
 */
const MODEL_PRICING = {
  'claude-3-opus-20240229': { input: 15.0, output: 75.0 },
  'claude-3-sonnet-20240229': { input: 3.0, output: 15.0 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
};

/**
 * Anthropic provider implementation for Stratix AI Agents.
 *
 * Supports Claude 3 models (Opus, Sonnet, Haiku) with tool use.
 *
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({
 *   apiKey: process.env.ANTHROPIC_API_KEY!
 * });
 *
 * const response = await provider.chat({
 *   model: 'claude-3-sonnet-20240229',
 *   messages: [
 *     { role: 'user', content: 'Hello!', timestamp: new Date() }
 *   ],
 *   temperature: 0.7
 * });
 * ```
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  readonly models = [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-3-5-sonnet-20241022',
  ];

  private client: Anthropic;

  constructor(config: { apiKey: string; baseURL?: string }) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    const { system, messages } = this.convertMessages(params.messages);

    const response = await this.client.messages.create({
      model: params.model,
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature ?? 0.7,
      system,
      messages,
      tools: params.tools ? this.convertTools(params.tools) : undefined,
    });

    let content = '';
    let toolCalls: ToolCall[] | undefined;

    for (const block of response.content) {
      if (block.type === 'text') {
        content += block.text;
      } else if (block.type === 'tool_use') {
        if (!toolCalls) toolCalls = [];
        toolCalls.push({
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    const usage: TokenUsage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };

    return {
      content,
      toolCalls,
      usage,
      finishReason: this.mapStopReason(response.stop_reason),
    };
  }

  async *streamChat(params: ChatParams): AsyncIterable<ChatChunk> {
    const { system, messages } = this.convertMessages(params.messages);

    const stream = this.client.messages.stream({
      model: params.model,
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature ?? 0.7,
      system,
      messages,
      tools: params.tools ? this.convertTools(params.tools) : undefined,
    });

    for await (const chunk of stream) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const anyChunk = chunk as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        anyChunk.type === 'content_block_delta' &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        anyChunk.delta?.type === 'text_delta'
      ) {
        yield {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          content: anyChunk.delta.text as string,
          isComplete: false,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (anyChunk.type === 'message_stop') {
        yield {
          content: '',
          isComplete: true,
        };
      }
    }
  }

  embeddings(_params: EmbeddingParams): Promise<EmbeddingResponse> {
    return Promise.reject(
      new Error(
        'Anthropic does not support embeddings. Use OpenAI or another provider for embeddings.'
      )
    );
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

  private convertMessages(messages: AgentMessage[]): {
    system?: string;
    messages: Anthropic.MessageParam[];
  } {
    const systemMessages = messages.filter((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    const system =
      systemMessages.length > 0 ? systemMessages.map((m) => m.content).join('\n\n') : undefined;

    const anthropicMessages: Anthropic.MessageParam[] = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    return { system, messages: anthropicMessages };
  }

  private convertTools(
    tools: Array<{ name: string; description: string; parameters: Record<string, unknown> }>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
  }

  private mapStopReason(
    reason: string | null
  ): 'stop' | 'length' | 'tool_calls' | 'content_filter' {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      case 'stop_sequence':
        return 'stop';
      default:
        return 'stop';
    }
  }
}
