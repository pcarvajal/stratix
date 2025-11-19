export interface Migration {
  version: string;
  name: string;
  up(context: MigrationContext): Promise<void>;
  down(context: MigrationContext): Promise<void>;
}

export interface MigrationContext {
  query(sql: string, params?: unknown[]): Promise<unknown>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

export interface MigrationRecord {
  version: string;
  name: string;
  executedAt: Date;
}

export interface MigrationOptions {
  tableName?: string;
  migrationsPath?: string;
}

export interface MigrationResult {
  version: string;
  name: string;
  status: 'success' | 'failed';
  error?: Error;
}
