# @stratix/ext-secrets

Secrets management extension for Stratix framework.

## Features

- Environment variable provider
- Secret caching with TTL
- Prefix support for namespacing
- Health checks

## Installation

```bash
npm install @stratix/ext-secrets
```

## Usage

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { SecretsPlugin } from '@stratix/ext-secrets';

const app = await ApplicationBuilder.create()
  .usePlugin(new SecretsPlugin())
  .withConfig({
    'secrets': {
      provider: 'environment',
      prefix: 'APP_',
      cache: true,
      cacheTTL: 300000
    }
  })
  .build();

await app.start();

// Access secrets
const secrets = app.resolve('secrets:manager');
const dbUrl = await secrets.get('DATABASE_URL');
const apiKey = await secrets.getRequired('API_KEY');
```

## Configuration

- `provider`: Provider type (default: 'environment')
- `prefix`: Environment variable prefix (default: '')
- `cache`: Enable caching (default: true)
- `cacheTTL`: Cache TTL in milliseconds (default: 300000)

## License

MIT
