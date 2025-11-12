import { Command } from './Command.js';
import { CommandHandler } from './CommandHandler.js';

/**
 * Bus for dispatching commands to their handlers.
 *
 * Ensures that each command is handled by exactly one handler.
 *
 * @example
 * ```typescript
 * // Register handler
 * commandBus.register(CreateUserCommand, new CreateUserCommandHandler());
 *
 * // Dispatch command
 * const user = await commandBus.dispatch<User>(
 *   new CreateUserCommand('user@example.com', 'John Doe')
 * );
 * ```
 */
export interface CommandBus {
  /**
   * Registers a handler for a specific command type.
   *
   * @template TCommand - The type of command
   * @template TResult - The result type
   * @param commandType - The command class or identifier
   * @param handler - The handler for this command type
   *
   * @example
   * ```typescript
   * commandBus.register(
   *   CreateUserCommand,
   *   new CreateUserCommandHandler(repository)
   * );
   * ```
   */
  register<TCommand extends Command, TResult = void>(
    commandType: new (...args: unknown[]) => TCommand,
    handler: CommandHandler<TCommand, TResult>
  ): void;

  /**
   * Dispatches a command to its registered handler.
   *
   * @template TResult - The expected result type
   * @param command - The command to dispatch
   * @returns The result from the command handler
   * @throws Error if no handler is registered for the command
   *
   * @example
   * ```typescript
   * const command = new CreateUserCommand('user@example.com', 'John');
   * const user = await commandBus.dispatch<User>(command);
   * ```
   */
  dispatch<TResult = void>(command: Command): Promise<TResult>;
}
