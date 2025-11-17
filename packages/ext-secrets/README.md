# @stratix/ext-secrets

Secrets management extension for Stratix framework.

## Installation

```bash
pnpm add @stratix/ext-secrets
```

## Features

- Environment variable provider
- Secret caching with configurable TTL
- Prefix support for namespacing
- Required vs optional secret retrieval
- Cache size monitoring
- Health checks
- Clear cache operation

## Configuration

```typescript
interface SecretsConfig {
  provider?: 'environment';     // Default: 'environment'
  prefix?: string;              // Default: '' (no prefix)
  cache?: boolean;              // Default: true
  cacheTTL?: number;            // Default: 300000 (5 minutes)
}
```

## Quick Example

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { SecretsPlugin } from '@stratix/ext-secrets';

const app = await ApplicationBuilder.create()
  .usePlugin(new SecretsPlugin(), {
    provider: 'environment',
    prefix: 'APP_',
    cache: true,
    cacheTTL: 300000  // 5 minutes
  })
  .build();

await app.start();

// Access secrets
const secrets = app.resolve('secrets:manager');

// Get optional secret (returns undefined if not found)
const dbUrl = await secrets.get('DATABASE_URL');
// Will look for APP_DATABASE_URL in environment

// Get required secret (throws if not found)
const apiKey = await secrets.getRequired('API_KEY');
// Will look for APP_API_KEY in environment

// Check cache size
console.log('Cached secrets:', secrets.getCacheSize());
```

## Secrets Manager API

```typescript
class SecretsManager {
  async get(key: string): Promise<string | undefined>;
  async getRequired(key: string): Promise<string>;
  getCacheSize(): number;
  clearCache(): void;
}
```

## Exports

- `SecretsPlugin` - Main plugin class
- `SecretsConfig` - Configuration interface
- `SecretsManager` - Secrets manager class
- `SecretsManagerConfig` - Manager configuration interface

## Services Registered

The plugin registers the following services in the DI container:

- `secrets:manager` - SecretsManager instance

## Future Provider Support

The current implementation supports environment variables. Future versions may include:

- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault
- Kubernetes Secrets

## License

MIT
