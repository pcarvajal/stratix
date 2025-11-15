// @ts-nocheck
import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { UserRepository } from '../../domain/repositories/UserRepository.js';

export interface GetUserInput {
  userId: string;
}

export interface GetUserOutput {
  userId: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export class GetUser implements Query {
  constructor(public readonly data: GetUserInput) {}
}

export class GetUserHandler implements QueryHandler<GetUser, Result<GetUserOutput>> {
  constructor(private readonly userRepository: UserRepository) {}

  async handle(query: GetUser): Promise<Result<GetUserOutput>> {
    try {
      // Find user by matching ID string
      // In a real application, you might want to add a more robust ID parsing
      const allUsers = await this.userRepository.findAll();
      const user = allUsers.find((u) => u.id.toString() === query.data.userId);

      if (!user) {
        return Failure.create(new Error('User not found'));
      }

      return Success.create({
        userId: user.id.toString(),
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
