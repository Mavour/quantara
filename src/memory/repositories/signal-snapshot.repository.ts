import type { MarketFeatures, NormalizedMarketData, QuantaraDecision, SignalSnapshot } from '../../core/types.js';
import type { Db } from '../db.js';
import { getDb } from '../db.js';

interface SignalSnapshotRow {
  id: number;
  telegram_chat_id: string;
  symbol: string;
  timeframe: string;
  strategy: string;
  action: string;
  entry_min: number | null;
  entry_max: number | null;
  stop_loss: number | null;
  take_profit_json: string | null;
  invalidation: string | null;
  confidence: number | null;
  risk_reward: number | null;
  risk_level: string | null;
  status: 'ACTIVE' | 'INVALIDATED' | 'CLOSED';
  market_data_json: string | null;
  features_json: string | null;
  reasoning_json: string | null;
  created_at: string;
}

function mapRow(row: SignalSnapshotRow): SignalSnapshot {
  return {
    id: row.id,
    telegramChatId: row.telegram_chat_id,
    symbol: row.symbol,
    timeframe: row.timeframe,
    strategy: row.strategy,
    action: row.action,
    entryMin: row.entry_min,
    entryMax: row.entry_max,
    stopLoss: row.stop_loss,
    takeProfits: row.take_profit_json ? (JSON.parse(row.take_profit_json) as number[]) : [],
    invalidation: row.invalidation,
    confidence: row.confidence,
    riskReward: row.risk_reward,
    riskLevel: row.risk_level,
    status: row.status,
    marketDataJson: row.market_data_json,
    featuresJson: row.features_json,
    reasoningJson: row.reasoning_json,
    createdAt: row.created_at
  };
}

export class SignalSnapshotRepository {
  constructor(private readonly db: Db = getDb()) {}

  create(params: {
    telegramChatId: string;
    decision: QuantaraDecision;
    marketData: NormalizedMarketData;
    features: MarketFeatures;
    reasoning: Record<string, string>;
  }): number {
    const { signal, risk } = params.decision;
    const result = this.db
      .prepare(
        `INSERT INTO signal_snapshots
          (telegram_chat_id, symbol, timeframe, strategy, action, entry_min, entry_max, stop_loss,
           take_profit_json, invalidation, confidence, risk_reward, risk_level, status,
           market_data_json, features_json, reasoning_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        params.telegramChatId,
        signal.symbol,
        signal.timeframe,
        signal.strategy,
        signal.action,
        signal.entry.min,
        signal.entry.max,
        signal.stopLoss,
        JSON.stringify(signal.takeProfits),
        signal.invalidation,
        signal.confidence,
        risk.riskReward,
        risk.riskLevel,
        params.decision.status === 'NO_TRADE' ? 'CLOSED' : 'ACTIVE',
        JSON.stringify(params.marketData),
        JSON.stringify(params.features),
        JSON.stringify(params.reasoning)
      );

    return Number(result.lastInsertRowid);
  }

  findById(id: number): SignalSnapshot | null {
    const row = this.db.prepare('SELECT * FROM signal_snapshots WHERE id = ?').get(id) as SignalSnapshotRow | undefined;
    return row ? mapRow(row) : null;
  }

  countActive(telegramChatId: string): number {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM signal_snapshots WHERE telegram_chat_id = ? AND status = 'ACTIVE'")
      .get(telegramChatId) as { count: number };
    return row.count;
  }

  markInvalidated(id: number): void {
    this.db.prepare("UPDATE signal_snapshots SET status = 'INVALIDATED' WHERE id = ?").run(id);
  }
}
