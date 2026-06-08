import type { Bot } from 'grammy';
import { env } from '../config/env.js';
import { Quantara } from '../core/quantara.js';
import { SignalSnapshotRepository } from '../memory/repositories/signal-snapshot.repository.js';
import { TelegramMessageRepository } from '../memory/repositories/telegram-message.repository.js';
import { UserSettingsRepository } from '../memory/repositories/user-settings.repository.js';
import { formatSignal } from '../telegram/formatters/signal.formatter.js';
import type { QuantaraContext } from '../telegram/middleware/context.middleware.js';
import { logger } from '../utils/logger.js';

export class AlertEngine {
  constructor(
    private readonly bot: Bot<QuantaraContext>,
    private readonly quantara = new Quantara(),
    private readonly snapshots = new SignalSnapshotRepository(),
    private readonly messages = new TelegramMessageRepository(),
    private readonly users = new UserSettingsRepository()
  ) {}

  async runAlertScan(symbol: string, timeframe: string, chatId: string, watchlistId: number): Promise<void> {
    const settings = this.users.getOrCreate(chatId);
    const result = await this.quantara.analyze({
      symbol,
      timeframe,
      mode: 'scan',
      telegramChatId: chatId,
      riskPercent: settings.riskPerTrade
    });

    if (result.decision.status !== 'TRADE_VALID') return;

    if (this.snapshots.hasRecentActiveSignal(chatId, result.decision.signal.symbol, env.ALERT_DEDUP_WINDOW_MINUTES)) {
      logger.info('alert_skipped_duplicate', { symbol, chatId, windowMinutes: env.ALERT_DEDUP_WINDOW_MINUTES });
      return;
    }

    const snapshotId = this.snapshots.create({
      telegramChatId: chatId,
      decision: result.decision,
      marketData: result.marketData,
      features: result.features,
      reasoning: result.reasoning
    });

    const text = formatSignal(result.decision, { alert: true });
    const sent = await this.bot.api.sendMessage(chatId, text);
    this.messages.insert({
      telegramChatId: chatId,
      telegramMessageId: sent.message_id,
      botMessageId: sent.message_id,
      direction: 'outbound',
      text,
      contextType: 'signal',
      contextId: snapshotId
    });

    logger.info('alert_sent', { symbol, chatId, watchlistId, status: result.decision.status });
  }
}
