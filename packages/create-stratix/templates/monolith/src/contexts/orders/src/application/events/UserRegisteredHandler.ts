// @ts-nocheck
import { EventHandler } from '@stratix/abstractions';
import { Logger } from '@stratix/abstractions';
import { UserRegisteredIntegrationEvent } from '../../../../users/src/domain/events/UserRegisteredIntegrationEvent.js';

/**
 * Example of inter-context communication via integration events
 *
 * Orders context listens to UserRegisteredIntegrationEvent from Users context.
 * In a real application, you might want to:
 * - Create a welcome offer for the new user
 * - Initialize user preferences
 * - Send notifications
 * - etc.
 */
export class UserRegisteredHandler implements EventHandler<UserRegisteredIntegrationEvent> {
  constructor(private readonly logger: Logger) {}

  async handle(event: UserRegisteredIntegrationEvent): Promise<void> {
    this.logger.info('Orders context: New user registered', {
      userId: event.userId.toString(),
      email: event.email,
      name: event.name,
      eventId: event.eventId,
      contextName: event.contextName,
    });

    // Here you could:
    // - Create a welcome discount for the user
    // - Initialize order preferences
    // - Setup customer-specific pricing
    // - etc.

    // For now, we just log it to show the communication works
    this.logger.info('Orders context: User onboarding completed');
  }
}
