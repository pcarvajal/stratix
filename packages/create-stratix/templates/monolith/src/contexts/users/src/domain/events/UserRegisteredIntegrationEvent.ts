// @ts-nocheck
import { IntegrationEvent } from '../../../../../shared/events/IntegrationEvent.js';
import { UserId } from '../../../../../shared/types/CommonTypes.js';

/**
 * Integration Event - Published to other contexts
 *
 * This event crosses context boundaries and notifies other contexts
 * that a new user has been registered.
 */
export class UserRegisteredIntegrationEvent extends IntegrationEvent {
  constructor(
    readonly userId: UserId,
    readonly email: string,
    readonly name: string
  ) {
    super('users');
  }

  get eventType(): string {
    return 'users.user_registered';
  }
}
