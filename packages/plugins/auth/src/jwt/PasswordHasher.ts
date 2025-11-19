import bcrypt from 'bcrypt';
import type { PasswordHasher as IPasswordHasher } from '../types.js';

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly rounds: number = 10) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
