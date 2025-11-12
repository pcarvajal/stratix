// Legacy testing utilities
export { TestApplication, createTestApp } from './TestApplication.js';
export { EntityBuilder, entityBuilder } from './builders/EntityBuilder.js';
export { DataFactory } from './factories/DataFactory.js';
export { assertSuccess, assertFailure, unwrapSuccess, unwrapFailure } from './utils/assertions.js';

// AI Agent testing utilities
export { MockLLMProvider } from './MockLLMProvider.js';
export type { MockResponse } from './MockLLMProvider.js';

export { AgentTester } from './AgentTester.js';
export type { TestOptions, TestResult } from './AgentTester.js';

// Agent-specific assertions
export {
  expectSuccess,
  expectFailure,
  expectData,
  expectDataContains,
  expectCostWithinBudget,
  expectDurationWithinLimit,
  expectErrorContains,
  expectModel,
} from './assertions.js';

// Test helpers
export {
  createTestContext,
  createTestAgentId,
  createDeterministicAgentId,
  wait,
  repeatTest,
  runInParallel,
  createTimeout,
  expectToReject,
  measureTime,
} from './testHelpers.js';
