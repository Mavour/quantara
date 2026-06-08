import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
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
  const migrationPath = resolve('src/memory/migrations/001_initial.sql');
  const sql = readFileSync(migrationPath, 'utf8');
  db.exec(sql);
  logger.info('database_migrated', { migrationPath });
}
