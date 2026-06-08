import type { Bot } from 'grammy';
import { Quantara } from '../../core/quantara.js';
import { SignalSnapshotRepository } from '../../memory/repositories/signal-snapshot.repository.js';
import { TelegramMessageRepository } from '../../memory/repositories/telegram-message.repository.js';
import { UserSettingsRepository } from '../../memory/repositories/user-settings.repository.js';
import { formatError } from '../formatters/error.formatter.js';
import { formatNoTrade } from '../formatters/no-trade.formatter.js';
import { formatSignal } from '../formatters/signal.formatter.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerScanCommand(bot: Bot<QuantaraContext>, mode: 'scan' | 'scalp' = 'scan'): void {
  bot.command(mode, async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const symbol = ctx.match?.trim().split(/\s+/)[0] || 'SOL';
    const settings = new UserSettingsRepository().getOrCreate(chatId);

    try {
      const result = await new Quantara().analyze({
        symbol,
        timeframe: settings.defaultTimeframe,
        mode,
        telegramChatId: chatId,
        riskPercent: settings.riskPerTrade
      });
      const text =
        result.decision.status === 'TRADE_VALID' ? formatSignal(result.decision) : formatNoTrade(result.decision);
      const sent = await ctx.reply(text);
      const snapshotId = new SignalSnapshotRepository().create({
        telegramChatId: chatId,
        decision: result.decision,
        marketData: result.marketData,
        features: result.features,
        reasoning: result.reasoning
      });
      new TelegramMessageRepository().insert({
        telegramChatId: chatId,
        telegramMessageId: ctx.message?.message_id ?? sent.message_id,
        botMessageId: sent.message_id,
        direction: 'outbound',
        text,
        contextType: 'signal',
        contextId: snapshotId
      });
    } catch (error) {
      await ctx.reply(formatError(error));
    }
  });
}
