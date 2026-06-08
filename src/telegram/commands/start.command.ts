import type { Bot } from 'grammy';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerStartCommand(bot: Bot<QuantaraContext>): void {
  bot.command('start', async (ctx) => {
    await ctx.reply(
      [
        'Quantara is running.',
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
