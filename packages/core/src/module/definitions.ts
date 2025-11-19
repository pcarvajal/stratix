import { Command } from '../messaging/Command.js';
import { Query } from '../messaging/Query.js';
import { Event } from '../messaging/Event.js';
import { CommandHandler } from '../messaging/CommandHandler.js';
import { QueryHandler } from '../messaging/QueryHandler.js';
import { EventHandler } from '../messaging/EventHandler.js';

/**
 * Definition for registering a command with its handler.
 *
 * @template TCommand - The command type
 * @template TResult - The result type returned by the handler
 */
export interface CommandDefinition<TCommand extends Command = Command, TResult = unknown> {
  /**
   * Unique name for the command type.
   */
  readonly name: string;

  /**
   * The command class constructor.
   */
  readonly commandType: new (...args: unknown[]) => TCommand;

  /**
   * The handler instance for this command.
   */
  readonly handler: CommandHandler<TCommand, TResult>;
}

/**
 * Definition for registering a query with its handler.
 *
 * @template TQuery - The query type
 * @template TResult - The result type returned by the handler
 */
export interface QueryDefinition<TQuery extends Query = Query, TResult = unknown> {
  /**
   * Unique name for the query type.
   */
  readonly name: string;

  /**
   * The query class constructor.
   */
  readonly queryType: new (...args: unknown[]) => TQuery;

  /**
   * The handler instance for this query.
   */
  readonly handler: QueryHandler<TQuery, TResult>;
}

/**
 * Definition for registering an event handler.
 *
 * @template TEvent - The event type
 */
export interface EventHandlerDefinition<TEvent extends Event = Event> {
  /**
   * Name of the event to handle.
   */
  readonly eventName: string;

  /**
   * The event class constructor.
   */
  readonly eventType: new (...args: unknown[]) => TEvent;

  /**
   * The handler instance for this event.
   */
  readonly handler: EventHandler<TEvent>;
}

/**
 * Definition for registering a repository or service in the DI container.
 */
export interface RepositoryDefinition {
  /**
   * Token or name to register in the container.
   */
  readonly token: string;

  /**
   * The repository or service instance/factory.
   */
  readonly instance: unknown;

  /**
   * Whether this is a singleton (default: true).
   */
  readonly singleton?: boolean;
}
