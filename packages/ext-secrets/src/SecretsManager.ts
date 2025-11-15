/**
 * Secrets Manager Configuration
 */
export interface SecretsManagerConfig {
  provider: 'environment';
  prefix: string;
  cache: boolean;
  cacheTTL: number;
}

/**
 * Cached secret value
 */
interface CachedSecret {
  value: string;
  expiresAt: number;
}

/**
 * Secrets Manager
 *
 * Manages secrets retrieval with caching and provider abstraction.
 */
export class SecretsManager {
  private cache: Map<string, CachedSecret> = new Map();

  constructor(private readonly config: SecretsManagerConfig) {}

  /**
   * Get a secret value
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async get(key: string): Promise<string | undefined> {
    // Check cache
    if (this.config.cache) {
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
    }

    // Get from provider
    const value = this.getFromProvider(key);

    // Cache if enabled
    if (value !== undefined && this.config.cache) {
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + this.config.cacheTTL,
      });
    }

    return value;
  }

  /**
   * Get a required secret value (throws if not found)
   */
  async getRequired(key: string): Promise<string> {
    const value = await this.get(key);
    if (value === undefined) {
      throw new Error(`Required secret not found: ${key}`);
    }
    return value;
  }

  /**
   * Check if a secret exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Get secret from provider
   */
  private getFromProvider(key: string): string | undefined {
    if (this.config.provider === 'environment') {
      const fullKey = this.config.prefix + key;
      return process.env[fullKey];
    }

    return undefined;
  }
}
