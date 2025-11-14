import type {
  AIAgent,
  AgentId,
  AgentResult,
  AgentContext,
  ExecutionTrace,
} from '@stratix/primitives';
import type {
  AgentOrchestrator,
  AgentRepository,
  ExecutionAuditLog,
  LLMProvider,
} from '@stratix/abstractions';

/**
 * Configuration options for the orchestrator
 */
export interface OrchestratorOptions {
  /**
   * Whether to enable audit logging
   */
  auditEnabled: boolean;

  /**
   * Whether to enforce budget limits
   */
  budgetEnforcement: boolean;

  /**
   * Maximum execution time in milliseconds
   */
  maxExecutionTime?: number;

  /**
   * Whether to enable automatic retries on failure
   */
  autoRetry: boolean;

  /**
   * Maximum number of retry attempts
   */
  maxRetries: number;
}

/**
 * Error thrown when an agent is not found
 */
export class AgentNotFoundError extends Error {
  constructor(agentId: AgentId) {
    super(`Agent not found: ${agentId.value}`);
    this.name = 'AgentNotFoundError';
  }
}

/**
 * Error thrown when budget is exceeded
 */
export class BudgetExceededError extends Error {
  constructor(message: string = 'Budget exceeded') {
    super(message);
    this.name = 'BudgetExceededError';
  }
}

/**
 * Error thrown when execution timeout is reached
 */
export class ExecutionTimeoutError extends Error {
  constructor(timeout: number) {
    super(`Execution timeout after ${timeout}ms`);
    this.name = 'ExecutionTimeoutError';
  }
}

/**
 * Stratix implementation of AgentOrchestrator.
 *
 * Manages agent lifecycle, execution, tracing, budgets, and coordination.
 *
 * @example
 * ```typescript
 * const orchestrator = new StratixAgentOrchestrator(
 *   repository,
 *   auditLog,
 *   llmProvider,
 *   {
 *     auditEnabled: true,
 *     budgetEnforcement: true,
 *     autoRetry: true,
 *     maxRetries: 3
 *   }
 * );
 *
 * orchestrator.registerAgent(customerSupportAgent);
 *
 * const context = new AgentContext({
 *   sessionId: 'session-123',
 *   environment: 'production'
 * });
 * context.setBudget(1.00);
 *
 * const result = await orchestrator.executeAgent(agentId, input, context);
 * ```
 */
export class StratixAgentOrchestrator implements AgentOrchestrator {
  constructor(
    private repository: AgentRepository,
    private auditLog: ExecutionAuditLog,
    private llmProvider: LLMProvider,
    private options: OrchestratorOptions
  ) {}

  /**
   * Gets the LLM provider used by this orchestrator
   * (Reserved for future use in centralized LLM management)
   */
  getLLMProvider(): LLMProvider {
    return this.llmProvider;
  }

  registerAgent(agent: AIAgent<unknown, unknown>): void {
    void this.repository.save(agent);
  }

  unregisterAgent(agentId: AgentId): void {
    void this.repository.delete(agentId);
  }

  async executeAgent<TInput, TOutput>(
    agentId: AgentId,
    input: TInput,
    context: AgentContext
  ): Promise<AgentResult<TOutput>> {
    const startTime = new Date();

    // Load agent
    const agent = await this.repository.findById(agentId);
    if (!agent) {
      throw new AgentNotFoundError(agentId);
    }

    // Check budget before execution
    if (this.options.budgetEnforcement && context.isBudgetExceeded()) {
      return await this.createFailureResult<TOutput>(
        new BudgetExceededError(),
        agent,
        context,
        startTime
      );
    }

    // Initialize trace
    const trace = new (await import('@stratix/primitives')).ExecutionTrace(agentId, startTime);

    // Set context on agent
    (agent as AIAgent<TInput, TOutput>).setContext(context);

    try {
      // Execute with retries if enabled
      const result = this.options.autoRetry
        ? await this.executeWithRetries(
            agent as AIAgent<TInput, TOutput>,
            input,
            this.options.maxRetries
          )
        : await this.executeSingle(agent as AIAgent<TInput, TOutput>, input);

      // Complete trace
      trace.complete();
      result.withTrace(trace);

      // Audit log if enabled
      if (this.options.auditEnabled) {
        await this.logExecution(agent, input, result, context, trace, startTime);
      }

      return result;
    } catch (error) {
      trace.complete();

      const result = await this.createFailureResult<TOutput>(
        error instanceof Error ? error : new Error(String(error)),
        agent,
        context,
        startTime
      );

      result.withTrace(trace);

      // Audit log failures too
      if (this.options.auditEnabled) {
        await this.logExecution(agent, input, result, context, trace, startTime);
      }

      return result;
    }
  }

