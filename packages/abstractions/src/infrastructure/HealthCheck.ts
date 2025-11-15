/**
 * Status of a health check.
 */
export enum HealthStatus {
  /**
   * The component is healthy and functioning correctly.
   */
  UP = 'up',

  /**
   * The component is degraded but still partially functional.
   */
  DEGRADED = 'degraded',

  /**
   * The component is down and not functioning.
   */
  DOWN = 'down',
}

/**
 * Result of a health check.
 *
 * @example
 * ```typescript
 * {
 *   status: HealthStatus.UP,
 *   message: 'Database connection healthy',
 *   details: {
 *     latency: '5ms',
 *     connections: 10
 *   }
 * }
 * ```
 */
export interface HealthCheckResult {
  /**
   * The health status.
   */
  status: HealthStatus;

  /**
   * Optional message describing the health status.
   */
  message?: string;

  /**
   * Optional details about the health check.
   */
  details?: Record<string, unknown>;
}

/**
 * Interface for components that support health checks.
 *
 * @example
 * ```typescript
 * class DatabaseHealthCheck implements HealthCheck {
 *   async check(): Promise<HealthCheckResult> {
 *     try {
 *       await this.database.ping();
 *       return {
 *         status: HealthStatus.UP,
 *         message: 'Database connection healthy',
 *         details: { latency: '5ms' }
 *       };
 *     } catch (error) {
 *       return {
 *         status: HealthStatus.DOWN,
 *         message: 'Database connection failed',
 *         details: { error: error.message }
 *       };
 *     }
 *   }
 * }
 * ```
 */
export interface HealthCheck {
  /**
   * Performs a health check.
   *
   * @returns The result of the health check
   *
   * @example
   * ```typescript
   * const result = await healthCheck.check();
   * if (result.status === HealthStatus.UP) {
   *   console.log('Service is healthy');
   * }
   * ```
   */
  check(): Promise<HealthCheckResult>;
}
