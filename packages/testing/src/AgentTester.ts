import type { AIAgent, AgentResult, AgentContext } from '@stratix/core';
import { MockLLMProvider } from './MockLLMProvider.js';

/**
 * Test configuration options
 */
export interface TestOptions {
  /**
   * Maximum execution time before timing out (ms)
   */
  timeout?: number;

  /**
   * Whether to capture execution traces
   */
  enableTracing?: boolean;

  /**
   * Mock LLM provider to use
   */
  mockProvider?: MockLLMProvider;
}

/**
 * Test result with additional metadata
 */
export interface TestResult<TOutput> {
  /**
   * The agent result
   */
  result: AgentResult<TOutput>;

  /**
   * Execution duration in milliseconds
   */
  duration: number;

  /**
   * Whether the test passed
   */
  passed: boolean;

  /**
   * Error message if test failed
   */
  error?: string;
}

/**
 * Agent tester utility for testing AI agents with deterministic responses.
 *
 * @example
 * ```typescript
 * import { AgentTester } from '@stratix/testing';
 *
 * describe('MyAgent', () => {
 *   let tester: AgentTester;
 *
 *   beforeEach(() => {
 *     tester = new AgentTester();
 *   });
 *
 *   it('should process input correctly', async () => {
 *     const agent = new MyAgent(...);
 *
 *     tester.setMockResponse({
 *       content: '{"result": "success"}',
 *       usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
 *     });
 *
 *     const result = await tester.test(agent, input);
 *
 *     expect(result.passed).toBe(true);
 *     expect(result.result.isSuccess()).toBe(true);
 *   });
 * });
 * ```
 */
export class AgentTester {
  private mockProvider: MockLLMProvider;
  private options: TestOptions;

  constructor(options: TestOptions = {}) {
    this.options = {
      timeout: 30000,
      enableTracing: true,
      ...options,
    };

    this.mockProvider = options.mockProvider || new MockLLMProvider();
  }

  /**
   * Gets the mock LLM provider
   */
  getMockProvider(): MockLLMProvider {
    return this.mockProvider;
  }

  /**
   * Sets a single mock response
   */
  setMockResponse(response: Parameters<MockLLMProvider['setResponse']>[0]): void {
    this.mockProvider.setResponse(response);
  }

  /**
   * Sets multiple mock responses
   */
  setMockResponses(responses: Parameters<MockLLMProvider['setResponses']>[0]): void {
    this.mockProvider.setResponses(responses);
  }

  /**
   * Tests an agent with the given input
   */
  async test<TInput, TOutput>(
    agent: AIAgent<TInput, TOutput>,
    input: TInput,
    context?: AgentContext
  ): Promise<TestResult<TOutput>> {
    const startTime = Date.now();
    let result: AgentResult<TOutput>;
    let error: string | undefined;
    let passed = false;

    try {
      // Execute with timeout
      result = await this.executeWithTimeout(agent, input, context);

      // Check if successful
      passed = result.isSuccess();
      if (!passed) {
        error = result.error?.message || 'Unknown error';
      }
    } catch (err) {
      result = {
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
        data: undefined as unknown as TOutput,
        metadata: {
          model: 'unknown',
          duration: Date.now() - startTime,
        },
      } as AgentResult<TOutput>;

      error = err instanceof Error ? err.message : String(err);
    }

    const duration = Date.now() - startTime;

    return {
      result,
      duration,
      passed,
      error,
    };
  }

  /**
   * Executes agent with timeout
   */
  private async executeWithTimeout<TInput, TOutput>(
    agent: AIAgent<TInput, TOutput>,
    input: TInput,
    _context?: AgentContext
  ): Promise<AgentResult<TOutput>> {
    const timeout = this.options.timeout!;

    return Promise.race([
      agent.executeWithEvents(input),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Test timeout after ${timeout}ms`));
        }, timeout);
      }),
    ]);
  }

  /**
   * Asserts that the result is successful
   */
  assertSuccess<TOutput>(
    result: TestResult<TOutput>
  ): asserts result is TestResult<TOutput> & { passed: true } {
    if (!result.passed) {
      throw new Error(`Expected success but got failure: ${result.error}`);
    }
  }

  /**
   * Asserts that the result is a failure
   */
  assertFailure<TOutput>(
    result: TestResult<TOutput>
  ): asserts result is TestResult<TOutput> & { passed: false } {
    if (result.passed) {
      throw new Error('Expected failure but got success');
    }
  }

  /**
   * Asserts that execution time is within limits
   */
  assertDuration<TOutput>(result: TestResult<TOutput>, maxDuration: number): void {
    if (result.duration > maxDuration) {
      throw new Error(`Expected duration <= ${maxDuration}ms but got ${result.duration}ms`);
    }
  }

  /**
   * Asserts that the mock provider was called N times
   */
  assertCallCount(expectedCount: number): void {
    const actualCount = this.mockProvider.getCallCount();
    if (actualCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} calls but got ${actualCount}`);
    }
  }

  /**
   * Resets the tester state
   */
  reset(): void {
    this.mockProvider.reset();
  }
}
