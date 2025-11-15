import { describe, it, expect } from 'vitest';
import { DomainError } from '../errors/DomainError.js';

describe('DomainError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new DomainError('TEST_CODE', 'Test message');

      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('DomainError');
    });

    it('should be instanceof Error', () => {
      const error = new DomainError('CODE', 'message');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof DomainError', () => {
      const error = new DomainError('CODE', 'message');

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('code', () => {
    it('should be accessible', () => {
      const error = new DomainError('CODE', 'message');

      expect(error.code).toBe('CODE');
      // TypeScript readonly is compile-time only
      // At runtime, the property is still accessible
    });
  });

  describe('message', () => {
    it('should be readable', () => {
      const error = new DomainError('CODE', 'Test message');

      expect(error.message).toBe('Test message');
    });
  });

  describe('name', () => {
    it('should be DomainError', () => {
      const error = new DomainError('CODE', 'message');

      expect(error.name).toBe('DomainError');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const error = new DomainError('TEST_CODE', 'Test message');
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'DomainError',
        code: 'TEST_CODE',
        message: 'Test message',
      });
    });

    it('should be serializable', () => {
      const error = new DomainError('TEST_CODE', 'Test message');
      const json = JSON.stringify(error);

      expect(json).toBe('{"name":"DomainError","code":"TEST_CODE","message":"Test message"}');
    });
  });

  describe('throw and catch', () => {
    it('should be throwable', () => {
      const throwError = () => {
        throw new DomainError('CODE', 'message');
      };

      expect(throwError).toThrow(DomainError);
      expect(throwError).toThrow('message');
    });

    it('should be catchable as Error', () => {
      try {
        throw new DomainError('CODE', 'message');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(DomainError);
      }
    });

    it('should preserve code in catch', () => {
      try {
        throw new DomainError('SPECIFIC_CODE', 'message');
      } catch (error) {
        if (error instanceof DomainError) {
          expect(error.code).toBe('SPECIFIC_CODE');
        }
      }
    });
  });

  describe('error patterns', () => {
    it('should support validation errors', () => {
      const error = new DomainError('INVALID_EMAIL', 'Email format is invalid');

      expect(error.code).toBe('INVALID_EMAIL');
      expect(error.message).toBe('Email format is invalid');
    });

    it('should support business rule violations', () => {
      const error = new DomainError(
        'INSUFFICIENT_FUNDS',
        'Account balance is insufficient for this transaction'
      );

      expect(error.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('should support not found errors', () => {
      const error = new DomainError('USER_NOT_FOUND', 'User with id 123 not found');

      expect(error.code).toBe('USER_NOT_FOUND');
    });

    it('should support conflict errors', () => {
      const error = new DomainError('EMAIL_ALREADY_EXISTS', 'Email is already registered');

      expect(error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });
});
