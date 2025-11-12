// @ts-nocheck
import { User } from '../../domain/entities/User.js';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { UserId } from '../../../../../shared/types/CommonTypes.js';

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.users.set(user.id.toString(), user);
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.toString()) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findAllActive(): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.isActive);
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.toString());
  }

  async count(): Promise<number> {
    return this.users.size;
  }
}
