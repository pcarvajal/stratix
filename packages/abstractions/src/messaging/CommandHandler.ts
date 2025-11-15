import { Command } from './Command.js';

/**
 * Handler for processing commands.
 *
 * Command handlers contain the business logic for executing commands.
 * Each command should have exactly one handler.
 *
 * @template TCommand - The type of command this handler processes
 * @template TResult - The result type returned by the handler
 *
 * @example
 * ```typescript
 * class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, User> {
 *   async handle(command: CreateUserCommand): Promise<User> {
 *     const user = new User(command.email, command.name);
 *     await this.repository.save(user);
 *     return user;
 *   }
 * }
 * ```
 */
export interface CommandHandler<TCommand extends Command, TResult = void> {
  /**
   * Handles the command and returns a result.
   *
   * @param command - The command to handle
   * @returns The result of handling the command
   */
  handle(command: TCommand): Promise<TResult>;
}
