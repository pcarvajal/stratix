import type { AgentResult } from '@stratix/primitives';

/**
 * Assertion helpers for testing agents
 */

/**
 * Asserts that the agent result is successful
 */
export function expectSuccess<T>(
  result: AgentResult<T>
): asserts result is AgentResult<T> & { data: T } {
  if (!result.isSuccess()) {
    throw new Error(`Expected success but got failure: ${result.error?.message}`);
  }
}

/**
 * Asserts that the agent result is a failure
 */
export function expectFailure<T>(
  result: AgentResult<T>
): asserts result is AgentResult<T> & { error: Error } {
  if (!result.isFailure()) {
    throw new Error('Expected failure but got success');
  }
}

/**
 * Asserts that the result data matches the expected value
 */
export function expectData<T>(result: AgentResult<T>, expected: T): void {
  expectSuccess(result);

  if (JSON.stringify(result.data) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected data ${JSON.stringify(expected)} but got ${JSON.stringify(result.data)}`
    );
  }
}

/**
 * Asserts that the result data contains the expected subset
 */
export function expectDataContains<T extends Record<string, unknown>>(
  result: AgentResult<T>,
  expected: Partial<T>
): void {
  expectSuccess(result);

  for (const [key, value] of Object.entries(expected)) {
    const actualValue = (result.data as Record<string, unknown>)[key];
    if (JSON.stringify(actualValue) !== JSON.stringify(value)) {
      throw new Error(
        `Expected ${key} to be ${JSON.stringify(value)} but got ${JSON.stringify(actualValue)}`
      );
    }
  }
}

/**
 * Asserts that execution cost is within budget
 */
export function expectCostWithinBudget<T>(result: AgentResult<T>, budget: number): void {
  const cost = result.metadata.cost || 0;

  if (cost > budget) {
    throw new Error(`Cost $${cost.toFixed(4)} exceeds budget $${budget.toFixed(4)}`);
  }
}

/**
 * Asserts that execution duration is within limit
 */
export function expectDurationWithinLimit<T>(result: AgentResult<T>, maxDuration: number): void {
  const duration = result.metadata.duration;

  if (duration === undefined) {
    throw new Error('Duration metadata is not available');
  }

  if (duration > maxDuration) {
    throw new Error(`Duration ${duration}ms exceeds limit ${maxDuration}ms`);
  }
}

/**
 * Asserts that the error message contains the expected text
 */
export function expectErrorContains<T>(result: AgentResult<T>, expectedText: string): void {
  expectFailure(result);

  const errorMessage = result.error.message.toLowerCase();
  const searchText = expectedText.toLowerCase();

  if (!errorMessage.includes(searchText)) {
    throw new Error(
      `Expected error message to contain "${expectedText}" but got "${result.error.message}"`
    );
  }
}

/**
 * Asserts that the result uses the expected model
 */
export function expectModel<T>(result: AgentResult<T>, expectedModel: string): void {
  const actualModel = result.metadata.model;

  if (actualModel !== expectedModel) {
    throw new Error(`Expected model "${expectedModel}" but got "${actualModel}"`);
  }
}
