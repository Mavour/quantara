import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  TELEGRAM_ALLOWED_CHAT_IDS: z.string().optional().default(''),
  GENERALCOMPUTE_BASE_URL: z.string().url().default('https://app.generalcompute.com/v1'),
  GENERALCOMPUTE_API_KEY: z.string().optional().default(''),
  GENERALCOMPUTE_MODEL: z.string().default('deepseek-v3.1'),
  BINANCE_API_KEY: z.string().optional().default(''),
  BINANCE_API_SECRET: z.string().optional().default(''),
  DATABASE_PATH: z.string().default('./data/quantara.db'),
  DEFAULT_RISK_PERCENT: z.coerce.number().positive().max(100).default(1),
  MAX_CONCURRENT_SIGNALS: z.coerce.number().int().positive().default(2),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ALERT_SCAN_INTERVAL_MINUTES: z.coerce.number().int().positive().default(5),
  ALERT_DEDUP_WINDOW_MINUTES: z.coerce.number().int().positive().default(30),
  ALERT_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((value) => value.toLowerCase() === 'true'),
  ALERT_NOTIFY_WAIT_CONFIRMATION: z
    .string()
    .optional()
    .default('true')
    .transform((value) => value.toLowerCase() === 'true'),
  DISCOVERY_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((value) => value.toLowerCase() === 'true'),
  DISCOVERY_TOP_SYMBOLS: z.coerce.number().int().positive().max(100).default(25)
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
