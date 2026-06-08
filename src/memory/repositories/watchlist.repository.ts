import type { Db } from '../db.js';
import { getDb } from '../db.js';

export interface WatchlistEntry {
  id: number;
  userId: number;
  symbol: string;
  mode: string;
  timeframe: string;
  enabled: boolean;
  lastScannedAt: string | null;
  lastAlertedAt: string | null;
}

interface WatchlistRow {
  id: number;
  user_id: number;
  symbol: string;
  mode: string;
  timeframe: string;
  enabled: number;
  last_scanned_at: string | null;
  last_alerted_at: string | null;
}

export class WatchlistRepository {
  constructor(private readonly db: Db = getDb()) {}

  upsert(userId: number, symbol: string, mode = 'scan', timeframe = '5m'): number {
    const existing = this.db
      .prepare('SELECT id FROM watchlists WHERE user_id = ? AND symbol = ? AND timeframe = ?')
      .get(userId, symbol, timeframe) as { id: number } | undefined;

    if (existing) {
      this.db
        .prepare('UPDATE watchlists SET enabled = 1, mode = ? WHERE id = ?')
        .run(mode, existing.id);
      return existing.id;
    }

    const result = this.db
      .prepare('INSERT INTO watchlists (user_id, symbol, mode, timeframe) VALUES (?, ?, ?, ?)')
      .run(userId, symbol, mode, timeframe);
    return Number(result.lastInsertRowid);
  }

  add(userId: number, symbol: string, mode = 'scan', timeframe = '5m'): number {
    return this.upsert(userId, symbol, mode, timeframe);
  }

  listEnabled(): WatchlistEntry[] {
    const rows = this.db.prepare('SELECT * FROM watchlists WHERE enabled = 1').all() as WatchlistRow[];
    return rows.map(mapRow);
  }

  listEnabledForUser(userId: number): WatchlistEntry[] {
    const rows = this.db.prepare('SELECT * FROM watchlists WHERE user_id = ? AND enabled = 1').all(userId) as WatchlistRow[];
    return rows.map(mapRow);
  }

  listScanGroups(): Array<{ symbol: string; timeframe: string; entries: WatchlistEntry[] }> {
    const entries = this.listEnabled();
    const groups = new Map<string, WatchlistEntry[]>();
    for (const entry of entries) {
      const key = `${entry.symbol}|${entry.timeframe}`;
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }

    return [...groups.entries()].map(([key, value]) => {
      const [symbol, timeframe] = key.split('|');
      if (!symbol || !timeframe) throw new Error(`Invalid watchlist group key: ${key}`);
      return { symbol, timeframe, entries: value };
    });
  }

  disable(userId: number, symbol: string): number {
    const result = this.db
      .prepare('UPDATE watchlists SET enabled = 0 WHERE user_id = ? AND symbol = ?')
      .run(userId, symbol);
    return result.changes;
  }

  updateLastScanned(ids: number[]): void {
    if (!ids.length) return;
    const stmt = this.db.prepare("UPDATE watchlists SET last_scanned_at = datetime('now') WHERE id = ?");
    const update = this.db.transaction((watchlistIds: number[]) => {
      watchlistIds.forEach((id) => stmt.run(id));
    });
    update(ids);
  }

  updateLastAlerted(id: number): void {
    this.db.prepare("UPDATE watchlists SET last_alerted_at = datetime('now') WHERE id = ?").run(id);
  }
}

function mapRow(row: WatchlistRow): WatchlistEntry {
  return {
      id: row.id,
      userId: row.user_id,
      symbol: row.symbol,
      mode: row.mode,
      timeframe: row.timeframe,
      enabled: row.enabled === 1,
      lastScannedAt: row.last_scanned_at,
      lastAlertedAt: row.last_alerted_at
  };
}
