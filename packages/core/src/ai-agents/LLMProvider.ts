import type { AgentMessage, TokenUsage, ToolCall } from './types.js';

/**
 * Chat parameters for LLM API calls
 */
export interface ChatParams {
  readonly model: string;
  readonly messages: AgentMessage[];
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly tools?: ToolDefinition[];
  readonly responseFormat?: ResponseFormat;
}

/**
 * Tool definition for LLM function calling
 */
export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

/**
 * Response format specification
 */
export interface ResponseFormat {
  readonly type: 'text' | 'json_object' | 'json_schema';
  readonly schema?: Record<string, unknown>;
}

/**
 * Response from LLM chat completion
 */
export interface ChatResponse {
  readonly content: string;
  readonly toolCalls?: ToolCall[];
  readonly usage: TokenUsage;
  readonly finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}

/**
 * Chunk of streaming response
 */
export interface ChatChunk {
  readonly content: string;
  readonly isComplete: boolean;
}

/**
 * Embedding parameters
 */
export interface EmbeddingParams {
  readonly model: string;
  readonly input: string | string[];
}

/**
 * Embedding response
 */
export interface EmbeddingResponse {
  readonly embeddings: number[][];
  readonly usage: TokenUsage;
}

/**
 * Interface for LLM (Large Language Model) providers.
 *
 * Implementations provide access to AI models like GPT-4, Claude, etc.
 *
 * @example
 * ```typescript
 * class OpenAIProvider implements LLMProvider {
 *   readonly name = 'openai';
 *   readonly models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
 *
 *   async chat(params: ChatParams): Promise<ChatResponse> {
 *     // Call OpenAI API
 *   }
 * }
 * ```
 */
export interface LLMProvider {
  /**
   * Unique name of the provider (e.g., 'openai', 'anthropic', 'local')
   */
  readonly name: string;

  /**
   * List of supported models
   */
  readonly models: string[];

  /**
   * Sends a chat completion request
   *
   * @param params - Chat parameters
   * @returns The chat completion response
   */
  chat(params: ChatParams): Promise<ChatResponse>;

  /**
   * Streams a chat completion response
   *
   * @param params - Chat parameters
   * @returns Async iterable of chat chunks
   */
  streamChat(params: ChatParams): AsyncIterable<ChatChunk>;

  /**
   * Generates embeddings for the given input
   *
   * @param params - Embedding parameters
   * @returns The embedding vectors
   */
  embeddings(params: EmbeddingParams): Promise<EmbeddingResponse>;
}
