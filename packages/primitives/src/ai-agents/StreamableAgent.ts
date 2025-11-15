import type { AIAgent } from './AIAgent.js';
import type { AgentResult } from './AgentResult.js';

/**
 * Chunk of data emitted during streaming execution
 *
 * @template TOutput - The type of the complete output
 */
export interface StreamChunk<TOutput> {
  /**
   * Partial data for this chunk
   */
  readonly data: Partial<TOutput>;

  /**
   * Whether this is the final chunk
   */
  readonly done: boolean;

  /**
   * Optional metadata for this chunk (tokens, timing, etc.)
   */
  readonly metadata?: {
    readonly tokens?: number;
    readonly timestamp?: Date;
    [key: string]: unknown;
  };
}

/**
 * Options for streaming execution
 */
export interface StreamOptions {
  /**
   * Callback invoked for each chunk
   */
  onChunk?: (chunk: StreamChunk<unknown>) => void;

  /**
   * Callback invoked when streaming completes
   */
  onComplete?: (result: AgentResult<unknown>) => void;

  /**
   * Callback invoked when streaming encounters an error
   */
  onError?: (error: Error) => void;

  /**
   * Abort signal to cancel streaming
   */
  signal?: AbortSignal;
}

/**
 * Interface for AI Agents that support streaming execution.
 *
 * Streaming allows agents to emit partial results as they become available,
 * providing a better user experience for long-running operations.
 *
 * @template TInput - The type of input the agent accepts
 * @template TOutput - The type of output the agent produces
 *
 * @example
 * ```typescript
 * class StreamingChatAgent
 *   extends AIAgent<ChatInput, ChatOutput>
 *   implements StreamableAgent<ChatInput, ChatOutput>
 * {
 *   async *executeStream(input: ChatInput): AsyncIterable<StreamChunk<ChatOutput>> {
 *     const stream = await this.llmProvider.streamChat(input.messages);
 *
 *     let accumulated = '';
 *     for await (const chunk of stream) {
 *       accumulated += chunk.content;
 *
 *       yield {
 *         data: { message: accumulated },
 *         done: false,
 *         metadata: { tokens: chunk.tokens }
 *       };
 *     }
 *
 *     yield {
 *       data: { message: accumulated },
 *       done: true,
 *       metadata: { tokens: totalTokens }
 *     };
 *   }
 * }
 *
 * // Use the streaming agent
 * const agent = new StreamingChatAgent(...);
 *
 * for await (const chunk of agent.executeStream(input)) {
 *   console.log(chunk.data.message);
 *   if (chunk.done) {
 *     console.log('Streaming complete');
 *   }
 * }
 * ```
 */
export interface StreamableAgent<TInput, TOutput> extends AIAgent<TInput, TOutput> {
  /**
   * Executes the agent with streaming, emitting partial results as they become available.
   *
   * @param input - The input data for the agent
   * @returns An async iterable of stream chunks
   *
   * @example
   * ```typescript
   * for await (const chunk of agent.executeStream(input)) {
   *   if (!chunk.done) {
   *     console.log('Partial:', chunk.data);
   *   } else {
   *     console.log('Complete:', chunk.data);
   *   }
   * }
   * ```
   */
  executeStream(input: TInput): AsyncIterable<StreamChunk<TOutput>>;

  /**
   * Executes the agent with streaming and invokes callbacks for each chunk.
   *
   * This is a convenience method for when you want callback-based streaming
   * instead of async iteration.
   *
   * @param input - The input data for the agent
   * @param options - Streaming options with callbacks
   * @returns A promise that resolves with the final result
   *
   * @example
   * ```typescript
   * const result = await agent.executeStreamWithCallbacks(input, {
   *   onChunk: (chunk) => console.log('Chunk:', chunk.data),
   *   onComplete: (result) => console.log('Done:', result.data),
   *   onError: (error) => console.error('Error:', error),
   *   signal: abortController.signal
   * });
   * ```
   */
  executeStreamWithCallbacks(input: TInput, options: StreamOptions): Promise<AgentResult<TOutput>>;
}

