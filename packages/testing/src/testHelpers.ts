import { AgentContext, EntityId } from '@stratix/primitives';
import type { AgentId } from '@stratix/primitives';

/**
 * Helper functions for creating test data
 */

/**
 * Creates a test AgentContext with default values
 */
export function createTestContext(
  overrides?: Partial<{
    userId: string;
    sessionId: string;
    environment: 'development' | 'staging' | 'production';
    metadata: Record<string, unknown>;
    budget: number;
  }>
): AgentContext {
  const context = new AgentContext({
    userId: overrides?.userId || 'test-user',
    sessionId: overrides?.sessionId || 'test-session',
    environment: overrides?.environment || 'development',
    metadata: overrides?.metadata,
  });

  if (overrides?.budget !== undefined) {
    context.setBudget(overrides.budget);
  }

  return context;
}

/**
 * Creates a test AgentId
 */
export function createTestAgentId(): AgentId {
  return EntityId.create<'AIAgent'>();
}

/**
 * Waits for a specified duration (for testing delays)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a deterministic AgentId for testing (using a seed)
 */
export function createDeterministicAgentId(_seed: string): AgentId {
  // This creates a reproducible ID based on the seed
  // In real tests, you might want actual deterministic UUIDs
  // TODO: Implement actual deterministic UUID generation based on seed
  return EntityId.create<'AIAgent'>();
}

/**
 * Repeats a test function N times
 */
export async function repeatTest<T>(
  times: number,
  testFn: (iteration: number) => Promise<T>
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < times; i++) {
    results.push(await testFn(i));
  }

  return results;
}

/**
 * Runs tests in parallel
 */
export async function runInParallel<T>(testFns: Array<() => Promise<T>>): Promise<T[]> {
  return Promise.all(testFns.map((fn) => fn()));
}

/**
 * Creates a timeout promise for testing
 */
export function createTimeout(ms: number, message?: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Timeout after ${ms}ms`));
    }, ms);
  });
}

/**
 * Asserts that a promise rejects with a specific error
 */
export async function expectToReject(
  promise: Promise<unknown>,
  expectedError?: string | RegExp
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected promise to reject but it resolved');
  } catch (error) {
    if (expectedError) {
      const message = error instanceof Error ? error.message : String(error);

      if (typeof expectedError === 'string') {
        if (!message.includes(expectedError)) {
          throw new Error(`Expected error to include "${expectedError}" but got "${message}"`);
        }
      } else {
        if (!expectedError.test(message)) {
          throw new Error(`Expected error to match ${expectedError} but got "${message}"`);
        }
      }
    }
  }
}

/**
 * Measures execution time of an async function
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  return { result, duration };
}
