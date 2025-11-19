import type { Container, Plugin, HealthCheckResult } from '@stratix/core';
import { HealthStatus } from '@stratix/core';
import { PluginRegistry } from '../registry/PluginRegistry.js';
import { ModuleRegistry } from '../module/ModuleRegistry.js';
import { LifecycleManager, LifecyclePhase } from '../lifecycle/LifecycleManager.js';

/**
 * The main application class.
 *
 * Manages plugins, lifecycle, and provides access to the container.
 *
 * @example
 * ```typescript
 * const app = await ApplicationBuilder.create()
 *   .usePlugin(new DatabasePlugin())
 *   .build();
 *
 * await app.start();
 * // Application running
 * await app.stop();
 * ```
 */
export class Application {
  constructor(
    private readonly container: Container,
    private readonly pluginRegistry: PluginRegistry,
    private readonly moduleRegistry: ModuleRegistry,
    private readonly lifecycleManager: LifecycleManager
  ) {}

  /**
   * Starts the application.
   *
   * Starts all plugins in dependency order.
   *
   * @throws {PluginLifecycleError} If a plugin fails to start
   */
  async start(): Promise<void> {
    await this.lifecycleManager.startAll();
  }

  /**
   * Stops the application.
   *
   * Stops all plugins in reverse dependency order.
   */
  async stop(): Promise<void> {
    await this.lifecycleManager.stopAll();
  }

  /**
   * Resolves a service from the container.
   *
   * @template T - The service type
   * @param token - The service token
   * @returns The resolved service
   */
  resolve<T>(token: string | symbol): T {
    return this.container.resolve<T>(token);
  }

  /**
   * Gets the dependency injection container.
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Gets all registered plugins.
   */
  getPlugins(): Plugin[] {
    return this.pluginRegistry.getAll();
  }

  /**
   * Gets a plugin by name.
   *
   * @param name - The plugin name
   * @returns The plugin if found, undefined otherwise
   */
  getPlugin(name: string): Plugin | undefined {
    return this.pluginRegistry.get(name);
  }

  /**
   * Gets the current lifecycle phase.
   */
  getLifecyclePhase(): LifecyclePhase {
    return this.lifecycleManager.currentPhase;
  }

  /**
   * Performs health checks on all plugins and modules.
   *
   * @returns Aggregated health check result
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const plugins = this.pluginRegistry.getAll();
    const modules = this.moduleRegistry.getAll();
    const results: Record<string, HealthCheckResult> = {};
    let overallStatus: HealthStatus = HealthStatus.UP;

    for (const plugin of plugins) {
      if (plugin.healthCheck) {
        try {
          const result = await plugin.healthCheck();
          results[plugin.metadata.name] = result;

          // Aggregate status (worst status wins)
          if (result.status === HealthStatus.DOWN) {
            overallStatus = HealthStatus.DOWN;
          } else if (result.status === HealthStatus.DEGRADED && overallStatus === HealthStatus.UP) {
            overallStatus = HealthStatus.DEGRADED;
          }
        } catch (error) {
          results[plugin.metadata.name] = {
            status: HealthStatus.DOWN,
            message: `Health check failed: ${(error as Error).message}`,
          };
          overallStatus = HealthStatus.DOWN;
        }
      }
    }

    for (const module of modules) {
      if (module.healthCheck) {
        try {
          const result = await module.healthCheck();
          results[module.metadata.name] = result;

          if (result.status === HealthStatus.DOWN) {
            overallStatus = HealthStatus.DOWN;
          } else if (result.status === HealthStatus.DEGRADED && overallStatus === HealthStatus.UP) {
            overallStatus = HealthStatus.DEGRADED;
          }
        } catch (error) {
          results[module.metadata.name] = {
            status: HealthStatus.DOWN,
            message: `Health check failed: ${(error as Error).message}`,
          };
          overallStatus = HealthStatus.DOWN;
        }
      }
    }

    return {
      status: overallStatus,
      message: `Application is ${overallStatus}`,
      details: results,
    };
  }
}
