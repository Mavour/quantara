import type { Context, MiddlewareFn } from 'grammy';
import { env } from '../../config/env.js';

export function authMiddleware(): MiddlewareFn<Context> {
  const allowed = env.TELEGRAM_ALLOWED_CHAT_IDS.split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  return async (ctx, next) => {
    if (!allowed.length) return next();
    const chatId = ctx.chat?.id.toString();
    if (!chatId || !allowed.includes(chatId)) {
      await ctx.reply('Quantara access denied.');
      return;
    }
    return next();
  };
}
