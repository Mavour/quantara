import type { Bot } from 'grammy';
import { UserSettingsRepository } from '../../memory/repositories/user-settings.repository.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerSettingsCommand(bot: Bot<QuantaraContext>): void {
  bot.command('settings', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const [key, value] = (ctx.match ?? '').trim().split(/\s+/);
    const repo = new UserSettingsRepository();
    if (key === 'risk' && value) {
      const updated = repo.updateRisk(chatId, Number(value));
      await ctx.reply(`Risk updated: ${updated.riskPerTrade}%`);
      return;
    }
    const settings = repo.getOrCreate(chatId);
    await ctx.reply(
      [`Quantara Settings`, '', `Risk per trade: ${settings.riskPerTrade}%`, `Timeframe: ${settings.defaultTimeframe}`].join(
        '\n'
      )
    );
  });
}
