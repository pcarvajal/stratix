import type { Command, CommandBus, CommandHandler } from '@stratix/abstractions';

/**
 * In-memory command bus implementation.
 *
 * Provides a simple, synchronous command bus for handling commands.
 * Each command type can have only one handler.
 *
 * @example
 * ```typescript
 * const commandBus = new InMemoryCommandBus();
 *
 * // Register handler
 * commandBus.register(CreateUserCommand, async (cmd) => {
 *   const user = await userRepository.create(cmd.email, cmd.name);
 *   return user.id;
 * });
 *
 * // Dispatch command
 * const userId = await commandBus.dispatch(new CreateUserCommand('john@example.com', 'John'));
 * ```
 */
export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<
    new (...args: never[]) => Command,
    CommandHandler<Command, unknown>
  >();

  /**
   * Registers a command handler.
   *
   * @template TCommand - The command type
   * @template TResult - The result type
   * @param commandType - The command class constructor
   * @param handler - The handler function
   * @throws {Error} If a handler is already registered for this command type
   *
   * @example
   * ```typescript
   * commandBus.register(CreateUserCommand, async (cmd) => {
   *   return await createUser(cmd.email, cmd.name);
   * });
   * ```
   */
  register<TCommand extends Command, TResult = void>(
    commandType: new (...args: never[]) => TCommand,
    handler: CommandHandler<TCommand, TResult> | ((command: TCommand) => Promise<TResult>)
  ): void {
    if (this.handlers.has(commandType)) {
      throw new Error(`Handler already registered for command: ${commandType.name}`);
    }

    // Wrap function handlers to match CommandHandler interface
    const wrappedHandler: CommandHandler<Command, unknown> =
      typeof handler === 'function'
        ? { handle: handler as (command: Command) => Promise<unknown> }
        : (handler as CommandHandler<Command, unknown>);

    this.handlers.set(commandType, wrappedHandler);
  }

  /**
   * Dispatches a command to its registered handler.
   *
   * @template TResult - The result type
   * @param command - The command to dispatch
   * @returns The result from the command handler
   * @throws {Error} If no handler is registered for this command type
   *
   * @example
   * ```typescript
   * const result = await commandBus.dispatch(new CreateUserCommand('john@example.com', 'John'));
   * ```
   */
  async dispatch<TResult = void>(command: Command): Promise<TResult> {
    const commandType = command.constructor as new (...args: never[]) => Command;
    const handler = this.handlers.get(commandType);

    if (!handler) {
      throw new Error(`No handler registered for command: ${commandType.name}`);
    }

    return (await handler.handle(command)) as TResult;
  }

  /**
   * Checks if a handler is registered for a command type.
   *
   * @param commandType - The command class constructor
   * @returns True if a handler is registered
   */
  hasHandler(commandType: new (...args: never[]) => Command): boolean {
    return this.handlers.has(commandType);
  }

  /**
   * Unregisters a command handler.
   *
   * @param commandType - The command class constructor
   * @returns True if a handler was unregistered
   */
  unregister(commandType: new (...args: never[]) => Command): boolean {
    return this.handlers.delete(commandType);
  }

  /**
   * Clears all registered handlers.
   */
  clear(): void {
    this.handlers.clear();
  }
}
