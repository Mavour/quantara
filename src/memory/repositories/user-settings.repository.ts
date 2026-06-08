import type { Db } from '../db.js';
import { getDb } from '../db.js';

export interface UserSettings {
  id: number;
  telegramChatId: string;
  riskPerTrade: number;
  defaultTimeframe: string;
  preferredExchange: string;
}

interface UserSettingsRow {
  id: number;
  telegram_chat_id: string;
  risk_per_trade: number;
  default_timeframe: string;
  preferred_exchange: string;
}

function mapRow(row: UserSettingsRow): UserSettings {
  return {
    id: row.id,
    telegramChatId: row.telegram_chat_id,
    riskPerTrade: row.risk_per_trade,
    defaultTimeframe: row.default_timeframe,
    preferredExchange: row.preferred_exchange
  };
}

export class UserSettingsRepository {
  constructor(private readonly db: Db = getDb()) {}

  getOrCreate(telegramChatId: string): UserSettings {
    const existing = this.db
      .prepare('SELECT * FROM users WHERE telegram_chat_id = ?')
      .get(telegramChatId) as UserSettingsRow | undefined;
    if (existing) return mapRow(existing);

    this.db.prepare('INSERT INTO users (telegram_chat_id) VALUES (?)').run(telegramChatId);
    const created = this.db
      .prepare('SELECT * FROM users WHERE telegram_chat_id = ?')
      .get(telegramChatId) as UserSettingsRow;
    return mapRow(created);
  }

  updateRisk(telegramChatId: string, riskPerTrade: number): UserSettings {
    this.getOrCreate(telegramChatId);
    this.db
      .prepare("UPDATE users SET risk_per_trade = ?, updated_at = datetime('now') WHERE telegram_chat_id = ?")
      .run(riskPerTrade, telegramChatId);
    return this.getOrCreate(telegramChatId);
  }

  findById(id: number): UserSettings | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserSettingsRow | undefined;
    return row ? mapRow(row) : null;
  }

  listAll(): UserSettings[] {
    const rows = this.db.prepare('SELECT * FROM users').all() as UserSettingsRow[];
    return rows.map(mapRow);
  }
}
