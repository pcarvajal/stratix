// @ts-nocheck
import { Command, CommandHandler, EventBus } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { User } from '../../domain/entities/User.js';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { UserRegisteredIntegrationEvent } from '../../domain/events/UserRegisteredIntegrationEvent.js';

export interface RegisterUserInput {
  email: string;
  name: string;
}

export interface RegisterUserOutput {
  userId: string;
}

export class RegisterUser implements Command {
  constructor(public readonly data: RegisterUserInput) {}
}

export class RegisterUserHandler
  implements CommandHandler<RegisterUser, Result<RegisterUserOutput>>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: RegisterUser): Promise<Result<RegisterUserOutput>> {
    try {
      // Validate email format
      if (!this.isValidEmail(command.data.email)) {
        return Failure.create(new Error('Invalid email format'));
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(command.data.email);
      if (existingUser) {
        return Failure.create(new Error('User with this email already exists'));
      }

      // Create user
      const user = User.create({
        email: command.data.email,
        name: command.data.name,
        isActive: true,
      });

      // Save user
      await this.userRepository.save(user);

      // Publish integration event to other contexts
      await this.eventBus.publish(
        new UserRegisteredIntegrationEvent(user.id, user.email, user.name)
      );

      return Success.create({ userId: user.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
