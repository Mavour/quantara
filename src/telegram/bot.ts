import { Bot } from 'grammy';
import { requireTelegramToken } from '../config/env.js';
import { registerRiskCommand } from './commands/risk.command.js';
import { registerScanCommand } from './commands/scan.command.js';
import { registerScalpCommand } from './commands/scalp.command.js';
import { registerSettingsCommand } from './commands/settings.command.js';
import { registerUnwatchCommand } from './commands/unwatch.command.js';
import { registerWatchCommand } from './commands/watch.command.js';
import { registerWatchlistCommand } from './commands/watchlist.command.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { contextMiddleware, type QuantaraContext } from './middleware/context.middleware.js';

export function createBot(): Bot<QuantaraContext> {
  const bot = new Bot<QuantaraContext>(requireTelegramToken());
  bot.use(authMiddleware());
  bot.use(contextMiddleware());
  registerScanCommand(bot);
  registerScalpCommand(bot);
  registerRiskCommand(bot);
  registerWatchCommand(bot);
  registerUnwatchCommand(bot);
  registerWatchlistCommand(bot);
  registerSettingsCommand(bot);

  bot.on('message:text', async (ctx) => {
    if (ctx.quantaraResolvedContext) {
      const { snapshot, currentPrice, status, isStale } = ctx.quantaraResolvedContext;
      await ctx.reply(
        [
          `Referensi signal ${snapshot.symbol} ${snapshot.timeframe} dari ${snapshot.createdAt}.`,
          `Status: ${status}`,
          `Current price: ${currentPrice}`,
          isStale ? 'Signal sudah lebih dari 4 jam, jadi dianggap invalid.' : 'Signal belum stale.'
        ].join('\n')
      );
      return;
    }
    if (ctx.message.reply_to_message) {
      await ctx.reply('Reply to a Quantara signal to get context.');
    }
  });

  return bot;
}
