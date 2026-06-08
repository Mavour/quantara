import type { Bot } from 'grammy';
import { supportedSymbols } from '../../config/markets.js';
import { UserSettingsRepository } from '../../memory/repositories/user-settings.repository.js';
import { WatchlistRepository } from '../../memory/repositories/watchlist.repository.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerStartCommand(bot: Bot<QuantaraContext>): void {
  bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const user = new UserSettingsRepository().getOrCreate(chatId);
    const watchlists = new WatchlistRepository();
    supportedSymbols.forEach((symbol) => watchlists.upsert(user.id, symbol, 'scan', user.defaultTimeframe));

    await ctx.reply(
      [
        'Quantara is running.',
        '',
        'Auto mode is ON.',
        `Monitoring by default: ${supportedSymbols.join(', ')}`,
        `Timeframe: ${user.defaultTimeframe}`,
        '',
        'Commands:',
        '- /scan SOL',
        '- /scalp SOLUSDT',
        '- /risk 1000 2',
        '- /watch BTC ETH SOL',
        '- /watchlist',
        '- /unwatch SOL',
        '- /settings'
      ].join('\n')
    );
  });
}
