# @stratix/auth

Authentication and authorization plugin for Stratix framework with JWT and RBAC support.

## Installation

```bash
pnpm add @stratix/auth
```

## Features

- JWT token generation and verification
- Password hashing with bcrypt
- Role-Based Access Control (RBAC)
- Permission management
- Type-safe authentication context

## Usage

### Basic Setup

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AuthPlugin } from '@stratix/auth';

const app = await ApplicationBuilder.create()
  .usePlugin(new AuthPlugin({
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: '24h',
    },
    roles: [
      {
        name: 'admin',
        permissions: ['create:product', 'delete:product', 'read:product']
      },
      {
        name: 'user',
        permissions: ['read:product']
      },
    ],
  }))
  .build();
```

### JWT Token Operations

```typescript
import { JWTService } from '@stratix/auth';

const jwtService = new JWTService({
  secret: 'your-secret-key',
  expiresIn: '24h',
});

const token = jwtService.sign({
  sub: userId,
  email: user.email,
  roles: ['user'],
  permissions: ['read:product'],
});

const payload = jwtService.verify(token);
```

### Password Hashing

```typescript
import { BcryptPasswordHasher } from '@stratix/auth';

const hasher = new BcryptPasswordHasher(10);

const hash = await hasher.hash('password123');
const isValid = await hasher.verify('password123', hash);
```

### RBAC

```typescript
import { RBACService } from '@stratix/auth';

const rbac = new RBACService([
  { name: 'admin', permissions: ['create:product', 'delete:product'] },
  { name: 'user', permissions: ['read:product'] },
]);

const hasPermission = rbac.hasPermission(user, 'create:product');
const hasRole = rbac.hasRole(user, 'admin');
```

## License

MIT
