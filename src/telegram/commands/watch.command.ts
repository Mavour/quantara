import type { Bot } from 'grammy';
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
    added.forEach((symbol) => repo.add(user.id, symbol, 'scan', user.defaultTimeframe));
    await ctx.reply(`Watchlist updated: ${added.join(', ')}`);
  });
}
