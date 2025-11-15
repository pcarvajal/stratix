import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type {
  Plugin,
  PluginMetadata,
  PluginContext,
  HealthCheckResult,
} from '@stratix/abstractions';
import { HealthStatus, ServiceLifetime } from '@stratix/abstractions';

/**
 * OpenTelemetry plugin configuration
 */
export interface OpenTelemetryConfig {
  /**
   * Service name for telemetry
   */
  serviceName: string;

  /**
   * OTLP endpoint for traces
   * @default 'http://localhost:4318/v1/traces'
   */
  traceEndpoint?: string;

  /**
   * OTLP endpoint for metrics
   * @default 'http://localhost:4318/v1/metrics'
   */
  metricsEndpoint?: string;

  /**
   * Enable auto-instrumentation
   * @default true
   */
  autoInstrumentation?: boolean;

  /**
   * Metric export interval in milliseconds
   * @default 60000
   */
  metricInterval?: number;

  /**
   * Environment name (e.g., 'production', 'staging')
   */
  environment?: string;
}

/**
 * OpenTelemetry Plugin for Stratix
 *
 * Provides distributed tracing and metrics collection using OpenTelemetry.
 *
 * @example
 * ```typescript
 * import { ApplicationBuilder } from '@stratix/runtime';
 * import { OpenTelemetryPlugin } from '@stratix/ext-opentelemetry';
 *
 * const app = await ApplicationBuilder.create()
 *   .usePlugin(new OpenTelemetryPlugin())
 *   .withConfig({
 *     'opentelemetry': {
 *       serviceName: 'my-service',
 *       environment: 'production',
 *       traceEndpoint: 'http://localhost:4318/v1/traces',
 *       autoInstrumentation: true
 *     }
 *   })
 *   .build();
 *
 * await app.start();
 * ```
 */
export class OpenTelemetryPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'opentelemetry',
    version: '0.1.0',
    description: 'OpenTelemetry observability plugin with tracing and metrics',
    dependencies: [],
  };

  private sdk?: NodeSDK;
  private config?: OpenTelemetryConfig;
  private started = false;

  /**
   * Initialize the plugin
   */
  async initialize(context: PluginContext): Promise<void> {
    this.config = context.getConfig<OpenTelemetryConfig>();

    // Validate configuration
    if (!this.config.serviceName) {
      throw new Error('OpenTelemetry service name is required');
    }

    // Create trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: this.config.traceEndpoint ?? 'http://localhost:4318/v1/traces',
    });

    // Create metrics exporter
    const metricExporter = new OTLPMetricExporter({
      url: this.config.metricsEndpoint ?? 'http://localhost:4318/v1/metrics',
    });

    // Create metric reader
    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: this.config.metricInterval ?? 60000,
    });

    // Create SDK configuration
    const sdkConfig: any = {
      serviceName: this.config.serviceName,
      traceExporter,
      metricReader,
      resource: {
        attributes: {
          'service.name': this.config.serviceName,
          'deployment.environment': this.config.environment ?? 'development',
        },
      },
    };

    // Add auto-instrumentation if enabled
    if (this.config.autoInstrumentation !== false) {
      sdkConfig.instrumentations = [getNodeAutoInstrumentations()];
    }

    // Create SDK
    this.sdk = new NodeSDK(sdkConfig);

    // Register SDK accessor in container
    context.container.register('opentelemetry:sdk', () => this.sdk!, {
      lifetime: ServiceLifetime.SINGLETON,
    });
  }

  /**
   * Start the plugin
   *
   * Initializes OpenTelemetry SDK.
   */
  async start(): Promise<void> {
    if (!this.sdk) {
      throw new Error('OpenTelemetryPlugin not initialized. Call initialize() first.');
    }

    try {
      await this.sdk.start();
      this.started = true;
      console.log('OpenTelemetry SDK started');
    } catch (error) {
      throw new Error(
        `Failed to start OpenTelemetry SDK: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Stop the plugin
   *
   * Shuts down OpenTelemetry SDK gracefully.
   */
  async stop(): Promise<void> {
    if (this.sdk && this.started) {
      try {
        await this.sdk.shutdown();
        this.started = false;
        console.log('OpenTelemetry SDK stopped');
      } catch (error) {
        console.error(
          `Error stopping OpenTelemetry SDK: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * Perform a health check
   */
  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.sdk) {
      return {
        status: HealthStatus.DOWN,
        message: 'Not initialized',
      };
    }

    if (!this.started) {
      return {
        status: HealthStatus.DOWN,
        message: 'Not started',
      };
    }

    return {
      status: HealthStatus.UP,
      message: 'OpenTelemetry SDK running',
      details: {
        serviceName: this.config?.serviceName,
        environment: this.config?.environment,
      },
    };
  }

  /**
   * Get the SDK instance
   */
  getSDK(): NodeSDK {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    return this.sdk;
  }
}
