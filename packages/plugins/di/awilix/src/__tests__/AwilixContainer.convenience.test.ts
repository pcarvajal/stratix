import { describe, it, expect, beforeEach } from 'vitest';
import { AwilixContainer } from '../AwilixContainer.js';
import { ServiceLifetime } from '@stratix/core';

describe('AwilixContainer - Convenience Methods', () => {
    let container: AwilixContainer;

    beforeEach(() => {
        container = new AwilixContainer();
    });

    describe('singleton()', () => {
        it('should register a singleton value', () => {
            const config = { port: 3000 };
            container.singleton('config', config);

            const resolved = container.resolve('config');
            expect(resolved).toBe(config);
        });

        it('should register a singleton factory', () => {
            let callCount = 0;
            container.singleton('service', () => {
                callCount++;
                return { id: callCount };
            });

            const first = container.resolve('service');
            const second = container.resolve('service');

            expect(callCount).toBe(1);
            expect(first).toBe(second);
        });

        it('should return same instance on multiple resolves', () => {
            container.singleton('logger', () => ({ log: () => { } }));

            const logger1 = container.resolve('logger');
            const logger2 = container.resolve('logger');

            expect(logger1).toBe(logger2);
        });
    });

    describe('scoped()', () => {
        it('should register a scoped service', () => {
            let callCount = 0;
            container.scoped('requestContext', () => {
                callCount++;
                return { id: callCount };
            });

            const scope1 = container.createScope();
            const scope2 = container.createScope();

            const ctx1a = scope1.resolve('requestContext');
            const ctx1b = scope1.resolve('requestContext');
            const ctx2 = scope2.resolve('requestContext');

            expect(callCount).toBe(2);
            expect(ctx1a).toBe(ctx1b); // Same within scope
            expect(ctx1a).not.toBe(ctx2); // Different across scopes
        });
    });

    describe('transient()', () => {
        it('should create new instance on each resolve', () => {
            let callCount = 0;
            container.transient('requestId', () => {
                callCount++;
                return `id-${callCount}`;
            });

            const id1 = container.resolve('requestId');
            const id2 = container.resolve('requestId');

            expect(callCount).toBe(2);
            expect(id1).not.toBe(id2);
            expect(id1).toBe('id-1');
            expect(id2).toBe('id-2');
        });
    });

    describe('registerClass()', () => {
        class TestService {
            constructor(public value: string = 'test') { }
        }

        it('should register a class as singleton by default', () => {
            container.registerClass(TestService, { injectionMode: 'CLASSIC' });

            const instance1 = container.resolve(TestService);
            const instance2 = container.resolve(TestService);

            expect(instance1).toBeInstanceOf(TestService);
            expect(instance1).toBe(instance2);
        });

        it('should register with custom token', () => {
            container.registerClass(TestService, {
                token: 'myService',
                injectionMode: 'CLASSIC'
            });

            const instance = container.resolve('myService');
            expect(instance).toBeInstanceOf(TestService);
        });

        it('should register with custom lifetime', () => {
            container.registerClass(TestService, {
                lifetime: ServiceLifetime.TRANSIENT,
                injectionMode: 'CLASSIC'
            });

            const instance1 = container.resolve(TestService);
            const instance2 = container.resolve(TestService);

            expect(instance1).not.toBe(instance2);
        });

        // Auto-wiring requires PROXY mode or explicit naming conventions
        // This test is covered by the main AwilixContainer.test.ts file
        it.skip('should support auto-wiring with dependencies', () => {
            class Dependency {
                value = 'dep';
            }

            class ServiceWithDeps {
                constructor(public dependency: Dependency) { }
            }

            container.registerClass(Dependency, { injectionMode: 'CLASSIC' });
            container.registerClass(ServiceWithDeps, { injectionMode: 'CLASSIC' });

            const service = container.resolve(ServiceWithDeps);
            expect(service.dependency).toBeInstanceOf(Dependency);
            expect(service.dependency.value).toBe('dep');
        });

        it('should support PROXY injection mode', () => {
            container.registerClass(TestService, {
                injectionMode: 'PROXY'
            });

            const instance = container.resolve(TestService);
            expect(instance).toBeInstanceOf(TestService);
        });

        it('should support CLASSIC injection mode', () => {
            container.registerClass(TestService, {
                injectionMode: 'CLASSIC'
            });

            const instance = container.resolve(TestService);
            expect(instance).toBeInstanceOf(TestService);
        });
    });

    describe('registerAll()', () => {
        it('should register multiple values', () => {
            const config = { port: 3000 };
            const logger = { log: () => { } };

            container.registerAll({
                config,
                logger
            });

            expect(container.resolve('config')).toBe(config);
            expect(container.resolve('logger')).toBe(logger);
        });

        it('should register multiple factories', () => {
            container.registerAll({
                service1: () => ({ id: 1 }),
                service2: () => ({ id: 2 })
            });

            const s1 = container.resolve('service1');
            const s2 = container.resolve('service2');

            expect(s1).toEqual({ id: 1 });
            expect(s2).toEqual({ id: 2 });
        });

        it('should register classes', () => {
            class Service1 { }
            class Service2 { }

            container.registerAll({
                Service1,
                Service2
            });

            expect(container.resolve('Service1')).toBeInstanceOf(Service1);
            expect(container.resolve('Service2')).toBeInstanceOf(Service2);
        });

        it('should handle mixed types', () => {
            class MyClass { }

            container.registerAll({
                value: { data: 'test' },
                factory: () => ({ created: true }),
                MyClass
            });

            expect(container.resolve('value')).toEqual({ data: 'test' });
            expect(container.resolve('factory')).toEqual({ created: true });
            expect(container.resolve('MyClass')).toBeInstanceOf(MyClass);
        });
    });

    describe('tryResolve()', () => {
        it('should return value if service exists', () => {
            container.singleton('logger', { log: () => { } });

            const logger = container.tryResolve('logger');
            expect(logger).toBeDefined();
            expect(logger).toHaveProperty('log');
        });

        it('should return undefined if service does not exist', () => {
            const result = container.tryResolve('nonexistent');
            expect(result).toBeUndefined();
        });

        it('should not throw error for missing service', () => {
            expect(() => {
                container.tryResolve('missing');
            }).not.toThrow();
        });
    });

    describe('registerAwilix()', () => {
        it('should allow direct Awilix API usage', async () => {
            const awilix = await import('awilix');

            container.registerAwilix({
                customService: awilix.asValue({ custom: true })
            });

            const service = container.resolve('customService');
            expect(service).toEqual({ custom: true });
        });
    });

    describe('Integration Tests', () => {
        // Complex dependency graphs with auto-wiring are tested in AwilixContainer.test.ts
        it.skip('should work with complex dependency graph', () => {
            class Logger {
                log(msg: string) {
                    return msg;
                }
            }

            class Database {
                constructor(public logger: Logger) { }
            }

            class UserRepository {
                constructor(
                    public database: Database,
                    public logger: Logger
                ) { }
            }

            class UserService {
                constructor(
                    public userRepository: UserRepository,
                    public logger: Logger
                ) { }
            }

            container.registerClass(Logger, { injectionMode: 'CLASSIC' });
            container.registerClass(Database, { injectionMode: 'CLASSIC' });
            container.registerClass(UserRepository, { injectionMode: 'CLASSIC' });
            container.registerClass(UserService, { injectionMode: 'CLASSIC' });

            const userService = container.resolve(UserService);

            expect(userService).toBeInstanceOf(UserService);
            expect(userService.userRepository).toBeInstanceOf(UserRepository);
            expect(userService.userRepository.database).toBeInstanceOf(Database);
            expect(userService.logger).toBeInstanceOf(Logger);

            // All should share same logger instance (singleton)
            expect(userService.logger).toBe(userService.userRepository.logger);
            expect(userService.logger).toBe(userService.userRepository.database.logger);
        });

        it.skip('should support scoped services in dependency graph', () => {
            class RequestContext {
                id = Math.random();
            }

            class RequestService {
                constructor(public requestContext: RequestContext) { }
            }

            container.scoped('requestContext', () => new RequestContext());
            container.registerClass(RequestService, {
                token: 'requestService',
                lifetime: ServiceLifetime.SCOPED
            });

            const scope1 = container.createScope();
            const scope2 = container.createScope();

            const service1 = scope1.resolve('requestService');
            const service2 = scope2.resolve('requestService');

            expect(service1.requestContext.id).not.toBe(service2.requestContext.id);
        });
    });

    describe('Edge Cases', () => {
        it('should handle circular dependencies gracefully', () => {
            // Note: Awilix handles circular deps with PROXY mode
            class ServiceA {
                constructor(public serviceB?: any) { }
            }

            class ServiceB {
                constructor(public serviceA?: ServiceA) { }
            }

            container.registerClass(ServiceA);
            container.registerClass(ServiceB);

            // Should not throw
            expect(() => {
                container.resolve(ServiceA);
            }).not.toThrow();
        });

        it('should throw error when resolving unregistered service', () => {
            expect(() => {
                container.resolve('unregistered');
            }).toThrow();
        });

        it('should handle symbol tokens', () => {
            const TOKEN = Symbol('myService');
            container.singleton(TOKEN, { value: 'test' });

            const service = container.resolve(TOKEN);
            expect(service).toEqual({ value: 'test' });
        });
    });
});
