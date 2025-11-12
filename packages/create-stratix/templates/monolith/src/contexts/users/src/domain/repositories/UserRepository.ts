// @ts-nocheck
import { User } from '../entities/User.js';
import { UserId } from '../../../../../shared/types/CommonTypes.js';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAllActive(): Promise<User[]>;
  findAll(): Promise<User[]>;
  delete(id: UserId): Promise<void>;
  count(): Promise<number>;
}
