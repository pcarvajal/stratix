export interface User {
  id: string;
  email?: string;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, unknown>;
}

export interface AuthContext {
  user: User;
  token: string;
  isAuthenticated: boolean;
}

export interface JWTPayload {
  sub: string;
  email?: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
  metadata?: Record<string, unknown>;
}

export interface JWTOptions {
  secret: string;
  expiresIn?: string | number;
  algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
  issuer?: string;
  audience?: string;
}

export interface Role {
  name: string;
  description?: string;
  permissions: string[];
}

export interface Permission {
  resource: string;
  action: string;
}

export interface AuthPluginOptions {
  jwt: JWTOptions;
  roles?: Role[];
  passwordHashRounds?: number;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  sign(payload: JWTPayload): string;
  verify(token: string): JWTPayload;
  decode(token: string): JWTPayload | null;
}
