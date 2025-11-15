import type {
  Plugin,
  PluginContext,
  HealthCheckResult,
  PluginMetadata,
  HealthStatus,
} from '@stratix/abstractions';
import type { AuthPluginOptions } from './types.js';
import { JWTService } from './jwt/JWTService.js';
import { BcryptPasswordHasher } from './jwt/PasswordHasher.js';
import { RBACService } from './rbac/RBACService.js';

export class AuthPlugin implements Plugin {
  public readonly metadata: PluginMetadata = {
    name: 'auth',
    version: '0.1.2',
    description: 'Authentication and authorization plugin',
  };

  private jwtService?: JWTService;
  private passwordHasher?: BcryptPasswordHasher;
  private rbacService?: RBACService;

  constructor(private readonly options: AuthPluginOptions) {}

  initialize(context: PluginContext): Promise<void> {
    this.jwtService = new JWTService(this.options.jwt);
    this.passwordHasher = new BcryptPasswordHasher(this.options.passwordHashRounds);
    this.rbacService = new RBACService(this.options.roles);

    context.container.register('jwtService', () => this.jwtService);
    context.container.register('passwordHasher', () => this.passwordHasher);
    context.container.register('rbacService', () => this.rbacService);

    return Promise.resolve();
  }

  healthCheck(): Promise<HealthCheckResult> {
    return Promise.resolve({
      status: 'up' as HealthStatus,
      message: 'Auth plugin is healthy',
    });
  }

  getJWTService(): JWTService | undefined {
    return this.jwtService;
  }

  getPasswordHasher(): BcryptPasswordHasher | undefined {
    return this.passwordHasher;
  }

  getRBACService(): RBACService | undefined {
    return this.rbacService;
  }
}
