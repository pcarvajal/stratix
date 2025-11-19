import { describe, it, expect } from 'vitest';
import { EntityId } from '../core/EntityId.js';

describe('EntityId', () => {
  describe('create', () => {
    it('should create a new EntityId with UUID', () => {
      const id = EntityId.create<'User'>();

      expect(id).toBeDefined();
      expect(id.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should create different IDs on each call', () => {
      const id1 = EntityId.create<'User'>();
      const id2 = EntityId.create<'User'>();

      expect(id1.value).not.toBe(id2.value);
    });

    it('should support different entity types', () => {
      const userId = EntityId.create<'User'>();
      const orderId = EntityId.create<'Order'>();

      // Both should be valid UUIDs
      expect(userId.value).toBeDefined();
      expect(orderId.value).toBeDefined();
    });
  });

  describe('from', () => {
    it('should create EntityId from existing string', () => {
      const value = '550e8400-e29b-41d4-a716-446655440000';
      const id = EntityId.from<'User'>(value);

      expect(id.value).toBe(value);
    });

    it('should accept any string value', () => {
      const value = 'custom-id-123';
      const id = EntityId.from<'User'>(value);

      expect(id.value).toBe(value);
    });
  });

  describe('value', () => {
    it('should return the underlying string value', () => {
      const value = 'test-id';
      const id = EntityId.from<'User'>(value);

      expect(id.value).toBe(value);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const value = 'test-id';
      const id = EntityId.from<'User'>(value);

      expect(id.toString()).toBe(value);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const value = 'test-id';
      const id = EntityId.from<'User'>(value);

      expect(id.toJSON()).toBe(value);
    });

    it('should be serializable', () => {
      const id = EntityId.from<'User'>('test-id');
      const json = JSON.stringify({ id });

      expect(json).toBe('{"id":"test-id"}');
    });
  });

  describe('equals', () => {
    it('should return true for EntityIds with same value', () => {
      const id1 = EntityId.from<'User'>('test-id');
      const id2 = EntityId.from<'User'>('test-id');

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for EntityIds with different values', () => {
      const id1 = EntityId.from<'User'>('test-id-1');
      const id2 = EntityId.from<'User'>('test-id-2');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should work with created IDs', () => {
      const id = EntityId.create<'User'>();
      const sameId = EntityId.from<'User'>(id.value);

      expect(id.equals(sameId)).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should prevent mixing entity types at compile time', () => {
      type UserId = EntityId<'User'>;
      type OrderId = EntityId<'Order'>;

      const userId: UserId = EntityId.create<'User'>();
      const orderId: OrderId = EntityId.create<'Order'>();

      // This should compile - same types
      const _sameType: UserId = userId;

      // Runtime equality should work regardless of phantom type
      // (phantom types only exist at compile time)
      expect(userId.equals(orderId as unknown as EntityId<'User'>)).toBe(false);
    });
  });
});
