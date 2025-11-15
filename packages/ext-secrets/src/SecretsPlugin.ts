import type {
  Plugin,
  PluginMetadata,
  PluginContext,
  HealthCheckResult,
} from '@stratix/abstractions';
import { HealthStatus, ServiceLifetime } from '@stratix/abstractions';
import { SecretsManager } from './SecretsManager.js';

/**
 * Secrets plugin configuration
 */
export interface SecretsConfig {
  /**
   * Provider type
   * @default 'environment'
   */
  provider?: 'environment';

  /**
   * Environment variable prefix (for environment provider)
   * @default ''
   */
  prefix?: string;

  /**
   * Enable caching
   * @default true
   */
  cache?: boolean;

  /**
   * Cache TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTTL?: number;
}

/**
 * Secrets Plugin for Stratix
 *
 * Provides secure secrets management with caching and multiple provider support.
 *
 * @example
 * ```typescript
 * import { ApplicationBuilder } from '@stratix/runtime';
 * import { SecretsPlugin } from '@stratix/ext-secrets';
 *
 * const app = await ApplicationBuilder.create()
 *   .usePlugin(new SecretsPlugin())
 *   .withConfig({
 *     'secrets': {
 *       provider: 'environment',
 *       prefix: 'APP_',
 *       cache: true
 *     }
 *   })
 *   .build();
 *
 * await app.start();
 *
 * // Access secrets
 * const secrets = app.resolve<SecretsManager>('secrets:manager');
 * const dbUrl = await secrets.get('DATABASE_URL');
 * ```
 */
export class SecretsPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'secrets',
    version: '0.1.0',
    description: 'Secrets management plugin with caching and provider support',
    dependencies: [],
  };

  private manager?: SecretsManager;
  private config?: SecretsConfig;

  /**
   * Initialize the plugin
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(context: PluginContext): Promise<void> {
    this.config = context.getConfig<SecretsConfig>();

    // Create secrets manager
    this.manager = new SecretsManager({
      provider: this.config.provider ?? 'environment',
      prefix: this.config.prefix ?? '',
      cache: this.config.cache ?? true,
      cacheTTL: this.config.cacheTTL ?? 300000,
    });

    // Register manager in container
    context.container.register('secrets:manager', () => this.manager!, {
      lifetime: ServiceLifetime.SINGLETON,
    });
  }

  /**
   * Start the plugin
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async start(): Promise<void> {
    if (!this.manager) {
      throw new Error('SecretsPlugin not initialized. Call initialize() first.');
    }

    console.log('Secrets plugin started');
  }

  /**
   * Stop the plugin
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async stop(): Promise<void> {
    if (this.manager) {
      this.manager.clearCache();
    }
    console.log('Secrets plugin stopped');
  }

  /**
   * Perform a health check
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.manager) {
      return {
        status: HealthStatus.DOWN,
        message: 'Not initialized',
      };
    }

    return {
      status: HealthStatus.UP,
      message: 'Secrets manager ready',
      details: {
        cacheSize: this.manager.getCacheSize(),
      },
    };
  }

  /**
   * Get the secrets manager instance
   */
  getManager(): SecretsManager {
    if (!this.manager) {
      throw new Error('Manager not initialized');
    }
    return this.manager;
  }
}
