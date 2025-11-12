# @stratix/ext-opentelemetry

OpenTelemetry extension for Stratix framework providing distributed tracing and metrics.

## Features

- Distributed tracing with OTLP
- Metrics collection and export
- Auto-instrumentation for common libraries
- Custom service naming and environment tagging
- Health checks

## Installation

```bash
npm install @stratix/ext-opentelemetry
```

## Usage

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { OpenTelemetryPlugin } from '@stratix/ext-opentelemetry';

const app = await ApplicationBuilder.create()
  .usePlugin(new OpenTelemetryPlugin())
  .withConfig({
    'opentelemetry': {
      serviceName: 'my-service',
      environment: 'production',
      traceEndpoint: 'http://localhost:4318/v1/traces',
      metricsEndpoint: 'http://localhost:4318/v1/metrics',
      autoInstrumentation: true,
      metricInterval: 60000
    }
  })
  .build();

await app.start();
```

## Configuration

- `serviceName`: Service name for telemetry (required)
- `traceEndpoint`: OTLP endpoint for traces (default: 'http://localhost:4318/v1/traces')
- `metricsEndpoint`: OTLP endpoint for metrics (default: 'http://localhost:4318/v1/metrics')
- `autoInstrumentation`: Enable auto-instrumentation (default: true)
- `metricInterval`: Metric export interval in ms (default: 60000)
- `environment`: Environment name (e.g., 'production', 'staging')

## License

MIT
