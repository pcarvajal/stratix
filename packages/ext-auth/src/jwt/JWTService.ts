import jwt, { type SignOptions } from 'jsonwebtoken';
import type { JWTPayload, JWTOptions, TokenService } from '../types.js';

interface DecodedJWT {
  sub: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  iat?: number;
  exp?: number;
  metadata?: Record<string, unknown>;
}

export class JWTService implements TokenService {
  constructor(private readonly options: JWTOptions) {}

  sign(payload: JWTPayload): string {
    return jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
        roles: payload.roles,
        permissions: payload.permissions,
        metadata: payload.metadata,
      },
      this.options.secret,
      {
        algorithm: this.options.algorithm || 'HS256',
        expiresIn: (this.options.expiresIn || '24h') as string | number | undefined,
        issuer: this.options.issuer,
        audience: this.options.audience,
      } as SignOptions
    );
  }

  verify(token: string): JWTPayload {
    const decoded = jwt.verify(token, this.options.secret, {
      algorithms: [this.options.algorithm || 'HS256'],
      issuer: this.options.issuer,
      audience: this.options.audience,
    }) as DecodedJWT;

    return {
      sub: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      iat: decoded.iat,
      exp: decoded.exp,
      metadata: decoded.metadata,
    };
  }

  decode(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || typeof decoded === 'string') return null;

      const decodedJWT = decoded as DecodedJWT;

      return {
        sub: decodedJWT.sub,
        email: decodedJWT.email,
        roles: decodedJWT.roles || [],
        permissions: decodedJWT.permissions || [],
        iat: decodedJWT.iat,
        exp: decodedJWT.exp,
        metadata: decodedJWT.metadata,
      };
    } catch {
      return null;
    }
  }
}
