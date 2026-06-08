import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export type Db = Database.Database;

let database: Db | null = null;

export function getDb(): Db {
  if (database) return database;

  const dbPath = resolve(env.DATABASE_PATH);
  mkdirSync(dirname(dbPath), { recursive: true });
  database = new Database(dbPath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  return database;
}

export function runMigrations(db = getDb()): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  for (const name of ['001_initial.sql', '002_watchlist_alert_cols.sql']) {
    const applied = db.prepare('SELECT name FROM schema_migrations WHERE name = ?').get(name);
    if (applied) continue;

    const migrationPath = resolve('src/memory/migrations', name);
    if (!existsSync(migrationPath)) throw new Error(`Missing migration: ${migrationPath}`);

    const sql = readFileSync(migrationPath, 'utf8');
    try {
      db.exec(sql);
    } catch (error) {
      if (name !== '002_watchlist_alert_cols.sql' || !isDuplicateColumnError(error)) throw error;
    }
    db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(name);
    logger.info('database_migration_applied', { migrationPath });
  }
}

function isDuplicateColumnError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes('duplicate column name');
}
