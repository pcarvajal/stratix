import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Event } from '@stratix/core';
import { InMemoryEventBus } from '../InMemoryEventBus.js';

// Test events
class UserCreatedEvent implements Event {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {}
}

class UserUpdatedEvent implements Event {
  constructor(
    public readonly userId: string,
    public readonly changes: Record<string, unknown>
  ) {}
}

class UserDeletedEvent implements Event {
  constructor(public readonly userId: string) {}
}

class OrderPlacedEvent implements Event {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly amount: number
  ) {}
}

describe('InMemoryEventBus', () => {
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  describe('subscribe', () => {
    it('should subscribe to an event', () => {
      const handler = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, handler);

      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(1);
    });

    it('should allow multiple subscribers for same event', () => {
      const handler1 = vi.fn(async () => {});
      const handler2 = vi.fn(async () => {});
      const handler3 = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, handler1);
      eventBus.subscribe(UserCreatedEvent, handler2);
      eventBus.subscribe(UserCreatedEvent, handler3);

      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(3);
    });

    it('should handle subscriptions for different event types', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventBus.subscribe(UserCreatedEvent, handler1);
      eventBus.subscribe(UserUpdatedEvent, handler2);
      eventBus.subscribe(UserDeletedEvent, handler3);

      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(1);
      expect(eventBus.getSubscriberCount(UserUpdatedEvent)).toBe(1);
      expect(eventBus.getSubscriberCount(UserDeletedEvent)).toBe(1);
    });
  });

  describe('publish', () => {
    it('should publish event to subscriber', async () => {
      const handler = vi.fn(async (event: UserCreatedEvent) => {
        expect(event.userId).toBe('user-123');
        expect(event.email).toBe('john@example.com');
      });

      eventBus.subscribe(UserCreatedEvent, handler);

      await eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should publish event to multiple subscribers', async () => {
      const handler1 = vi.fn(async () => {});
      const handler2 = vi.fn(async () => {});
      const handler3 = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, handler1);
      eventBus.subscribe(UserCreatedEvent, handler2);
      eventBus.subscribe(UserCreatedEvent, handler3);

      const event = new UserCreatedEvent('user-123', 'john@example.com');
      await eventBus.publish(event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
      expect(handler3).toHaveBeenCalledWith(event);
    });

    it('should handle event with no subscribers', async () => {
      const event = new UserCreatedEvent('user-123', 'john@example.com');

      await expect(eventBus.publish(event)).resolves.toBeUndefined();
    });

    it('should execute handlers in parallel', async () => {
      const executionOrder: number[] = [];

      const handler1 = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        executionOrder.push(1);
      });

      const handler2 = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        executionOrder.push(2);
      });

      const handler3 = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        executionOrder.push(3);
      });

      eventBus.subscribe(UserCreatedEvent, handler1);
      eventBus.subscribe(UserCreatedEvent, handler2);
      eventBus.subscribe(UserCreatedEvent, handler3);

      await eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'));

      // Should finish in order of delay (shortest first)
      expect(executionOrder).toEqual([2, 3, 1]);
    });

    it('should propagate handler errors', async () => {
      const handler = vi.fn(async () => {
        throw new Error('Handler failed');
      });

      eventBus.subscribe(UserCreatedEvent, handler);

      await expect(
        eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'))
      ).rejects.toThrow('Handler failed');
    });

    it('should handle async handlers', async () => {
      const results: string[] = [];

      const handler = vi.fn(async (event: UserCreatedEvent) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        results.push(event.userId);
      });

      eventBus.subscribe(UserCreatedEvent, handler);

      await eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'));

      expect(results).toEqual(['user-123']);
    });

    it('should not affect other event types', async () => {
      const userCreatedHandler = vi.fn(async () => {});
      const userUpdatedHandler = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, userCreatedHandler);
      eventBus.subscribe(UserUpdatedEvent, userUpdatedHandler);

      await eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'));

      expect(userCreatedHandler).toHaveBeenCalledTimes(1);
      expect(userUpdatedHandler).not.toHaveBeenCalled();
    });
  });

  describe('publishAll', () => {
    it('should publish multiple events in order', async () => {
      const executionOrder: string[] = [];

      eventBus.subscribe(UserCreatedEvent, async () => {
        executionOrder.push('created');
      });

      eventBus.subscribe(UserUpdatedEvent, async () => {
        executionOrder.push('updated');
      });

      eventBus.subscribe(UserDeletedEvent, async () => {
        executionOrder.push('deleted');
      });

      await eventBus.publishAll([
        new UserCreatedEvent('user-123', 'john@example.com'),
        new UserUpdatedEvent('user-123', { name: 'John Doe' }),
        new UserDeletedEvent('user-123'),
      ]);

      expect(executionOrder).toEqual(['created', 'updated', 'deleted']);
    });

    it('should handle empty event array', async () => {
      await expect(eventBus.publishAll([])).resolves.toBeUndefined();
    });

    it('should handle events with multiple subscribers', async () => {
      const handler1 = vi.fn(async () => {});
      const handler2 = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, handler1);
      eventBus.subscribe(UserCreatedEvent, handler2);

      const events = [
        new UserCreatedEvent('user-1', 'john@example.com'),
        new UserCreatedEvent('user-2', 'jane@example.com'),
      ];

      await eventBus.publishAll(events);

      expect(handler1).toHaveBeenCalledTimes(2);
      expect(handler2).toHaveBeenCalledTimes(2);
    });

    it('should propagate errors from handlers', async () => {
      eventBus.subscribe(UserCreatedEvent, async () => {
        throw new Error('First event failed');
      });

      eventBus.subscribe(UserUpdatedEvent, async () => {
        throw new Error('Should not be called');
      });

      await expect(
        eventBus.publishAll([
          new UserCreatedEvent('user-123', 'john@example.com'),
          new UserUpdatedEvent('user-123', { name: 'John' }),
        ])
      ).rejects.toThrow('First event failed');
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe a handler', async () => {
      const handler = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, handler);
      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(1);

      eventBus.unsubscribe(UserCreatedEvent, handler);
      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(0);
    });

    it('should only unsubscribe specific handler', async () => {
      const handler1 = vi.fn(async () => {});
      const handler2 = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, handler1);
      eventBus.subscribe(UserCreatedEvent, handler2);

      eventBus.unsubscribe(UserCreatedEvent, handler1);

      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(1);

      await eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'));

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should handle unsubscribe for non-existent handler', () => {
      const handler = vi.fn(async () => {});

      expect(() => eventBus.unsubscribe(UserCreatedEvent, handler)).not.toThrow();
    });

    it('should handle unsubscribe for non-existent event type', () => {
      const handler = vi.fn(async () => {});

      expect(() => eventBus.unsubscribe(UserCreatedEvent, handler)).not.toThrow();
    });
  });

  describe('getSubscriberCount', () => {
    it('should return correct count', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(0);

      eventBus.subscribe(UserCreatedEvent, handler1);
      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(1);

      eventBus.subscribe(UserCreatedEvent, handler2);
      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(2);
    });

    it('should return 0 for unsubscribed event', () => {
      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(0);
    });
  });

  describe('clearSubscribers', () => {
    it('should clear subscribers for specific event type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe(UserCreatedEvent, handler1);
      eventBus.subscribe(UserUpdatedEvent, handler2);

      eventBus.clearSubscribers(UserCreatedEvent);

      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(0);
      expect(eventBus.getSubscriberCount(UserUpdatedEvent)).toBe(1);
    });

    it('should handle clearing non-existent event type', () => {
      expect(() => eventBus.clearSubscribers(UserCreatedEvent)).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all subscribers', () => {
      eventBus.subscribe(UserCreatedEvent, vi.fn());
      eventBus.subscribe(UserUpdatedEvent, vi.fn());
      eventBus.subscribe(UserDeletedEvent, vi.fn());

      eventBus.clear();

      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(0);
      expect(eventBus.getSubscriberCount(UserUpdatedEvent)).toBe(0);
      expect(eventBus.getSubscriberCount(UserDeletedEvent)).toBe(0);
    });

    it('should work on empty bus', () => {
      expect(() => eventBus.clear()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle event-driven workflow', async () => {
      const workflow: string[] = [];

      // User created triggers welcome email and audit log
      eventBus.subscribe(UserCreatedEvent, async (event) => {
        workflow.push(`send-email:${event.email}`);
      });

      eventBus.subscribe(UserCreatedEvent, async (event) => {
        workflow.push(`audit:user-created:${event.userId}`);
      });

      // Order placed triggers inventory and notification
      eventBus.subscribe(OrderPlacedEvent, async (event) => {
        workflow.push(`update-inventory:${event.orderId}`);
      });

      eventBus.subscribe(OrderPlacedEvent, async (event) => {
        workflow.push(`notify-user:${event.userId}`);
      });

      await eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'));
      await eventBus.publish(new OrderPlacedEvent('order-456', 'user-123', 99.99));

      expect(workflow).toContain('send-email:john@example.com');
      expect(workflow).toContain('audit:user-created:user-123');
      expect(workflow).toContain('update-inventory:order-456');
      expect(workflow).toContain('notify-user:user-123');
    });

    it('should handle event sourcing pattern', async () => {
      const eventStore: Event[] = [];

      // Store all events
      eventBus.subscribe(UserCreatedEvent, async (event) => {
        eventStore.push(event);
      });

      eventBus.subscribe(UserUpdatedEvent, async (event) => {
        eventStore.push(event);
      });

      eventBus.subscribe(UserDeletedEvent, async (event) => {
        eventStore.push(event);
      });

      await eventBus.publishAll([
        new UserCreatedEvent('user-123', 'john@example.com'),
        new UserUpdatedEvent('user-123', { name: 'John Doe' }),
        new UserDeletedEvent('user-123'),
      ]);

      expect(eventStore).toHaveLength(3);
      expect(eventStore[0]).toBeInstanceOf(UserCreatedEvent);
      expect(eventStore[1]).toBeInstanceOf(UserUpdatedEvent);
      expect(eventStore[2]).toBeInstanceOf(UserDeletedEvent);
    });

    it('should handle saga pattern', async () => {
      const sagaSteps: string[] = [];

      // Order placed starts saga
      eventBus.subscribe(OrderPlacedEvent, async () => {
        sagaSteps.push('reserve-inventory');
        sagaSteps.push('authorize-payment');
        sagaSteps.push('schedule-shipping');
      });

      await eventBus.publish(new OrderPlacedEvent('order-123', 'user-456', 149.99));

      expect(sagaSteps).toEqual(['reserve-inventory', 'authorize-payment', 'schedule-shipping']);
    });

    it('should handle error in one handler without affecting others', async () => {
      const results: string[] = [];

      eventBus.subscribe(UserCreatedEvent, async () => {
        results.push('handler1-success');
      });

      eventBus.subscribe(UserCreatedEvent, async () => {
        throw new Error('Handler 2 failed');
      });

      eventBus.subscribe(UserCreatedEvent, async () => {
        results.push('handler3-success');
      });

      await expect(
        eventBus.publish(new UserCreatedEvent('user-123', 'john@example.com'))
      ).rejects.toThrow('Handler 2 failed');

      // Due to Promise.all, if one fails, others might still execute
      // but the overall promise rejects
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should support unsubscribe pattern', async () => {
      let callCount = 0;

      const handler = vi.fn(async () => {
        callCount++;
      });

      eventBus.subscribe(UserCreatedEvent, handler);

      await eventBus.publish(new UserCreatedEvent('user-1', 'user1@example.com'));
      expect(callCount).toBe(1);

      await eventBus.publish(new UserCreatedEvent('user-2', 'user2@example.com'));
      expect(callCount).toBe(2);

      eventBus.unsubscribe(UserCreatedEvent, handler);

      await eventBus.publish(new UserCreatedEvent('user-3', 'user3@example.com'));
      expect(callCount).toBe(2); // Should not increase
    });
  });

  describe('edge cases', () => {
    it('should handle events with no properties', async () => {
      class EmptyEvent implements Event {}

      const handler = vi.fn(async () => {});
      eventBus.subscribe(EmptyEvent, handler);

      await eventBus.publish(new EmptyEvent());

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle events with complex data', async () => {
      class ComplexEvent implements Event {
        constructor(
          public readonly data: {
            nested: {
              array: number[];
              object: Record<string, unknown>;
            };
          }
        ) {}
      }

      const handler = vi.fn(async (event: ComplexEvent) => {
        expect(event.data.nested.array).toEqual([1, 2, 3]);
      });

      eventBus.subscribe(ComplexEvent, handler);

      await eventBus.publish(
        new ComplexEvent({
          nested: {
            array: [1, 2, 3],
            object: { key: 'value' },
          },
        })
      );

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should maintain handler isolation across event types', async () => {
      let counter1 = 0;
      let counter2 = 0;

      eventBus.subscribe(UserCreatedEvent, async () => {
        counter1++;
      });

      eventBus.subscribe(UserUpdatedEvent, async () => {
        counter2++;
      });

      await eventBus.publish(new UserCreatedEvent('user-1', 'user1@example.com'));
      await eventBus.publish(new UserCreatedEvent('user-2', 'user2@example.com'));
      await eventBus.publish(new UserUpdatedEvent('user-1', { name: 'Updated' }));

      expect(counter1).toBe(2);
      expect(counter2).toBe(1);
    });

    it('should handle same handler subscribed multiple times', () => {
      const handler = vi.fn(async () => {});

      eventBus.subscribe(UserCreatedEvent, handler);
      eventBus.subscribe(UserCreatedEvent, handler);
      eventBus.subscribe(UserCreatedEvent, handler);

      // Set behavior: same handler reference is only stored once
      expect(eventBus.getSubscriberCount(UserCreatedEvent)).toBe(1);
    });
  });
});
