# @stratix/migrations

Database migration system for Stratix framework.

## Installation

```bash
pnpm add @stratix/migrations
```

## Usage

```typescript
import { MigrationRunner } from '@stratix/migrations';

const context = {
  query: async (sql, params) => db.query(sql, params),
  execute: async (sql, params) => db.execute(sql, params),
};

const runner = new MigrationRunner(context);

runner.register({
  version: '001',
  name: 'create_users_table',
  async up(ctx) {
    await ctx.execute(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },
  async down(ctx) {
    await ctx.execute('DROP TABLE users');
  },
});

await runner.up();

await runner.down(1);
```

## License

MIT
