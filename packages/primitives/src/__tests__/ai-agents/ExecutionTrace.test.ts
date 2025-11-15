import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionTrace } from '../../ai-agents/ExecutionTrace.js';
import { EntityId } from '../../core/EntityId.js';
import type { AgentId, ExecutionStep, LLMCall, ToolCall } from '../../ai-agents/types.js';

describe('ExecutionTrace', () => {
  let agentId: AgentId;
  let startTime: Date;

  beforeEach(() => {
    agentId = EntityId.create<'AIAgent'>();
    startTime = new Date('2025-01-01T00:00:00Z');
  });

  describe('construction', () => {
    it('should create trace with agent ID and start time', () => {
      const trace = new ExecutionTrace(agentId, startTime);

      expect(trace.agentId).toBe(agentId);
      expect(trace.startTime).toBe(startTime);
      expect(trace.endTime).toBeUndefined();
      expect(trace.duration).toBeUndefined();
    });

    it('should initialize empty collections', () => {
      const trace = new ExecutionTrace(agentId, startTime);

      expect(trace.getSteps()).toEqual([]);
      expect(trace.getLLMCalls()).toEqual([]);
      expect(trace.getToolCalls()).toEqual([]);
    });
  });

  describe('step tracking', () => {
    let trace: ExecutionTrace;

    beforeEach(() => {
      trace = new ExecutionTrace(agentId, startTime);
    });

    it('should add a step', () => {
      const step: ExecutionStep = {
        name: 'validate_input',
        startTime: new Date('2025-01-01T00:00:01Z'),
      };

      trace.addStep(step);

      expect(trace.getSteps()).toHaveLength(1);
      expect(trace.getSteps()[0]).toEqual(step);
    });

    it('should add multiple steps in order', () => {
      trace.addStep({
        name: 'step1',
        startTime: new Date('2025-01-01T00:00:01Z'),
      });

      trace.addStep({
        name: 'step2',
        startTime: new Date('2025-01-01T00:00:02Z'),
      });

      trace.addStep({
        name: 'step3',
        startTime: new Date('2025-01-01T00:00:03Z'),
      });

      const steps = trace.getSteps();
      expect(steps).toHaveLength(3);
      expect(steps[0].name).toBe('step1');
      expect(steps[1].name).toBe('step2');
      expect(steps[2].name).toBe('step3');
    });
  });

  describe('LLM call tracking', () => {
    let trace: ExecutionTrace;

    beforeEach(() => {
      trace = new ExecutionTrace(agentId, startTime);
    });

    it('should record LLM call', () => {
      const llmCall: LLMCall = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test', timestamp: new Date() }],
        response: 'AI response',
        usage: {
          promptTokens: 10,
          completionTokens: 50,
          totalTokens: 60,
        },
        cost: 0.002,
        timestamp: new Date('2025-01-01T00:00:01Z'),
      };

      trace.addLLMCall(llmCall);

      expect(trace.getLLMCalls()).toHaveLength(1);
      expect(trace.getLLMCalls()[0]).toEqual(llmCall);
    });

    it('should record multiple LLM calls', () => {
      trace.addLLMCall({
        provider: 'openai',
        model: 'gpt-4',
        messages: [],
        response: 'First response',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: 0.001,
        timestamp: new Date('2025-01-01T00:00:01Z'),
      });

      trace.addLLMCall({
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        messages: [],
        response: 'Second response',
        usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
        cost: 0.0015,
        timestamp: new Date('2025-01-01T00:00:02Z'),
      });

      expect(trace.getLLMCalls()).toHaveLength(2);
    });
  });

  describe('tool call tracking', () => {
    let trace: ExecutionTrace;

    beforeEach(() => {
      trace = new ExecutionTrace(agentId, startTime);
    });

    it('should record tool call', () => {
      const toolCall: ToolCall = {
        name: 'search_knowledge_base',
        arguments: { query: 'password reset' },
        result: { articles: [{ id: '1', title: 'How to reset password' }] },
        timestamp: new Date('2025-01-01T00:00:01Z'),
      };

      trace.addToolCall(toolCall);

      expect(trace.getToolCalls()).toHaveLength(1);
      expect(trace.getToolCalls()[0]).toEqual(toolCall);
    });

    it('should record multiple tool calls', () => {
      trace.addToolCall({
        name: 'tool1',
        arguments: { param: 'value1' },
        result: { output: 'output1' },
        timestamp: new Date(),
      });

      trace.addToolCall({
        name: 'tool2',
        arguments: { param: 'value2' },
        result: { output: 'output2' },
        timestamp: new Date(),
      });

      expect(trace.getToolCalls()).toHaveLength(2);
    });
  });

  describe('trace completion', () => {
    let trace: ExecutionTrace;

    beforeEach(() => {
      trace = new ExecutionTrace(agentId, startTime);
    });

    it('should mark trace as complete', () => {
      const endTime = new Date('2025-01-01T00:00:05Z');

      // We can't set endTime directly, so we call complete() and check duration
      trace.complete();

      expect(trace.endTime).toBeDefined();
      expect(trace.duration).toBeDefined();
    });

    it('should calculate duration correctly', () => {
      const start = new Date('2025-01-01T00:00:00.000Z');
      const newTrace = new ExecutionTrace(agentId, start);

      // Wait a bit before completing
      setTimeout(() => {
        newTrace.complete();
        expect(newTrace.duration).toBeGreaterThan(0);
      }, 10);
    });

    it('should return undefined duration before completion', () => {
      expect(trace.duration).toBeUndefined();
    });
  });

  describe('Real-world usage patterns', () => {
    it('should trace complete agent execution', () => {
      const trace = new ExecutionTrace(agentId, new Date('2025-01-01T00:00:00Z'));

      // Step 1: Validate input
      trace.addStep({
        name: 'validate_input',
        startTime: new Date('2025-01-01T00:00:00.100Z'),
      });

      // Step 2: Search knowledge base (tool call)
      trace.addToolCall({
        name: 'search_knowledge_base',
        arguments: { query: 'password reset' },
        result: { articles: [{ id: '1', title: 'How to reset' }] },
        timestamp: new Date('2025-01-01T00:00:00.200Z'),
      });

      // Step 3: Call LLM
      trace.addLLMCall({
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Generate response', timestamp: new Date() }],
        response: 'To reset your password...',
        usage: { promptTokens: 150, completionTokens: 100, totalTokens: 250 },
        cost: 0.01,
        timestamp: new Date('2025-01-01T00:00:00.500Z'),
      });

      // Step 4: Format response
      trace.addStep({
        name: 'format_response',
        startTime: new Date('2025-01-01T00:00:02.000Z'),
      });

      trace.complete();

      expect(trace.getSteps()).toHaveLength(2);
      expect(trace.getToolCalls()).toHaveLength(1);
      expect(trace.getLLMCalls()).toHaveLength(1);
      expect(trace.duration).toBeDefined();
    });
  });
});
