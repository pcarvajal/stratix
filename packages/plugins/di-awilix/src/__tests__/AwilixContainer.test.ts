import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceLifetime } from '@stratix/core';
import { AwilixContainer } from '../AwilixContainer.js';

describe('AwilixContainer', () => {
  let container: AwilixContainer;

  beforeEach(() => {
    container = new AwilixContainer();
  });

  describe('registration', () => {
    it('should register and resolve a service with string token', () => {
      container.register('test', () => ({ value: 'hello' }));

      const service = container.resolve<{ value: string }>('test');
      expect(service.value).toBe('hello');
    });

    it('should register and resolve a service with symbol token', () => {
      const token = Symbol('test');
      container.register(token, () => ({ value: 'hello' }));

      const service = container.resolve<{ value: string }>(token);
      expect(service.value).toBe('hello');
    });

    it('should register and resolve a service with class token', () => {
      class TestService {
        getValue() {
          return 'hello';
        }
      }

      container.register(TestService, () => new TestService());

      const service = container.resolve<TestService>(TestService);
      expect(service.getValue()).toBe('hello');
    });

    it('should provide container to factory function', () => {
      container.register('config', () => ({ port: 3000 }));
      container.register('server', (c) => {
        const config = c.resolve<{ port: number }>('config');
        return { port: config.port };
      });

      const server = container.resolve<{ port: number }>('server');
      expect(server.port).toBe(3000);
    });
  });

  describe('lifetimes', () => {
    it('should use singleton lifetime by default', () => {
      let counter = 0;
      container.register('counter', () => ({ id: ++counter }));

      const first = container.resolve<{ id: number }>('counter');
      const second = container.resolve<{ id: number }>('counter');

      expect(first.id).toBe(1);
      expect(second.id).toBe(1);
      expect(first).toBe(second);
    });

    it('should respect singleton lifetime option', () => {
      let counter = 0;
      container.register('counter', () => ({ id: ++counter }), {
        lifetime: ServiceLifetime.SINGLETON,
      });

      const first = container.resolve<{ id: number }>('counter');
      const second = container.resolve<{ id: number }>('counter');

      expect(first.id).toBe(1);
      expect(second.id).toBe(1);
      expect(first).toBe(second);
    });

    it('should create new instance for transient lifetime', () => {
      let counter = 0;
      container.register('counter', () => ({ id: ++counter }), {
        lifetime: ServiceLifetime.TRANSIENT,
      });

      const first = container.resolve<{ id: number }>('counter');
      const second = container.resolve<{ id: number }>('counter');

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
      expect(first).not.toBe(second);
    });

    it('should use scoped lifetime correctly', () => {
      let counter = 0;
      container.register('counter', () => ({ id: ++counter }), {
        lifetime: ServiceLifetime.SCOPED,
      });

      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const scope1First = scope1.resolve<{ id: number }>('counter');
      const scope1Second = scope1.resolve<{ id: number }>('counter');
      const scope2First = scope2.resolve<{ id: number }>('counter');

      expect(scope1First.id).toBe(1);
      expect(scope1Second.id).toBe(1);
      expect(scope2First.id).toBe(2);
      expect(scope1First).toBe(scope1Second);
      expect(scope1First).not.toBe(scope2First);
    });
  });

  describe('has', () => {
    it('should return true for registered services', () => {
      container.register('test', () => ({}));

      expect(container.has('test')).toBe(true);
    });

    it('should return false for unregistered services', () => {
      expect(container.has('nonexistent')).toBe(false);
    });

    it('should work with symbol tokens', () => {
      const token = Symbol('test');
      container.register(token, () => ({}));

      expect(container.has(token)).toBe(true);
    });

    it('should work with class tokens', () => {
      class TestService {}
      container.register(TestService, () => new TestService());

      expect(container.has(TestService)).toBe(true);
    });
  });

  describe('resolve', () => {
    it('should throw error when resolving unregistered service', () => {
      expect(() => container.resolve('nonexistent')).toThrow(
        "Service 'nonexistent' is not registered"
      );
    });

    it('should resolve dependencies correctly', () => {
      container.register('database', () => ({ query: () => 'result' }));
      container.register('repository', (c) => {
        const db = c.resolve<{ query: () => string }>('database');
        return { getData: () => db.query() };
      });

      const repo = container.resolve<{ getData: () => string }>('repository');
      expect(repo.getData()).toBe('result');
    });

    it('should resolve deep dependency chains', () => {
      container.register('config', () => ({ value: 'test' }));
      container.register('database', (c) => ({
        config: c.resolve<{ value: string }>('config'),
      }));
      container.register('repository', (c) => ({
        db: c.resolve<{ config: { value: string } }>('database'),
      }));
      container.register('service', (c) => ({
        repo: c.resolve<{ db: { config: { value: string } } }>('repository'),
      }));

      const service = container.resolve<{
        repo: { db: { config: { value: string } } };
      }>('service');

      expect(service.repo.db.config.value).toBe('test');
    });
  });

  describe('createScope', () => {
    it('should create a new scoped container', () => {
      const scope = container.createScope();

      expect(scope).toBeInstanceOf(AwilixContainer);
      expect(scope).not.toBe(container);
    });

    it('should inherit parent registrations', () => {
      container.register('test', () => ({ value: 'hello' }));

      const scope = container.createScope();
      const service = scope.resolve<{ value: string }>('test');

      expect(service.value).toBe('hello');
    });

    it('should isolate scoped services', () => {
      let counter = 0;
      container.register('counter', () => ({ id: ++counter }), {
        lifetime: ServiceLifetime.SCOPED,
      });

      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const service1 = scope1.resolve<{ id: number }>('counter');
      const service2 = scope2.resolve<{ id: number }>('counter');

      expect(service1.id).toBe(1);
      expect(service2.id).toBe(2);
    });

    it('should share singleton services across scopes', () => {
      let counter = 0;
      container.register('counter', () => ({ id: ++counter }), {
        lifetime: ServiceLifetime.SINGLETON,
      });

      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const service1 = scope1.resolve<{ id: number }>('counter');
      const service2 = scope2.resolve<{ id: number }>('counter');

      expect(service1.id).toBe(1);
      expect(service2.id).toBe(1);
      expect(service1).toBe(service2);
    });

    it('should allow nested scopes', () => {
      let counter = 0;
      container.register('counter', () => ({ id: ++counter }), {
        lifetime: ServiceLifetime.SCOPED,
      });

      const scope1 = container.createScope();
      const scope2 = scope1.createScope();

      const service1 = scope1.resolve<{ id: number }>('counter');
      const service2 = scope2.resolve<{ id: number }>('counter');

      expect(service1.id).toBe(1);
      expect(service2.id).toBe(2);
    });
  });

  describe('dispose', () => {
    it('should dispose the container without errors', async () => {
      container.register('test', () => ({ value: 'hello' }));

      await expect(container.dispose()).resolves.not.toThrow();
    });

    it('should dispose scoped containers', async () => {
      const scope = container.createScope();
      scope.register('test', () => ({ value: 'hello' }));

      await expect(scope.dispose()).resolves.not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical application setup', () => {
      // Config
      container.register('config', () => ({
        database: { host: 'localhost', port: 5432 },
        server: { port: 3000 },
      }));

      // Database
      container.register('database', (c) => {
        const config = c.resolve<{ database: { host: string; port: number } }>('config');
        return {
          connect: () => `Connected to ${config.database.host}:${config.database.port}`,
        };
      });

      // Repository
      container.register('userRepository', (c) => {
        const db = c.resolve<{ connect: () => string }>('database');
        return {
          findAll: () => `Query using ${db.connect()}`,
        };
      });

      // Service
      container.register('userService', (c) => {
        const repo = c.resolve<{ findAll: () => string }>('userRepository');
        return {
          getUsers: () => repo.findAll(),
        };
      });

      const service = container.resolve<{ getUsers: () => string }>('userService');
      expect(service.getUsers()).toContain('localhost:5432');
    });

    it('should handle request-scoped services', () => {
      // Singleton logger
      let logId = 0;
      container.register('logger', () => ({ id: ++logId }), {
        lifetime: ServiceLifetime.SINGLETON,
      });

      // Scoped request context
      let requestId = 0;
      container.register('requestContext', () => ({ id: ++requestId }), {
        lifetime: ServiceLifetime.SCOPED,
      });

      // Request 1
      const request1 = container.createScope();
      const logger1 = request1.resolve<{ id: number }>('logger');
      const context1 = request1.resolve<{ id: number }>('requestContext');

      // Request 2
      const request2 = container.createScope();
      const logger2 = request2.resolve<{ id: number }>('logger');
      const context2 = request2.resolve<{ id: number }>('requestContext');

      // Logger should be shared (singleton)
      expect(logger1.id).toBe(1);
      expect(logger2.id).toBe(1);
      expect(logger1).toBe(logger2);

      // Context should be different (scoped)
      expect(context1.id).toBe(1);
      expect(context2.id).toBe(2);
      expect(context1).not.toBe(context2);
    });

    it('should handle factory pattern', () => {
      interface Connection {
        id: string;
        close: () => void;
      }

      let connectionCount = 0;
      container.register(
        'connectionFactory',
        () => {
          return () => {
            const id = `conn-${++connectionCount}`;
            return {
              id,
              close: () => {},
            };
          };
        },
        { lifetime: ServiceLifetime.SINGLETON }
      );

      const factory = container.resolve<() => Connection>('connectionFactory');

      const conn1 = factory();
      const conn2 = factory();

      expect(conn1.id).toBe('conn-1');
      expect(conn2.id).toBe('conn-2');
    });
  });

  describe('edge cases', () => {
    it('should handle registering same token multiple times', () => {
      container.register('test', () => ({ value: 1 }));
      container.register('test', () => ({ value: 2 }));

      const service = container.resolve<{ value: number }>('test');
      expect(service.value).toBe(2);
    });

    it('should handle empty factory results', () => {
      container.register('empty', () => null);

      const service = container.resolve('empty');
      expect(service).toBe(null);
    });

    it('should handle complex types', () => {
      container.register('complex', () => ({
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'hello',
          },
        },
        fn: () => 'result',
      }));

      const service = container.resolve<{
        array: number[];
        nested: { deep: { value: string } };
        fn: () => string;
      }>('complex');

      expect(service.array).toEqual([1, 2, 3]);
      expect(service.nested.deep.value).toBe('hello');
      expect(service.fn()).toBe('result');
    });

    it('should handle symbols with same description', () => {
      const token1 = Symbol('test');
      const token2 = Symbol('test');

      container.register(token1, () => ({ value: 1 }));
      container.register(token2, () => ({ value: 2 }));

      const service1 = container.resolve<{ value: number }>(token1);
      const service2 = container.resolve<{ value: number }>(token2);

      expect(service1.value).toBe(1);
      expect(service2.value).toBe(2);
    });

    it('should handle anonymous classes', () => {
      const AnonymousClass = class {
        getValue() {
          return 'test';
        }
      };

      container.register(AnonymousClass, () => new AnonymousClass());

      const service = container.resolve<{ getValue: () => string }>(AnonymousClass);
      expect(service.getValue()).toBe('test');
    });
  });
});
