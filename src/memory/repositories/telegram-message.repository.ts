import type { Db } from '../db.js';
import { getDb } from '../db.js';

export class TelegramMessageRepository {
  constructor(private readonly db: Db = getDb()) {}

  insert(params: {
    telegramChatId: string;
    telegramMessageId: number;
    botMessageId?: number | null;
    direction: 'inbound' | 'outbound';
    text?: string | null;
    contextType?: 'signal' | 'followup' | 'command' | null;
    contextId?: number | null;
  }): number {
    const result = this.db
      .prepare(
        `INSERT INTO telegram_messages
          (telegram_chat_id, telegram_message_id, bot_message_id, direction, text, context_type, context_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        params.telegramChatId,
        params.telegramMessageId,
        params.botMessageId ?? null,
        params.direction,
        params.text ?? null,
        params.contextType ?? null,
        params.contextId ?? null
      );

    return Number(result.lastInsertRowid);
  }

  findByBotMessageId(telegramChatId: string, botMessageId: number): { contextId: number | null } | null {
    const row = this.db
      .prepare(
        `SELECT context_id AS contextId
         FROM telegram_messages
         WHERE telegram_chat_id = ? AND bot_message_id = ?
         ORDER BY id DESC
         LIMIT 1`
      )
      .get(telegramChatId, botMessageId) as { contextId: number | null } | undefined;
    return row ?? null;
  }
}
