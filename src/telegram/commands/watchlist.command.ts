import type { Bot } from 'grammy';
import { env } from '../../config/env.js';
import { UserSettingsRepository } from '../../memory/repositories/user-settings.repository.js';
import { WatchlistRepository } from '../../memory/repositories/watchlist.repository.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerWatchlistCommand(bot: Bot<QuantaraContext>): void {
  bot.command('watchlist', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const user = new UserSettingsRepository().getOrCreate(chatId);
    const entries = new WatchlistRepository().listEnabledForUser(user.id);

    if (!entries.length) {
      await ctx.reply('Your watchlist is empty. Add symbols with /watch BTC ETH SOL.');
      return;
    }

    await ctx.reply(
      [
        'Your Watchlist',
        '',
        ...entries.map((entry) => `- ${entry.symbol} · ${entry.timeframe} active`),
        '',
        `Scan interval: every ${env.ALERT_SCAN_INTERVAL_MINUTES} minutes.`
      ].join('\n')
    );
  });
}
