import { Email, EntityId } from '@stratix/primitives';

/**
 * Data Factory for generating test data
 *
 * Provides helper methods for creating common test data.
 */
export class DataFactory {
  private static counter = 0;

  /**
   * Generate a unique email
   */
  static email(prefix = 'test'): Email {
    this.counter++;
    const result = Email.create(`${prefix}${this.counter}@example.com`);
    if (!result.isSuccess) {
      throw new Error('Failed to create email');
    }
    return result.value;
  }

  /**
   * Generate a unique string
   */
  static string(prefix = 'test'): string {
    this.counter++;
    return `${prefix}${this.counter}`;
  }

  /**
   * Generate a unique number
   */
  static number(min = 0, max = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a unique entity ID
   */
  static entityId<T extends string>(): EntityId<T> {
    return EntityId.create<T>();
  }

  /**
   * Generate a random boolean
   */
  static boolean(): boolean {
    return Math.random() > 0.5;
  }

  /**
   * Generate a random date
   */
  static date(daysAgo = 0): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  /**
   * Pick a random element from an array
   */
  static pick<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Reset the counter
   */
  static reset(): void {
    this.counter = 0;
  }
}
