import type { Bot } from 'grammy';
import { env } from '../../config/env.js';
import { normalizeSymbol } from '../../data/normalizers/symbol.normalizer.js';
import { UserSettingsRepository } from '../../memory/repositories/user-settings.repository.js';
import { WatchlistRepository } from '../../memory/repositories/watchlist.repository.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerWatchCommand(bot: Bot<QuantaraContext>): void {
  bot.command('watch', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const user = new UserSettingsRepository().getOrCreate(chatId);
    const repo = new WatchlistRepository();
    const symbols = (ctx.match ?? '').trim().split(/\s+/).filter(Boolean);
    if (!symbols.length) {
      await ctx.reply('Usage: /watch BTC ETH SOL');
      return;
    }
    const added = symbols.map(normalizeSymbol);
    added.forEach((symbol) => repo.upsert(user.id, symbol, 'scan', user.defaultTimeframe));
    await ctx.reply(
      [
        'Watchlist updated',
        '',
        'Monitoring:',
        ...added.map((symbol) => `- ${symbol} · ${user.defaultTimeframe}`),
        '',
        "You'll be alerted when a valid setup is found.",
        `Scan interval: every ${env.ALERT_SCAN_INTERVAL_MINUTES} minutes.`,
        '',
        'To remove: /unwatch SOL',
        'To view: /watchlist'
      ].join('\n')
    );
  });
}
