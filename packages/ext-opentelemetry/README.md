# @stratix/ext-opentelemetry

OpenTelemetry extension for Stratix framework providing distributed tracing and metrics.

## Installation

```bash
pnpm add @stratix/ext-opentelemetry
```

## Features

- Distributed tracing with OTLP export
- Metrics collection and export
- Auto-instrumentation for common Node.js libraries
- Custom service naming and environment tagging
- Periodic metric export
- Health checks
- Resource attributes for service identification

## Configuration

```typescript
interface OpenTelemetryConfig {
  serviceName: string;              // Required: Service name for telemetry
  traceEndpoint?: string;           // Default: 'http://localhost:4318/v1/traces'
  metricsEndpoint?: string;         // Default: 'http://localhost:4318/v1/metrics'
  autoInstrumentation?: boolean;    // Default: true
  metricInterval?: number;          // Default: 60000 (60s)
  environment?: string;             // Optional: Environment name
}
```

## Quick Example

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { OpenTelemetryPlugin } from '@stratix/ext-opentelemetry';

const app = await ApplicationBuilder.create()
  .usePlugin(new OpenTelemetryPlugin(), {
    serviceName: 'my-service',
    environment: 'production',
    traceEndpoint: 'http://localhost:4318/v1/traces',
    metricsEndpoint: 'http://localhost:4318/v1/metrics',
    autoInstrumentation: true,
    metricInterval: 60000
  })
  .build();

await app.start();

// OpenTelemetry SDK will automatically instrument your application
// Traces and metrics will be exported to the configured endpoints

// Access the SDK for custom instrumentation
const sdk = app.resolve('opentelemetry:sdk');
```

## Auto-Instrumentation

When `autoInstrumentation` is enabled (default), the plugin automatically instruments:

- HTTP/HTTPS (incoming and outgoing requests)
- Express.js
- Fastify
- PostgreSQL (via `pg`)
- MongoDB
- Redis
- MySQL
- And many more Node.js libraries

## Exports

- `OpenTelemetryPlugin` - Main plugin class
- `OpenTelemetryConfig` - Configuration interface

## Services Registered

The plugin registers the following services in the DI container:

- `opentelemetry:sdk` - OpenTelemetry NodeSDK instance

## Integration with Collectors

This plugin exports traces and metrics in OTLP format over HTTP. You can configure it to work with:

- OpenTelemetry Collector
- Jaeger (with OTLP receiver)
- Prometheus (with OTLP receiver)
- Grafana Tempo
- Honeycomb
- New Relic
- Datadog
- And other OTLP-compatible backends

## License

MIT
