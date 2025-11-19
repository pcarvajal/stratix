import type { Migration, MigrationContext, MigrationRecord, MigrationResult } from '../types.js';

export class MigrationRunner {
  private migrations: Migration[] = [];

  constructor(
    private readonly context: MigrationContext,
    private readonly tableName: string = 'migrations'
  ) {}

  register(migration: Migration): void {
    this.migrations.push(migration);
  }

  async ensureMigrationsTable(): Promise<void> {
    await this.context.execute(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const result = (await this.context.query(
      `SELECT version, name, executed_at as executedAt FROM ${this.tableName} ORDER BY version`
    )) as Array<{ version: string; name: string; executedAt: string | Date }>;

    return result.map((row) => ({
      version: row.version,
      name: row.name,
      executedAt: new Date(row.executedAt),
    }));
  }

  async getPendingMigrations(): Promise<Migration[]> {
    const executed = await this.getExecutedMigrations();
    const executedVersions = new Set(executed.map((m) => m.version));

    return this.migrations
      .filter((m) => !executedVersions.has(m.version))
      .sort((a, b) => a.version.localeCompare(b.version));
  }

  async up(steps?: number): Promise<MigrationResult[]> {
    await this.ensureMigrationsTable();
    const pending = await this.getPendingMigrations();
    const toExecute = steps ? pending.slice(0, steps) : pending;
    const results: MigrationResult[] = [];

    for (const migration of toExecute) {
      try {
        await migration.up(this.context);
        await this.recordMigration(migration);
        results.push({
          version: migration.version,
          name: migration.name,
          status: 'success',
        });
      } catch (error) {
        results.push({
          version: migration.version,
          name: migration.name,
          status: 'failed',
          error: error instanceof Error ? error : new Error(String(error)),
        });
        break;
      }
    }

    return results;
  }

  async down(steps: number = 1): Promise<MigrationResult[]> {
    await this.ensureMigrationsTable();
    const executed = await this.getExecutedMigrations();
    const toRollback = executed.slice(-steps).reverse();
    const results: MigrationResult[] = [];

    for (const record of toRollback) {
      const migration = this.migrations.find((m) => m.version === record.version);

      if (!migration) {
        results.push({
          version: record.version,
          name: record.name,
          status: 'failed',
          error: new Error(`Migration ${record.version} not found`),
        });
        continue;
      }

      try {
        await migration.down(this.context);
        await this.removeMigration(migration);
        results.push({
          version: migration.version,
          name: migration.name,
          status: 'success',
        });
      } catch (error) {
        results.push({
          version: migration.version,
          name: migration.name,
          status: 'failed',
          error: error instanceof Error ? error : new Error(String(error)),
        });
        break;
      }
    }

    return results;
  }

  private async recordMigration(migration: Migration): Promise<void> {
    await this.context.execute(`INSERT INTO ${this.tableName} (version, name) VALUES (?, ?)`, [
      migration.version,
      migration.name,
    ]);
  }

  private async removeMigration(migration: Migration): Promise<void> {
    await this.context.execute(`DELETE FROM ${this.tableName} WHERE version = ?`, [
      migration.version,
    ]);
  }
}
