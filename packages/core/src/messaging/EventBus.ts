import { Event } from './Event.js';
import { EventHandler } from './EventHandler.js';

/**
 * Bus for publishing events to their handlers.
 *
 * Supports multiple handlers for the same event type (pub/sub pattern).
 *
 * @example
 * ```typescript
 * // Register handlers
 * eventBus.subscribe(UserCreatedEvent, new SendWelcomeEmailHandler());
 * eventBus.subscribe(UserCreatedEvent, new UpdateStatisticsHandler());
 *
 * // Publish event
 * await eventBus.publish(
 *   new UserCreatedEvent('user-123', 'user@example.com')
 * );
 * ```
 */
export interface EventBus {
  /**
   * Subscribes a handler to a specific event type.
   *
   * Multiple handlers can subscribe to the same event type.
   *
   * @template TEvent - The type of event
   * @param eventType - The event class or identifier
   * @param handler - The handler for this event type
   *
   * @example
   * ```typescript
   * eventBus.subscribe(
   *   UserCreatedEvent,
   *   new SendWelcomeEmailHandler()
   * );
   * ```
   */
  subscribe<TEvent extends Event>(
    eventType: new (...args: unknown[]) => TEvent,
    handler: EventHandler<TEvent>
  ): void;

  /**
   * Publishes a single event to all subscribed handlers.
   *
   * Handlers are executed in parallel.
   *
   * @param event - The event to publish
   *
   * @example
   * ```typescript
   * const event = new UserCreatedEvent('user-123', 'user@example.com');
   * await eventBus.publish(event);
   * ```
   */
  publish(event: Event): Promise<void>;

  /**
   * Publishes multiple events to all subscribed handlers.
   *
   * Events are published in order, but handlers within each event
   * are executed in parallel.
   *
   * @param events - The events to publish
   *
   * @example
   * ```typescript
   * await eventBus.publishAll([
   *   new UserCreatedEvent('user-123', 'user@example.com'),
   *   new WelcomeEmailSentEvent('user-123')
   * ]);
   * ```
   */
  publishAll(events: Event[]): Promise<void>;

  /**
   * Unsubscribes a handler from a specific event type.
   *
   * @template TEvent - The type of event
   * @param eventType - The event class or identifier
   * @param handler - The handler to unsubscribe
   *
   * @example
   * ```typescript
   * eventBus.unsubscribe(UserCreatedEvent, handler);
   * ```
   */
  unsubscribe<TEvent extends Event>(
    eventType: new (...args: unknown[]) => TEvent,
    handler: EventHandler<TEvent>
  ): void;
}
