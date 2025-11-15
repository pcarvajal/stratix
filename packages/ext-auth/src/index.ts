export { AuthPlugin } from './AuthPlugin.js';
export { JWTService } from './jwt/JWTService.js';
export { BcryptPasswordHasher } from './jwt/PasswordHasher.js';
export { RBACService } from './rbac/RBACService.js';
export {
  AuthenticationError,
  AuthorizationError,
  TokenExpiredError,
  InvalidTokenError,
} from './errors.js';
export type {
  User,
  AuthContext,
  JWTPayload,
  JWTOptions,
  Role,
  Permission,
  AuthPluginOptions,
  PasswordHasher,
  TokenService,
} from './types.js';
