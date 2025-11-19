/**
 * Domain events for AI Agent lifecycle and execution
 */

import type { DomainEvent } from '../core/DomainEvent.js';

/**
 * Base interface for all AI Agent domain events
 */
export interface AIAgentDomainEvent extends DomainEvent {
  readonly agentId: string;
  readonly agentName: string;
}

/**
 * Event emitted when an agent starts executing a task
 */
export interface AgentExecutionStarted extends AIAgentDomainEvent {
  readonly eventType: 'AgentExecutionStarted';
  readonly input: unknown;
  readonly contextId?: string;
}

/**
 * Event emitted when an agent successfully completes execution
 */
export interface AgentExecutionCompleted extends AIAgentDomainEvent {
  readonly eventType: 'AgentExecutionCompleted';
  readonly output: unknown;
  readonly contextId?: string;
  readonly durationMs: number;
  readonly tokensUsed?: number;
  readonly cost?: number;
}

/**
 * Event emitted when an agent execution fails
 */
export interface AgentExecutionFailed extends AIAgentDomainEvent {
  readonly eventType: 'AgentExecutionFailed';
  readonly error: string;
  readonly contextId?: string;
  readonly durationMs: number;
}

/**
 * Event emitted when an agent uses a tool during execution
 */
export interface AgentToolUsed extends AIAgentDomainEvent {
  readonly eventType: 'AgentToolUsed';
  readonly toolName: string;
  readonly toolArguments: Record<string, unknown>;
  readonly toolResult?: unknown;
  readonly contextId?: string;
}

/**
 * Event emitted when an agent's context is updated
 */
export interface AgentContextUpdated extends AIAgentDomainEvent {
  readonly eventType: 'AgentContextUpdated';
  readonly contextId: string;
  readonly messagesCount: number;
}

/**
 * Event emitted when an agent stores information in memory
 */
export interface AgentMemoryStored extends AIAgentDomainEvent {
  readonly eventType: 'AgentMemoryStored';
  readonly memoryKey: string;
  readonly memoryType: 'short' | 'long';
}

/**
 * Union type of all AI Agent domain events
 */
export type AIAgentEvent =
  | AgentExecutionStarted
  | AgentExecutionCompleted
  | AgentExecutionFailed
  | AgentToolUsed
  | AgentContextUpdated
  | AgentMemoryStored;
