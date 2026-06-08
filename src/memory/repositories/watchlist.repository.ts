import type { Db } from '../db.js';
import { getDb } from '../db.js';

export interface WatchlistEntry {
  id: number;
  userId: number;
  symbol: string;
  mode: string;
  timeframe: string;
  enabled: boolean;
}

interface WatchlistRow {
  id: number;
  user_id: number;
  symbol: string;
  mode: string;
  timeframe: string;
  enabled: number;
}

export class WatchlistRepository {
  constructor(private readonly db: Db = getDb()) {}

  add(userId: number, symbol: string, mode = 'scan', timeframe = '5m'): number {
    const result = this.db
      .prepare('INSERT INTO watchlists (user_id, symbol, mode, timeframe) VALUES (?, ?, ?, ?)')
      .run(userId, symbol, mode, timeframe);
    return Number(result.lastInsertRowid);
  }

  listEnabled(): WatchlistEntry[] {
    const rows = this.db.prepare('SELECT * FROM watchlists WHERE enabled = 1').all() as WatchlistRow[];
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      symbol: row.symbol,
      mode: row.mode,
      timeframe: row.timeframe,
      enabled: row.enabled === 1
    }));
  }
}
