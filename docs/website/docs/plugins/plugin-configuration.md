---
sidebar_position: 4
title: Plugin Configuration
description: Configuring Stratix plugins
---

# Plugin Configuration

Learn how to configure plugins in your Stratix application.

## Configuration Methods

### 1. Constructor Configuration

Pass configuration directly to the plugin constructor:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { FastifyHTTPPlugin } from '@stratix/http-fastify';

const app = await ApplicationBuilder.create()
  .usePlugin(new FastifyHTTPPlugin({
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origin: '*'
    }
  }))
  .build();
```

### 2. Environment Variables

```typescript
const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!
  }))
  .build();
```

### 3. Configuration Files

```typescript
// config/database.ts
export const databaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'myapp'
};

// src/main.ts
import { databaseConfig } from '../config/database';

const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin(databaseConfig))
  .build();
```

## Plugin-Specific Configuration

### HTTP Plugin

```typescript
new FastifyHTTPPlugin({
  port: 3000,
  host: '0.0.0.0',
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true
  },
  rateLimit: {
    max: 100,
    timeWindow: '1 minute'
  }
})
```

### Database Plugin

```typescript
new PostgresPlugin({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'postgres',
  password: 'password',
  pool: {
    min: 2,
    max: 10
  },
  ssl: process.env.NODE_ENV === 'production'
})
```

### AI Provider Plugin

```typescript
new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: 'org-123',
  defaultModel: 'gpt-4o',
  timeout: 30000,
  maxRetries: 3
})
```

## Best Practices

### 1. Use Environment Variables

```typescript
// ✅ Good
port: parseInt(process.env.PORT || '3000')

// ❌ Bad
port: 3000
```

### 2. Validate Configuration

```typescript
const port = parseInt(process.env.PORT || '3000');
if (port < 1 || port > 65535) {
  throw new Error('Invalid port number');
}
```

### 3. Provide Defaults

```typescript
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  pool: {
    min: 2,
    max: 10
  }
};
```

### 4. Separate by Environment

```typescript
// config/production.ts
export const config = {
  database: {
    ssl: true,
    pool: { max: 20 }
  }
};

// config/development.ts
export const config = {
  database: {
    ssl: false,
    pool: { max: 5 }
  }
};
```

## Next Steps

- **[Plugin Architecture](./plugin-architecture)** - Architecture overview
- **[Creating Plugins](./creating-plugins)** - Build plugins
- **[Official Plugins](./official-plugins)** - Available plugins
