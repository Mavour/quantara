import type { Db } from '../db.js';
import { getDb } from '../db.js';

export class TradeJournalRepository {
  constructor(private readonly db: Db = getDb()) {}

  recordDecision(params: {
    userId: number;
    signalSnapshotId: number;
    userDecision: 'took' | 'skipped' | 'partial';
    notes?: string;
  }): number {
    const result = this.db
      .prepare(
        `INSERT INTO trade_journal (user_id, signal_snapshot_id, user_decision, notes)
         VALUES (?, ?, ?, ?)`
      )
      .run(params.userId, params.signalSnapshotId, params.userDecision, params.notes ?? null);
    return Number(result.lastInsertRowid);
  }
}
