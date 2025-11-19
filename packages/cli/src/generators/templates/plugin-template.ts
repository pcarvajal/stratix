export function generatePlugin(
  pluginName: string,
  pluginKebab: string,
  withHealthCheck: boolean
): string {
  const healthCheckMethod = withHealthCheck
    ? `
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      // TODO: Implement health check logic
      return {
        status: HealthStatus.UP,
        message: '${pluginName} is healthy',
      };
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: \`${pluginName} health check failed: \${error}\`,
        details: { error: String(error) },
      };
    }
  }`
    : '';

  return `import type { Plugin, PluginContext, PluginMetadata${
    withHealthCheck ? ', HealthCheckResult' : ''
  } } from '@stratix/core';${
    withHealthCheck ? "\nimport { HealthStatus } from '@stratix/core';" : ''
  }

export interface ${pluginName}PluginOptions {
  // Add your plugin configuration options here
}

export class ${pluginName}Plugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: '${pluginKebab}',
    version: '0.1.0',
    dependencies: [],
  };

  constructor(private options: ${pluginName}PluginOptions = {}) {}

  async initialize(context: PluginContext): Promise<void> {
    const { container, logger } = context;
    
    logger.info(\`Initializing \${this.metadata.name} plugin\`);

    // TODO: Register services with DI container
    // container.register('myService', () => new MyService(this.options));
  }

  async start(): Promise<void> {
    // TODO: Start plugin services
    // Examples:
    // - Connect to database
    // - Start HTTP server
    // - Subscribe to message queue
  }

  async stop(): Promise<void> {
    // TODO: Stop plugin services and cleanup
    // Examples:
    // - Close database connections
    // - Stop HTTP server
    // - Unsubscribe from message queue
  }${healthCheckMethod}
}
`;
}
