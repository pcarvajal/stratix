/**
 * Base class for tools that AI agents can use.
 *
 * Tools are validated functions that agents can call to perform specific actions
 * like querying databases, searching knowledge bases, or creating resources.
 *
 * Note: When using with schema validation libraries like Zod, implement the
 * validation in the concrete tool class.
 *
 * @template TInput - Input type for the tool
 * @template TOutput - Output type from the tool
 *
 * @example
 * ```typescript
 * class SearchKnowledgeBaseTool extends AgentTool<
 *   { query: string },
 *   { articles: Article[] }
 * > {
 *   readonly name = 'search_knowledge_base';
 *   readonly description = 'Search company knowledge base';
 *   readonly requiresApproval = false;
 *
 *   async execute(input: { query: string }) {
 *     const results = await this.knowledgeBase.search(input.query);
 *     return { articles: results };
 *   }
 *
 *   async validate(input: unknown): Promise<{ query: string }> {
 *     // Validate input shape
 *     if (typeof input !== 'object' || !input || !('query' in input)) {
 *       throw new Error('Invalid input');
 *     }
 *     return input as { query: string };
 *   }
 * }
 * ```
 */
export abstract class AgentTool<TInput, TOutput> {
  /**
   * Unique name of the tool
   */
  abstract readonly name: string;

  /**
   * Human-readable description of what the tool does
   */
  abstract readonly description: string;

  /**
   * Whether this tool requires human approval before execution
   */
  readonly requiresApproval: boolean = false;

  /**
   * Executes the tool with validated input
   *
   * @param input - The validated input
   * @returns The tool output
   */
  abstract execute(input: TInput): Promise<TOutput>;

  /**
   * Validates input before execution
   *
   * @param input - The raw input to validate
   * @returns The validated input
   * @throws {Error} If validation fails
   */
  abstract validate(input: unknown): Promise<TInput>;

  /**
   * Executes the tool with automatic validation
   *
   * @param input - The raw input
   * @returns The tool output
   * @throws {Error} If validation fails or execution errors
   */
  async executeValidated(input: unknown): Promise<TOutput> {
    const validatedInput = await this.validate(input);
    return await this.execute(validatedInput);
  }

  /**
   * Gets the tool definition for LLM function calling
   *
   * @returns The tool definition
   */
  abstract getDefinition(): ToolDefinition;
}

/**
 * Tool definition for LLM function calling
 */
export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}
