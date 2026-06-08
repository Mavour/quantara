import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  TELEGRAM_ALLOWED_CHAT_IDS: z.string().optional().default(''),
  GENERALCOMPUTE_BASE_URL: z.string().url().default('https://app.generalcompute.com/v1'),
  GENERALCOMPUTE_API_KEY: z.string().optional().default(''),
  BINANCE_API_KEY: z.string().optional().default(''),
  BINANCE_API_SECRET: z.string().optional().default(''),
  DATABASE_PATH: z.string().default('./data/quantara.db'),
  DEFAULT_RISK_PERCENT: z.coerce.number().positive().max(100).default(1),
  MAX_CONCURRENT_SIGNALS: z.coerce.number().int().positive().default(2),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
});

export const env = envSchema.parse(process.env);

export function requireTelegramToken(): string {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is required to start the Telegram bot');
  }

  return env.TELEGRAM_BOT_TOKEN;
}

export function requireDeepSeekApiKey(): string {
  if (!env.GENERALCOMPUTE_API_KEY) {
    throw new Error('GENERALCOMPUTE_API_KEY is required for DeepSeek narrative generation');
  }

  return env.GENERALCOMPUTE_API_KEY;
}
