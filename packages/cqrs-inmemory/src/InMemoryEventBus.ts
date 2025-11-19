import type { Event, EventBus, EventHandler } from '@stratix/core';

/**
 * In-memory event bus implementation.
 *
 * Provides a simple, synchronous event bus with pub/sub capabilities.
 * Each event type can have multiple subscribers.
 *
 * @example
 * ```typescript
 * const eventBus = new InMemoryEventBus();
 *
 * // Subscribe to event
 * eventBus.subscribe(UserCreatedEvent, async (event) => {
 *   await sendWelcomeEmail(event.userId);
 * });
 *
 * eventBus.subscribe(UserCreatedEvent, async (event) => {
 *   await logUserCreation(event.userId);
 * });
 *
 * // Publish event
 * await eventBus.publish(new UserCreatedEvent('123', 'john@example.com'));
 * ```
 */
export class InMemoryEventBus implements EventBus {
  private readonly subscribers = new Map<
    new (...args: never[]) => Event,
    Set<EventHandler<Event>>
  >();
  private readonly handlerMap = new WeakMap<
    EventHandler<Event> | ((event: Event) => Promise<void>),
    EventHandler<Event>
  >();

  /**
   * Subscribes to an event type.
   *
   * Multiple handlers can subscribe to the same event type.
   *
   * @template TEvent - The event type
   * @param eventType - The event class constructor
   * @param handler - The handler function
   *
   * @example
   * ```typescript
   * eventBus.subscribe(UserCreatedEvent, async (event) => {
   *   console.log('User created:', event.userId);
   * });
   * ```
   */
  subscribe<TEvent extends Event>(
    eventType: new (...args: never[]) => TEvent,
    handler: EventHandler<TEvent> | ((event: TEvent) => Promise<void>)
  ): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    // Check if we already have a wrapped handler for this
    let wrappedHandler = this.handlerMap.get(handler as EventHandler<Event>);

    if (!wrappedHandler) {
      // Wrap function handlers to match EventHandler interface
      wrappedHandler =
        typeof handler === 'function'
          ? { handle: handler as (event: Event) => Promise<void> }
          : (handler as EventHandler<Event>);

      this.handlerMap.set(handler as EventHandler<Event>, wrappedHandler);
    }

    this.subscribers.get(eventType)!.add(wrappedHandler);
  }

  /**
   * Publishes an event to all subscribers.
   *
   * All handlers are invoked in parallel.
   *
   * @param event - The event to publish
   *
   * @example
   * ```typescript
   * await eventBus.publish(new UserCreatedEvent('123', 'john@example.com'));
   * ```
   */
  async publish(event: Event): Promise<void> {
    const eventType = event.constructor as new (...args: never[]) => Event;
    const handlers = this.subscribers.get(eventType);

    if (!handlers || handlers.size === 0) {
      return;
    }

    await Promise.all(Array.from(handlers).map((handler) => handler.handle(event)));
  }

  /**
   * Publishes multiple events to their subscribers.
   *
   * Events are published in order, but handlers for each event run in parallel.
   *
   * @param events - The events to publish
   *
   * @example
   * ```typescript
   * await eventBus.publishAll([
   *   new UserCreatedEvent('123', 'john@example.com'),
   *   new WelcomeEmailSentEvent('123')
   * ]);
   * ```
   */
  async publishAll(events: Event[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Unsubscribes a handler from an event type.
   *
   * @template TEvent - The event type
   * @param eventType - The event class constructor
   * @param handler - The handler function to remove
   *
   * @example
   * ```typescript
   * const handler = async (event) => console.log(event);
   * eventBus.subscribe(UserCreatedEvent, handler);
   * eventBus.unsubscribe(UserCreatedEvent, handler);
   * ```
   */
  unsubscribe<TEvent extends Event>(
    eventType: new (...args: never[]) => TEvent,
    handler: EventHandler<TEvent> | ((event: TEvent) => Promise<void>)
  ): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      // Look up the wrapped handler
      const wrappedHandler = this.handlerMap.get(handler as EventHandler<Event>);
      if (wrappedHandler) {
        handlers.delete(wrappedHandler);
      }
    }
  }

  /**
   * Gets the number of subscribers for an event type.
   *
   * @param eventType - The event class constructor
   * @returns The number of subscribers
   */
  getSubscriberCount(eventType: new (...args: never[]) => Event): number {
    const handlers = this.subscribers.get(eventType);
    return handlers ? handlers.size : 0;
  }

  /**
   * Clears all subscribers for a specific event type.
   *
   * @param eventType - The event class constructor
   */
  clearSubscribers(eventType: new (...args: never[]) => Event): void {
    this.subscribers.delete(eventType);
  }

  /**
   * Clears all subscribers for all event types.
   */
  clear(): void {
    this.subscribers.clear();
  }
}
