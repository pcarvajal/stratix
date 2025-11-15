import { describe, it, expect, beforeEach } from 'vitest';
import { AggregateRoot } from '../core/AggregateRoot.js';
import { EntityId } from '../core/EntityId.js';
import { DomainEvent } from '../core/DomainEvent.js';

interface TestEvent extends DomainEvent {
  testId: string;
  action: string;
}

class TestAggregate extends AggregateRoot<'Test'> {
  constructor(
    id: EntityId<'Test'>,
    private _value: string
  ) {
    super(id, new Date(), new Date());
  }

  get value(): string {
    return this._value;
  }

  doSomething(action: string): void {
    this._value = `${this._value}-${action}`;
    this.record({
      occurredAt: new Date(),
      testId: this.id.value,
      action,
    });
    this.touch();
  }

  doMultipleThings(): void {
    this.record({
      occurredAt: new Date(),
      testId: this.id.value,
      action: 'first',
    });
    this.record({
      occurredAt: new Date(),
      testId: this.id.value,
      action: 'second',
    });
    this.touch();
  }
}

describe('AggregateRoot', () => {
  let id: EntityId<'Test'>;
  let aggregate: TestAggregate;

  beforeEach(() => {
    id = EntityId.create<'Test'>();
    aggregate = new TestAggregate(id, 'initial');
  });

  describe('record', () => {
    it('should record domain events', () => {
      aggregate.doSomething('test');

      expect(aggregate.hasDomainEvents()).toBe(true);
    });

    it('should record multiple domain events', () => {
      aggregate.doMultipleThings();

      const events = aggregate.pullDomainEvents();
      expect(events).toHaveLength(2);
    });
  });

  describe('hasDomainEvents', () => {
    it('should return false when no events are recorded', () => {
      expect(aggregate.hasDomainEvents()).toBe(false);
    });

    it('should return true when events are recorded', () => {
      aggregate.doSomething('test');

      expect(aggregate.hasDomainEvents()).toBe(true);
    });

    it('should return false after events are pulled', () => {
      aggregate.doSomething('test');
      aggregate.pullDomainEvents();

      expect(aggregate.hasDomainEvents()).toBe(false);
    });
  });

  describe('pullDomainEvents', () => {
    it('should return empty array when no events recorded', () => {
      const events = aggregate.pullDomainEvents();

      expect(events).toEqual([]);
    });

    it('should return all recorded events', () => {
      aggregate.doSomething('action1');
      aggregate.doSomething('action2');

      const events = aggregate.pullDomainEvents();

      expect(events).toHaveLength(2);
      expect(events[0]).toMatchObject({
        testId: id.value,
        action: 'action1',
      });
      expect(events[1]).toMatchObject({
        testId: id.value,
        action: 'action2',
      });
    });

    it('should clear events after pulling', () => {
      aggregate.doSomething('test');
      const events1 = aggregate.pullDomainEvents();
      const events2 = aggregate.pullDomainEvents();

      expect(events1).toHaveLength(1);
      expect(events2).toHaveLength(0);
    });

    it('should return a copy of events array', () => {
      aggregate.doSomething('test');
      const events = aggregate.pullDomainEvents();

      // Modify the returned array
      events.push({
        occurredAt: new Date(),
        testId: 'fake',
        action: 'fake',
      });

      // Should not affect internal state
      expect(aggregate.hasDomainEvents()).toBe(false);
    });

    it('should preserve event order', () => {
      const actions = ['first', 'second', 'third', 'fourth'];

      actions.forEach((action) => {
        aggregate.doSomething(action);
      });

      const events = aggregate.pullDomainEvents() as TestEvent[];

      expect(events.map((e) => e.action)).toEqual(actions);
    });
  });

  describe('integration with Entity', () => {
    it('should inherit Entity functionality', () => {
      const aggregate1 = new TestAggregate(id, 'test1');
      const aggregate2 = new TestAggregate(id, 'test2');

      expect(aggregate1.equals(aggregate2)).toBe(true);
    });

    it('should have id, createdAt, and updatedAt', () => {
      expect(aggregate.id.equals(id)).toBe(true);
      expect(aggregate.createdAt).toBeInstanceOf(Date);
      expect(aggregate.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when touch is called', () => {
      const originalUpdatedAt = aggregate.updatedAt;

      // Small delay to ensure different timestamp
      setTimeout(() => {
        aggregate.doSomething('test');
        expect(aggregate.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('event lifecycle', () => {
    it('should support typical aggregate lifecycle', () => {
      // 1. Perform action, record event
      aggregate.doSomething('create');
      expect(aggregate.hasDomainEvents()).toBe(true);

      // 2. Pull events for publishing
      const events = aggregate.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(aggregate.hasDomainEvents()).toBe(false);

      // 3. Perform another action
      aggregate.doSomething('update');
      expect(aggregate.hasDomainEvents()).toBe(true);

      // 4. Pull new events
      const newEvents = aggregate.pullDomainEvents();
      expect(newEvents).toHaveLength(1);
    });
  });
});
