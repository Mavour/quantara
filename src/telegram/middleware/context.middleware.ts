import type { Context, MiddlewareFn } from 'grammy';
import { ContextResolver } from '../../memory/context-resolver.js';

export interface QuantaraContext extends Context {
  quantaraResolvedContext?: Awaited<ReturnType<ContextResolver['resolveContext']>>;
}

export function contextMiddleware(resolver = new ContextResolver()): MiddlewareFn<QuantaraContext> {
  return async (ctx, next) => {
    const chatId = ctx.chat?.id.toString();
    const replyTo = ctx.message?.reply_to_message?.message_id;
    if (chatId && replyTo) {
      ctx.quantaraResolvedContext = await resolver.resolveContext(chatId, replyTo);
    }
    return next();
  };
}
