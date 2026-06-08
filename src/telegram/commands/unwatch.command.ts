import type { Bot } from 'grammy';
import { normalizeSymbol } from '../../data/normalizers/symbol.normalizer.js';
import { UserSettingsRepository } from '../../memory/repositories/user-settings.repository.js';
import { WatchlistRepository } from '../../memory/repositories/watchlist.repository.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerUnwatchCommand(bot: Bot<QuantaraContext>): void {
  bot.command('unwatch', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const symbolInput = (ctx.match ?? '').trim().split(/\s+/)[0];
    if (!symbolInput) {
      await ctx.reply('Usage: /unwatch SOL');
      return;
    }

    const user = new UserSettingsRepository().getOrCreate(chatId);
    const symbol = normalizeSymbol(symbolInput);
    const changes = new WatchlistRepository().disable(user.id, symbol);
    await ctx.reply(changes > 0 ? `${symbol} removed from watchlist.` : `${symbol} was not active in your watchlist.`);
  });
}
