import { Event } from './Event.js';

/**
 * Handler for processing events.
 *
 * Event handlers respond to events that have occurred in the system.
 * Multiple handlers can subscribe to the same event.
 *
 * @template TEvent - The type of event this handler processes
 *
 * @example
 * ```typescript
 * class SendWelcomeEmailHandler implements EventHandler<UserCreatedEvent> {
 *   async handle(event: UserCreatedEvent): Promise<void> {
 *     await this.emailService.sendWelcomeEmail(event.email);
 *   }
 * }
 *
 * class UpdateStatisticsHandler implements EventHandler<UserCreatedEvent> {
 *   async handle(event: UserCreatedEvent): Promise<void> {
 *     await this.statistics.incrementUserCount();
 *   }
 * }
 * ```
 */
export interface EventHandler<TEvent extends Event> {
  /**
   * Handles the event.
   *
   * @param event - The event to handle
   */
  handle(event: TEvent): Promise<void>;
}
