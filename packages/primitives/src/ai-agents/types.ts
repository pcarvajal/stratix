/**
 * Core types for AI Agent framework
 */

import type { EntityId } from '../core/EntityId.js';

/**
 * Unique identifier for an AI Agent
 */
export type AgentId = EntityId<'AIAgent'>;

/**
 * Version information for an agent
 */
export interface AgentVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly value: string;
}

/**
 * Factory for creating agent versions
 */
export class AgentVersionFactory {
  static create(version: string): AgentVersion {
    const parts = version.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid version format: ${version}. Expected format: X.Y.Z`);
    }

    const [major, minor, patch] = parts.map(Number);

    if ([major, minor, patch].some(isNaN)) {
      throw new Error(`Invalid version numbers in: ${version}`);
    }

    return {
      major,
      minor,
      patch,
      value: version,
    };
  }
}

/**
 * Capabilities that an agent can have
 */
// TODO: Check Agent Capability enum
export enum AgentCapability {
  CUSTOMER_SUPPORT = 'customer_support',
  DATA_ANALYSIS = 'data_analysis',
  KNOWLEDGE_RETRIEVAL = 'knowledge_retrieval',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  SQL_GENERATION = 'sql_generation',
  VISUALIZATION = 'visualization',
  CONTENT_CREATION = 'content_creation',
  CODE_GENERATION = 'code_generation',
  DECISION_SUPPORT = 'decision_support',
}

/**
 * Configuration for the LLM model used by an agent
 */
export interface ModelConfig {
  readonly provider: string;
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
}

/**
 * Message in agent conversation
 */
export interface AgentMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: Date;
}

/**
 * Cost information for an agent execution
 */
export interface AgentCost {
  readonly provider: string;
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly cost: number;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

/**
 * Metadata about agent execution
 */
export interface AgentExecutionMetadata {
  readonly model: string;
  readonly totalTokens?: number;
  readonly cost?: number;
  readonly duration?: number;
  readonly stage?: string;
  [key: string]: unknown;
}

/**
 * Tool call information
 */
export interface ToolCall {
  readonly name: string;
  readonly arguments: Record<string, unknown>;
  readonly result?: unknown;
}

/**
 * Execution step in agent trace
 */
export interface ExecutionStep {
  readonly name: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * LLM API call information
 */
export interface LLMCall {
  readonly provider: string;
  readonly model: string;
  readonly messages: AgentMessage[];
  readonly response: string;
  readonly usage: TokenUsage;
  readonly cost: number;
  readonly timestamp: Date;
}