  async executeSequential(
    agents: AIAgent<unknown, unknown>[],
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<unknown>> {
    let currentInput = input;
    let lastResult: AgentResult<unknown> | null = null;

    for (const agent of agents) {
      const result = await this.executeAgent(agent.getAgentId(), currentInput, context);

      lastResult = result;

      if (!result.isSuccess()) {
        return result;
      }

      // Output of current agent becomes input of next agent
      currentInput = result.data;
    }

    return lastResult!;
  }

  async executeParallel(
    agents: AIAgent<unknown, unknown>[],
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<unknown>[]> {
    const promises = agents.map((agent) => this.executeAgent(agent.getAgentId(), input, context));

    return await Promise.all(promises);
  }

  async delegateToAgent(
    fromAgent: AIAgent<unknown, unknown>,
    toAgent: AIAgent<unknown, unknown>,
    input: unknown
  ): Promise<AgentResult<unknown>> {
    // Use the same context as the delegating agent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const context = (fromAgent as any).currentContext;
    if (!context) {
      throw new Error('From agent has no context set');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.executeAgent(toAgent.getAgentId(), input, context);
  }

  private async executeSingle<TInput, TOutput>(
    agent: AIAgent<TInput, TOutput>,
    input: TInput
  ): Promise<AgentResult<TOutput>> {
    // Use executeWithEvents which handles hooks and domain events
    return await agent.executeWithEvents(input);
  }

  private async executeWithRetries<TInput, TOutput>(
    agent: AIAgent<TInput, TOutput>,
    input: TInput,
    maxRetries: number
  ): Promise<AgentResult<TOutput>> {
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        const result = await this.executeSingle(agent, input);

        // If successful, return immediately
        if (result.isSuccess()) {
          return result;
        }

        // If failure but not an error, return (don't retry)
        if (result.isFailure() && result.error) {
          lastError = result.error;
        } else {
          return result;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Error hook is already called by executeWithEvents
      }

      attempts++;

      // Wait before retry (exponential backoff)
      if (attempts <= maxRetries) {
        await this.sleep(Math.min(1000 * Math.pow(2, attempts - 1), 10000));
      }
    }

    // All retries exhausted
    throw lastError || new Error('Execution failed after retries');
  }

  private async createFailureResult<TOutput>(
    error: Error,
    agent: AIAgent<unknown, unknown>,
    _context: AgentContext,
    startTime: Date
  ): Promise<AgentResult<TOutput>> {
    const { AgentResult } = await import('@stratix/primitives');

    return AgentResult.failure<TOutput>(error, {
      model: agent.model.model,
      duration: new Date().getTime() - startTime.getTime(),
      stage: 'execution',
    });
  }

  private async logExecution(
    agent: AIAgent<unknown, unknown>,
    input: unknown,
    result: AgentResult<unknown>,
    context: AgentContext,
    trace: ExecutionTrace,
    startTime: Date
  ): Promise<void> {
    const execution = {
      id: this.generateExecutionId(),
      agentId: agent.getAgentId(),
      agentName: agent.name,
      agentVersion: agent.version,
      input,
      output: result.data,
      context,
      trace,
      success: result.isSuccess(),
      error: result.error,
      startTime,
      endTime: new Date(),
      duration: trace.duration || 0,
      cost: trace.getTotalCost(),
      userId: context.userId,
    };

    await this.auditLog.logExecution(execution);
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
