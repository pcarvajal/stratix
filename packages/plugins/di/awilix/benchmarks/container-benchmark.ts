import { AwilixContainer } from '../src/AwilixContainer.js';
import { ServiceLifetime } from '@stratix/core';

/**
 * Simple benchmark for DI container operations
 */

class TestService {
    constructor(
        private dep1?: any,
        private dep2?: any,
        private dep3?: any
    ) { }
}

function benchmark(name: string, fn: () => void, iterations: number = 10000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const duration = end - start;
    const opsPerSec = (iterations / duration) * 1000;

    console.log(`${name}:`);
    console.log(`  Total: ${duration.toFixed(2)}ms`);
    console.log(`  Avg: ${(duration / iterations).toFixed(4)}ms`);
    console.log(`  Ops/sec: ${opsPerSec.toFixed(0)}`);
    console.log();
}

console.log('=== DI Container Benchmarks ===\n');

// Benchmark 1: Singleton registration (old API)
{
    const container = new AwilixContainer();
    benchmark('Singleton registration (old API)', () => {
        container.register('test', () => new TestService(), {
            lifetime: ServiceLifetime.SINGLETON
        });
    }, 1000);
}

// Benchmark 2: Singleton registration (new API)
{
    const container = new AwilixContainer();
    benchmark('Singleton registration (new API)', () => {
        container.singleton('test', () => new TestService());
    }, 1000);
}

// Benchmark 3: Class registration
{
    const container = new AwilixContainer();
    benchmark('Class registration', () => {
        container.registerClass(TestService);
    }, 1000);
}

// Benchmark 4: Batch registration
{
    const container = new AwilixContainer();
    benchmark('Batch registration (10 services)', () => {
        container.registerAll({
            s1: new TestService(),
            s2: new TestService(),
            s3: new TestService(),
            s4: new TestService(),
            s5: new TestService(),
            s6: new TestService(),
            s7: new TestService(),
            s8: new TestService(),
            s9: new TestService(),
            s10: new TestService()
        });
    }, 100);
}

// Benchmark 5: Resolution
{
    const container = new AwilixContainer();
    container.singleton('test', () => new TestService());

    benchmark('Singleton resolution', () => {
        container.resolve('test');
    });
}

// Benchmark 6: Scoped resolution
{
    const container = new AwilixContainer();
    container.scoped('test', () => new TestService());
    const scope = container.createScope();

    benchmark('Scoped resolution', () => {
        scope.resolve('test');
    });
}

// Benchmark 7: Transient resolution
{
    const container = new AwilixContainer();
    container.transient('test', () => new TestService());

    benchmark('Transient resolution', () => {
        container.resolve('test');
    });
}

// Benchmark 8: tryResolve
{
    const container = new AwilixContainer();
    container.singleton('test', () => new TestService());

    benchmark('tryResolve (found)', () => {
        container.tryResolve('test');
    });
}

// Benchmark 9: tryResolve (not found)
{
    const container = new AwilixContainer();

    benchmark('tryResolve (not found)', () => {
        container.tryResolve('nonexistent');
    });
}

console.log('=== Benchmark Complete ===');
