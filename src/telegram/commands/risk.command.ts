import type { Bot } from 'grammy';
import { formatRisk } from '../formatters/risk.formatter.js';
import type { QuantaraContext } from '../middleware/context.middleware.js';

export function registerRiskCommand(bot: Bot<QuantaraContext>): void {
  bot.command('risk', async (ctx) => {
    const [capitalRaw, riskRaw, entryRaw, stopRaw] = (ctx.match ?? '').trim().split(/\s+/);
    const capital = Number(capitalRaw);
    const risk = Number(riskRaw);
    if (!Number.isFinite(capital) || !Number.isFinite(risk)) {
      await ctx.reply('Usage: /risk 1000 2 [entry] [stopLoss]');
      return;
    }
    await ctx.reply(formatRisk(capital, risk, Number(entryRaw) || undefined, Number(stopRaw) || undefined));
  });
}
