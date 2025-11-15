import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Command } from '@stratix/abstractions';
import { InMemoryCommandBus } from '../InMemoryCommandBus.js';

// Test commands
class CreateUserCommand implements Command {
  constructor(
    public readonly email: string,
    public readonly name: string
  ) {}
}

class UpdateUserCommand implements Command {
  constructor(
    public readonly userId: string,
    public readonly name: string
  ) {}
}

class DeleteUserCommand implements Command {
  constructor(public readonly userId: string) {}
}

describe('InMemoryCommandBus', () => {
  let commandBus: InMemoryCommandBus;

  beforeEach(() => {
    commandBus = new InMemoryCommandBus();
  });

  describe('register', () => {
    it('should register a command handler', () => {
      const handler = vi.fn(async () => 'user-123');

      commandBus.register(CreateUserCommand, handler);

      expect(commandBus.hasHandler(CreateUserCommand)).toBe(true);
    });

    it('should throw error when registering duplicate handler', () => {
      const handler1 = vi.fn(async () => 'user-1');
      const handler2 = vi.fn(async () => 'user-2');

      commandBus.register(CreateUserCommand, handler1);

      expect(() => commandBus.register(CreateUserCommand, handler2)).toThrow(
        'Handler already registered for command: CreateUserCommand'
      );
    });

    it('should register multiple different command types', () => {
      const createHandler = vi.fn();
      const updateHandler = vi.fn();
      const deleteHandler = vi.fn();

      commandBus.register(CreateUserCommand, createHandler);
      commandBus.register(UpdateUserCommand, updateHandler);
      commandBus.register(DeleteUserCommand, deleteHandler);

      expect(commandBus.hasHandler(CreateUserCommand)).toBe(true);
      expect(commandBus.hasHandler(UpdateUserCommand)).toBe(true);
      expect(commandBus.hasHandler(DeleteUserCommand)).toBe(true);
    });
  });

  describe('dispatch', () => {
    it('should dispatch command to registered handler', async () => {
      const handler = vi.fn(async (cmd: CreateUserCommand) => {
        return `user-${cmd.email}`;
      });

      commandBus.register(CreateUserCommand, handler);

      const command = new CreateUserCommand('john@example.com', 'John Doe');
      const result = await commandBus.dispatch<string>(command);

      expect(handler).toHaveBeenCalledWith(command);
      expect(result).toBe('user-john@example.com');
    });

    it('should throw error when no handler registered', async () => {
      const command = new CreateUserCommand('john@example.com', 'John');

      await expect(commandBus.dispatch(command)).rejects.toThrow(
        'No handler registered for command: CreateUserCommand'
      );
    });

    it('should handle void return type', async () => {
      const handler = vi.fn(async () => {
        // No return value
      });

      commandBus.register(DeleteUserCommand, handler);

      const command = new DeleteUserCommand('user-123');
      const result = await commandBus.dispatch(command);

      expect(handler).toHaveBeenCalledWith(command);
      expect(result).toBeUndefined();
    });

    it('should handle async handlers', async () => {
      const handler = vi.fn(async (cmd: CreateUserCommand) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return `user-${cmd.email}`;
      });

      commandBus.register(CreateUserCommand, handler);

      const command = new CreateUserCommand('john@example.com', 'John');
      const result = await commandBus.dispatch<string>(command);

      expect(result).toBe('user-john@example.com');
    });

    it('should propagate handler errors', async () => {
      const handler = vi.fn(async () => {
        throw new Error('Database connection failed');
      });

      commandBus.register(CreateUserCommand, handler);

      const command = new CreateUserCommand('john@example.com', 'John');

      await expect(commandBus.dispatch(command)).rejects.toThrow('Database connection failed');
    });

    it('should handle different result types', async () => {
      const handler = vi.fn(async () => ({
        id: 'user-123',
        email: 'john@example.com',
        createdAt: new Date(),
      }));

      commandBus.register(CreateUserCommand, handler);

      const command = new CreateUserCommand('john@example.com', 'John');
      const result = await commandBus.dispatch<{ id: string; email: string; createdAt: Date }>(
        command
      );

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('john@example.com');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('hasHandler', () => {
    it('should return true when handler is registered', () => {
      commandBus.register(CreateUserCommand, vi.fn());

      expect(commandBus.hasHandler(CreateUserCommand)).toBe(true);
    });

    it('should return false when handler is not registered', () => {
      expect(commandBus.hasHandler(CreateUserCommand)).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should unregister a command handler', () => {
      commandBus.register(CreateUserCommand, vi.fn());

      const result = commandBus.unregister(CreateUserCommand);

      expect(result).toBe(true);
      expect(commandBus.hasHandler(CreateUserCommand)).toBe(false);
    });

    it('should return false when unregistering non-existent handler', () => {
      const result = commandBus.unregister(CreateUserCommand);

      expect(result).toBe(false);
    });

    it('should allow re-registration after unregister', () => {
      const handler1 = vi.fn(async () => 'result1');
      const handler2 = vi.fn(async () => 'result2');

      commandBus.register(CreateUserCommand, handler1);
      commandBus.unregister(CreateUserCommand);
      commandBus.register(CreateUserCommand, handler2);

      expect(commandBus.hasHandler(CreateUserCommand)).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all registered handlers', () => {
      commandBus.register(CreateUserCommand, vi.fn());
      commandBus.register(UpdateUserCommand, vi.fn());
      commandBus.register(DeleteUserCommand, vi.fn());

      commandBus.clear();

      expect(commandBus.hasHandler(CreateUserCommand)).toBe(false);
      expect(commandBus.hasHandler(UpdateUserCommand)).toBe(false);
      expect(commandBus.hasHandler(DeleteUserCommand)).toBe(false);
    });

    it('should work on empty bus', () => {
      expect(() => commandBus.clear()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical CQRS write side', async () => {
      const users = new Map<string, { email: string; name: string }>();

      // Create user handler
      commandBus.register(CreateUserCommand, async (cmd) => {
        const id = `user-${Date.now()}`;
        users.set(id, { email: cmd.email, name: cmd.name });
        return id;
      });

      // Update user handler
      commandBus.register(UpdateUserCommand, async (cmd) => {
        const user = users.get(cmd.userId);
        if (!user) throw new Error('User not found');
        user.name = cmd.name;
      });

      // Delete user handler
      commandBus.register(DeleteUserCommand, async (cmd) => {
        users.delete(cmd.userId);
      });

      // Create user
      const userId = await commandBus.dispatch<string>(
        new CreateUserCommand('john@example.com', 'John')
      );
      expect(users.has(userId)).toBe(true);

      // Update user
      await commandBus.dispatch(new UpdateUserCommand(userId, 'John Doe'));
      expect(users.get(userId)?.name).toBe('John Doe');

      // Delete user
      await commandBus.dispatch(new DeleteUserCommand(userId));
      expect(users.has(userId)).toBe(false);
    });

    it('should handle command validation', async () => {
      commandBus.register(CreateUserCommand, async (cmd) => {
        if (!cmd.email.includes('@')) {
          throw new Error('Invalid email format');
        }
        if (cmd.name.length < 2) {
          throw new Error('Name too short');
        }
        return 'user-123';
      });

      await expect(commandBus.dispatch(new CreateUserCommand('invalid', 'John'))).rejects.toThrow(
        'Invalid email format'
      );

      await expect(
        commandBus.dispatch(new CreateUserCommand('john@example.com', 'J'))
      ).rejects.toThrow('Name too short');

      const result = await commandBus.dispatch<string>(
        new CreateUserCommand('john@example.com', 'John')
      );
      expect(result).toBe('user-123');
    });

    it('should handle sequential commands', async () => {
      const events: string[] = [];

      commandBus.register(CreateUserCommand, async () => {
        events.push('create');
        return 'user-123';
      });

      commandBus.register(UpdateUserCommand, async () => {
        events.push('update');
      });

      await commandBus.dispatch(new CreateUserCommand('john@example.com', 'John'));
      await commandBus.dispatch(new UpdateUserCommand('user-123', 'John Doe'));

      expect(events).toEqual(['create', 'update']);
    });
  });

  describe('edge cases', () => {
    it('should handle commands with no properties', async () => {
      class NoPropsCommand implements Command {}

      const handler = vi.fn(async () => 'result');
      commandBus.register(NoPropsCommand, handler);

      const result = await commandBus.dispatch<string>(new NoPropsCommand());
      expect(result).toBe('result');
    });

    it('should handle commands with complex data', async () => {
      class ComplexCommand implements Command {
        constructor(
          public readonly data: {
            nested: {
              value: number;
            };
            array: string[];
          }
        ) {}
      }

      const handler = vi.fn(async (cmd: ComplexCommand) => cmd.data.nested.value * 2);
      commandBus.register(ComplexCommand, handler);

      const command = new ComplexCommand({
        nested: { value: 21 },
        array: ['a', 'b', 'c'],
      });

      const result = await commandBus.dispatch<number>(command);
      expect(result).toBe(42);
    });

    it('should maintain handler isolation', async () => {
      let counter1 = 0;
      let counter2 = 0;

      commandBus.register(CreateUserCommand, async () => {
        counter1++;
      });

      commandBus.register(UpdateUserCommand, async () => {
        counter2++;
      });

      await commandBus.dispatch(new CreateUserCommand('john@example.com', 'John'));
      await commandBus.dispatch(new CreateUserCommand('jane@example.com', 'Jane'));
      await commandBus.dispatch(new UpdateUserCommand('user-1', 'Updated'));

      expect(counter1).toBe(2);
      expect(counter2).toBe(1);
    });
  });
});
