import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { WatchlistRepository } from '../src/memory/repositories/watchlist.repository.js';

function createMemoryDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE watchlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'scan',
      timeframe TEXT NOT NULL DEFAULT '5m',
      enabled INTEGER NOT NULL DEFAULT 1,
      last_scanned_at TEXT,
      last_alerted_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

describe('WatchlistRepository', () => {
  it('upserts, lists, and disables entries', () => {
    const repo = new WatchlistRepository(createMemoryDb());
    const firstId = repo.upsert(1, 'SOL/USDT');
    const secondId = repo.upsert(1, 'SOL/USDT');
    expect(secondId).toBe(firstId);
    expect(repo.listEnabledForUser(1)).toHaveLength(1);
    expect(repo.disable(1, 'SOL/USDT')).toBe(1);
    expect(repo.listEnabledForUser(1)).toHaveLength(0);
  });
});