/**
 * Utility class to help implement streaming agents
 */
export class StreamingHelper {
  /**
   * Converts an async iterable to a callback-based stream
   *
   * @param stream - The async iterable to convert
   * @param options - Streaming options with callbacks
   * @returns A promise that resolves with the final chunk
   */
  static async consumeStream<TOutput>(
    stream: AsyncIterable<StreamChunk<TOutput>>,
    options: StreamOptions
  ): Promise<StreamChunk<TOutput>> {
    let lastChunk: StreamChunk<TOutput> | undefined;

    try {
      for await (const chunk of stream) {
        // Check for abort
        if (options.signal?.aborted) {
          throw new Error('Stream aborted');
        }

        lastChunk = chunk;

        // Invoke chunk callback
        if (options.onChunk) {
          options.onChunk(chunk);
        }

        // If done, break
        if (chunk.done) {
          break;
        }
      }

      if (!lastChunk) {
        throw new Error('Stream ended without emitting any chunks');
      }

      return lastChunk;
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Merges partial chunks into a complete object
   *
   * This is useful for accumulating streamed data into a final result.
   *
   * @param chunks - Array of partial chunks
   * @returns Merged object with all properties
   */
  static merge<TOutput>(chunks: Array<Partial<TOutput>>): TOutput {
    return Object.assign({}, ...chunks) as TOutput;
  }

  /**
   * Creates an async iterable from a callback-based stream
   *
   * @param producer - Function that sets up the stream with callbacks
   * @returns An async iterable of chunks
   *
   * @example
   * ```typescript
   * const stream = StreamingHelper.fromCallbacks<ChatOutput>((emit, end, error) => {
   *   llmProvider.stream(input, {
   *     onChunk: (data) => emit({ data, done: false }),
   *     onComplete: (data) => { emit({ data, done: true }); end(); },
   *     onError: error
   *   });
   * });
   *
   * for await (const chunk of stream) {
   *   console.log(chunk.data);
   * }
   * ```
   */
  static fromCallbacks<TOutput>(
    producer: (
      emit: (chunk: StreamChunk<TOutput>) => void,
      end: () => void,
      error: (err: Error) => void
    ) => void
  ): AsyncIterable<StreamChunk<TOutput>> {
    const chunks: StreamChunk<TOutput>[] = [];
    let resolve: (() => void) | null = null;
    let reject: ((error: Error) => void) | null = null;
    let ended = false;
    let errorOccurred: Error | null = null;

    const emit = (chunk: StreamChunk<TOutput>) => {
      chunks.push(chunk);
      if (resolve) {
        const r = resolve;
        resolve = null;
        r();
      }
    };

    const end = () => {
      ended = true;
      if (resolve) {
        const r = resolve;
        resolve = null;
        r();
      }
    };

    const error = (err: Error) => {
      errorOccurred = err;
      if (reject) {
        const r = reject;
        reject = null;
        r(err);
      }
    };

    // Start the producer
    producer(emit, end, error);

    return {
      [Symbol.asyncIterator](): AsyncIterator<StreamChunk<TOutput>> {
        let index = 0;

        return {
          async next(): Promise<IteratorResult<StreamChunk<TOutput>>> {
            // Check for error
            if (errorOccurred) {
              throw errorOccurred;
            }

            // Return chunk if available
            if (index < chunks.length) {
              return { value: chunks[index++], done: false };
            }

            // If ended and no more chunks, we're done
            if (ended) {
              return { value: undefined, done: true };
            }

            // Wait for next chunk
            await new Promise<void>((res, rej) => {
              resolve = res;
              reject = rej;
            });

            // Try again after waiting
            return this.next();
          },
        };
      },
    };
  }
}
