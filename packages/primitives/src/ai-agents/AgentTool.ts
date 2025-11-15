import { Entity } from '../core/Entity.js';
import { EntityId } from '../core/EntityId.js';
import type { Result } from '../result/Result.js';
import { Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';

/**
 * Tool definition for LLM providers
 */
export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

/**
 * Base class for AI Agent Tools.
 *
 * Tools are reusable capabilities that agents can invoke during execution.
 * Each tool is an entity with identity, validation logic, and execution behavior.
 *
 * @template TInput - The type of input the tool accepts
 * @template TOutput - The type of output the tool produces
 *
 * @example
 * ```typescript
 * class WeatherTool extends AgentTool<
 *   { location: string },
 *   { temperature: number; conditions: string }
 * > {
 *   readonly name = 'get_weather';
 *   readonly description = 'Gets current weather for a location';
 *
 *   getDefinition(): ToolDefinition {
 *     return {
 *       name: this.name,
 *       description: this.description,
 *       parameters: {
 *         type: 'object',
 *         properties: {
 *           location: { type: 'string', description: 'City name or coordinates' }
 *         },
 *         required: ['location']
 *       }
 *     };
 *   }
 *
 *   validate(input: unknown): Result<{ location: string }, DomainError> {
 *     if (typeof input !== 'object' || input === null) {
 *       return Result.fail(new DomainError('INVALID_INPUT', 'Input must be an object'));
 *     }
 *
 *     const { location } = input as any;
 *     if (typeof location !== 'string' || location.trim().length === 0) {
 *       return Result.fail(new DomainError('INVALID_LOCATION', 'Location must be a non-empty string'));
 *     }
 *
 *     return Result.ok({ location: location.trim() });
 *   }
 *
 *   async execute(input: { location: string }): Promise<Result<{ temperature: number; conditions: string }, DomainError>> {
 *     try {
 *       const weather = await this.weatherApi.get(input.location);
 *       return Result.ok({
 *         temperature: weather.temp,
 *         conditions: weather.conditions
 *       });
 *     } catch (error) {
 *       return Result.fail(
 *         new DomainError('WEATHER_API_ERROR', `Failed to fetch weather: ${error}`)
 *       );
 *     }
 *   }
 * }
 * ```
 */
export abstract class AgentTool<TInput, TOutput> extends Entity<'AgentTool'> {
  /**
   * Unique name of the tool (must be unique within an agent's toolset)
   */
  abstract readonly name: string;

  /**
   * Human-readable description of what the tool does
   */
  abstract readonly description: string;

  /**
   * Gets the tool definition for LLM providers (OpenAI, Anthropic, etc.)
   *
   * @returns Tool definition with JSON Schema parameters
   */
  abstract getDefinition(): ToolDefinition;

  /**
   * Validates the input before execution.
   * This should check types, required fields, and business constraints.
   *
   * @param input - The raw input to validate
   * @returns Result with validated input or error
   */
  abstract validate(input: unknown): Result<TInput, DomainError>;

  /**
   * Executes the tool with validated input.
   *
   * @param input - The validated input
   * @returns Result with output or error
   */
  abstract execute(input: TInput): Promise<Result<TOutput, DomainError>>;

  /**
   * Executes the tool with automatic validation.
   * This is the main entry point for tool execution.
   *
   * @param input - The raw input to validate and execute
   * @returns Result with output or validation/execution error
   *
   * @example
   * ```typescript
   * const result = await weatherTool.run({ location: 'San Francisco' });
   * if (result.isSuccess) {
   *   console.log(result.value.temperature);
   * }
   * ```
   */
  async run(input: unknown): Promise<Result<TOutput, DomainError>> {
    // Validate input
    const validationResult = this.validate(input);
    if (validationResult.isFailure) {
      return new Failure(validationResult.error);
    }

    // Execute with validated input
    return await this.execute(validationResult.value);
  }

  /**
   * Gets the tool's unique identifier
   */
  getToolId(): EntityId<'AgentTool'> {
    return this.id;
  }

  /**
   * Creates a simple tool from functions
   *
   * @param options - Tool configuration
   * @returns A new tool instance
   *
   * @example
   * ```typescript
   * const addTool = AgentTool.fromFunctions({
   *   name: 'add',
   *   description: 'Adds two numbers',
   *   parameters: {
   *     type: 'object',
   *     properties: {
   *       a: { type: 'number' },
   *       b: { type: 'number' }
   *     },
   *     required: ['a', 'b']
   *   },
   *   validate: (input: unknown) => {
   *     // Validation logic
   *     return Result.ok(input as { a: number; b: number });
   *   },
   *   execute: async (input: { a: number; b: number }) => {
   *     return Result.ok({ result: input.a + input.b });
   *   }
   * });
   * ```
   */
  static fromFunctions<TInput, TOutput>(options: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    validate: (input: unknown) => Result<TInput, DomainError>;
    execute: (input: TInput) => Promise<Result<TOutput, DomainError>>;
  }): AgentTool<TInput, TOutput> {
    return new FunctionTool(options);
  }
}

/**
 * Tool implementation using functions
 * @private
 */
class FunctionTool<TInput, TOutput> extends AgentTool<TInput, TOutput> {
  readonly name: string;
  readonly description: string;
  private parameters: Record<string, unknown>;
  private validateFn: (input: unknown) => Result<TInput, DomainError>;
  private executeFn: (input: TInput) => Promise<Result<TOutput, DomainError>>;

  constructor(options: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    validate: (input: unknown) => Result<TInput, DomainError>;
    execute: (input: TInput) => Promise<Result<TOutput, DomainError>>;
  }) {
    super(EntityId.create<'AgentTool'>(), new Date(), new Date());
    this.name = options.name;
    this.description = options.description;
    this.parameters = options.parameters;
    this.validateFn = options.validate;
    this.executeFn = options.execute;
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }

  validate(input: unknown): Result<TInput, DomainError> {
    return this.validateFn(input);
  }

  async execute(input: TInput): Promise<Result<TOutput, DomainError>> {
    return await this.executeFn(input);
  }
}
