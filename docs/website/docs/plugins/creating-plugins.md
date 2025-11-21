---
sidebar_position: 2
title: Creating Plugins
description: Build custom plugins for Stratix
---

# Creating Plugins

Learn how to create custom plugins to extend Stratix functionality.

## Plugin Template

```typescript
import { Plugin, PluginContext, PluginMetadata } from '@stratix/core';

export interface MyPluginConfig {
  // Your configuration options
}

export class MyPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My custom plugin',
    dependencies: [], // Required plugins
    optionalDependencies: [] // Optional plugins
  };

  constructor(private config: MyPluginConfig) {}

  async initialize(context: PluginContext): Promise<void> {
    // Set up resources, register services
  }

  async start(context: PluginContext): Promise<void> {
    // Start servers, subscribe to events
  }

  async stop(): Promise<void> {
    // Clean up resources
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { status: 'healthy' };
  }
}
```

## Step-by-Step Guide

### 1. Create Plugin Class

```typescript
import { Plugin } from '@stratix/core';

export class EmailPlugin implements Plugin {
  readonly metadata = {
    name: 'email',
    version: '1.0.0'
  };
}
```

### 2. Add Configuration

```typescript
export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export class EmailPlugin implements Plugin {
  constructor(private config: EmailConfig) {}
}
```

### 3. Implement Initialize

```typescript
async initialize(context: PluginContext): Promise<void> {
  // Create email service
  const emailService = new EmailService(this.config);
  
  // Register in container
  context.container.register('emailService', () => emailService);
  
  context.logger.info('Email plugin initialized');
}
```

### 4. Implement Start

```typescript
async start(context: PluginContext): Promise<void> {
  const emailService = context.container.resolve('emailService');
  await emailService.connect();
  
  context.logger.info('Email service connected');
}
```

### 5. Implement Stop

```typescript
async stop(): Promise<void> {
  await this.emailService?.disconnect();
}
```

### 6. Add Health Check

```typescript
async healthCheck(): Promise<HealthCheckResult> {
  try {
    await this.emailService.ping();
    return { status: 'healthy' };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}
```

## Complete Example

```typescript
import { Plugin, PluginContext } from '@stratix/core';
import nodemailer, { Transporter } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailPlugin implements Plugin {
  readonly metadata = {
    name: 'email',
    version: '1.0.0',
    description: 'Email sending plugin using nodemailer',
    dependencies: ['logger']
  };

  private transporter?: Transporter;

  constructor(private config: EmailConfig) {}

  async initialize(context: PluginContext): Promise<void> {
    this.transporter = nodemailer.createTransport(this.config);

    // Register email service
    context.container.register('emailService', () => ({
      send: async (to: string, subject: string, html: string) => {
        await this.transporter!.sendMail({ to, subject, html });
      }
    }));

    context.logger.info('Email plugin initialized');
  }

  async start(context: PluginContext): Promise<void> {
    // Verify connection
    await this.transporter!.verify();
    context.logger.info('Email service ready');
  }

  async stop(): Promise<void> {
    this.transporter?.close();
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      await this.transporter!.verify();
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}
```

## Usage

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { EmailPlugin } from './plugins/email.plugin';

const app = await ApplicationBuilder.create()
  .usePlugin(new EmailPlugin({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!
    }
  }))
  .build();

// Use in your code
const emailService = app.resolve('emailService');
await emailService.send(
  'user@example.com',
  'Welcome!',
  '<h1>Welcome to our app!</h1>'
);
```

## Publishing

### 1. Package Structure

```
my-plugin/
├── src/
│   ├── index.ts
│   └── my-plugin.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 2. package.json

```json
{
  "name": "@myorg/stratix-plugin-email",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@stratix/core": "^0.1.0"
  }
}
```

### 3. Export Plugin

```typescript
// src/index.ts
export { EmailPlugin } from './email.plugin';
export type { EmailConfig } from './email.plugin';
```

### 4. Publish to npm

```bash
npm publish
```

## Best Practices

### 1. Clear Naming

```typescript
// ✅ Good
name: 'email'
name: 'postgres'
name: 'redis'

// ❌ Bad
name: 'plugin1'
name: 'my-plugin'
```

### 2. Validate Configuration

```typescript
async initialize(context: PluginContext): Promise<void> {
  if (!this.config.host) {
    throw new Error('Email host is required');
  }
}
```

### 3. Graceful Shutdown

```typescript
async stop(): Promise<void> {
  await this.connection?.close();
  this.logger?.info('Plugin stopped');
}
```

### 4. Comprehensive Health Checks

```typescript
async healthCheck(): Promise<HealthCheckResult> {
  const checks = await Promise.all([
    this.checkConnection(),
    this.checkDiskSpace(),
    this.checkMemory()
  ]);
  
  return {
    status: checks.every(c => c.ok) ? 'healthy' : 'unhealthy',
    details: checks
  };
}
```

## Next Steps

- **[Plugin Architecture](./plugin-architecture)** - Architecture overview
- **[Official Plugins](./official-plugins)** - Available plugins
- **[Plugin Configuration](./plugin-configuration)** - Configuration guide
