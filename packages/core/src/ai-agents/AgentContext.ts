import type { AgentMessage, AgentCost } from './types.js';

/**
 * Execution context for an AI agent, managing conversation history, cost tracking, and budgets.
 *
 * @example
 * ```typescript
 * const context = new AgentContext({
 *   userId: 'user-123',
 *   sessionId: 'session-abc',
 *   environment: 'production',
 *   metadata: { department: 'support' }
 * });
 *
 * context.setBudget(1.00); // $1 max
 * context.addMessage({ role: 'user', content: 'Hello', timestamp: new Date() });
 * context.recordCost({ provider: 'openai', model: 'gpt-4', inputTokens: 100, outputTokens: 50, cost: 0.05 });
 * ```
 */
export class AgentContext {
  public readonly userId?: string;
  public readonly sessionId: string;
  public readonly timestamp: Date;
  public readonly environment: 'development' | 'staging' | 'production';
  public readonly metadata: Record<string, unknown>;

  private _messages: AgentMessage[] = [];
  private _costs: AgentCost[] = [];
  private _budget?: number;
  private _startTime: Date;

  constructor(options: {
    userId?: string;
    sessionId: string;
    environment: 'development' | 'staging' | 'production';
    metadata?: Record<string, unknown>;
  }) {
    this.userId = options.userId;
    this.sessionId = options.sessionId;
    this.timestamp = new Date();
    this.environment = options.environment;
    this.metadata = options.metadata ?? {};
    this._startTime = new Date();
  }

  /**
   * Adds a message to the conversation history
   *
   * @param message - The message to add
   */
  addMessage(message: AgentMessage): void {
    this._messages.push(message);
  }

  /**
   * Gets all messages in the conversation
   */
  getMessages(): ReadonlyArray<AgentMessage> {
    return this._messages;
  }

  /**
   * Gets the most recent N messages
   *
   * @param count - Number of messages to retrieve
   */
  getRecentMessages(count: number): ReadonlyArray<AgentMessage> {
    return this._messages.slice(-count);
  }

  /**
   * Records a cost incurred during agent execution
   *
   * @param cost - The cost information to record
   */
  recordCost(cost: AgentCost): void {
    this._costs.push(cost);
  }

  /**
   * Gets the total cost of all operations in this context
   */
  getTotalCost(): number {
    return this._costs.reduce((sum, cost) => sum + cost.cost, 0);
  }

  /**
   * Gets all recorded costs
   */
  getCosts(): ReadonlyArray<AgentCost> {
    return this._costs;
  }

  /**
   * Sets a budget limit for this context
   *
   * @param budget - Maximum allowed cost in dollars
   */
  setBudget(budget: number): void {
    if (budget <= 0) {
      throw new Error('Budget must be positive');
    }
    this._budget = budget;
  }

  /**
   * Gets the remaining budget
   *
   * @returns The remaining budget, or undefined if no budget was set
   */
  getRemainingBudget(): number | undefined {
    if (this._budget === undefined) {
      return undefined;
    }
    return Math.max(0, this._budget - this.getTotalCost());
  }

  /**
   * Checks if the budget has been exceeded
   */
  isBudgetExceeded(): boolean {
    if (this._budget === undefined) {
      return false;
    }
    return this.getTotalCost() >= this._budget;
  }

  /**
   * Gets the duration of the context in milliseconds
   */
  getDuration(): number {
    return new Date().getTime() - this._startTime.getTime();
  }
}
