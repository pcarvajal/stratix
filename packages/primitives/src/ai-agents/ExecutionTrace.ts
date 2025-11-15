import type { AgentId, ExecutionStep, LLMCall, ToolCall } from './types.js';

/**
 * Traces the execution of an AI agent, recording steps, LLM calls, and tool usage.
 *
 * @example
 * ```typescript
 * const trace = new ExecutionTrace(agentId, new Date());
 *
 * trace.addStep({ name: 'initialize', startTime: new Date() });
 * trace.addLLMCall({
 *   provider: 'openai',
 *   model: 'gpt-4',
 *   messages: [...],
 *   response: '...',
 *   usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
 *   cost: 0.01,
 *   timestamp: new Date()
 * });
 * trace.complete();
 * ```
 */
export class ExecutionTrace {
  public readonly id: string;
  public readonly agentId: AgentId;
  public readonly startTime: Date;
  public endTime?: Date;
  public duration?: number;

  private _steps: ExecutionStep[] = [];
  private _llmCalls: LLMCall[] = [];
  private _toolCalls: ToolCall[] = [];

  constructor(agentId: AgentId, startTime: Date) {
    this.id = this.generateTraceId();
    this.agentId = agentId;
    this.startTime = startTime;
  }

  /**
   * Adds an execution step to the trace
   *
   * @param step - The execution step to add
   */
  addStep(step: ExecutionStep): void {
    this._steps.push(step);
  }

  /**
   * Adds an LLM call to the trace
   *
   * @param call - The LLM call to record
   */
  addLLMCall(call: LLMCall): void {
    this._llmCalls.push(call);
  }

  /**
   * Adds a tool call to the trace
   *
   * @param call - The tool call to record
   */
  addToolCall(call: ToolCall): void {
    this._toolCalls.push(call);
  }

  /**
   * Marks the trace as complete
   */
  complete(): void {
    this.endTime = new Date();
    this.duration = this.endTime.getTime() - this.startTime.getTime();
  }

  /**
   * Gets all execution steps
   */
  getSteps(): ReadonlyArray<ExecutionStep> {
    return this._steps;
  }

  /**
   * Gets all LLM calls
   */
  getLLMCalls(): ReadonlyArray<LLMCall> {
    return this._llmCalls;
  }

  /**
   * Gets all tool calls
   */
  getToolCalls(): ReadonlyArray<ToolCall> {
    return this._toolCalls;
  }

  /**
   * Gets the total number of tokens used across all LLM calls
   */
  getTotalTokens(): number {
    return this._llmCalls.reduce((sum, call) => sum + call.usage.totalTokens, 0);
  }

  /**
   * Gets the total cost across all LLM calls
   */
  getTotalCost(): number {
    return this._llmCalls.reduce((sum, call) => sum + call.cost, 0);
  }

  /**
   * Converts the trace to a plain JSON object
   */
  toJSON(): object {
    return {
      id: this.id,
      agentId: this.agentId.value,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime?.toISOString(),
      duration: this.duration,
      steps: this._steps,
      llmCalls: this._llmCalls.map((call) => ({
        ...call,
        timestamp: call.timestamp.toISOString(),
      })),
      toolCalls: this._toolCalls,
      totalTokens: this.getTotalTokens(),
      totalCost: this.getTotalCost(),
    };
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
