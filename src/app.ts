import { env } from './config/env.js';
import { runMigrations } from './memory/db.js';
import { createBot } from './telegram/bot.js';
import { logger } from './utils/logger.js';

runMigrations();

if (!env.TELEGRAM_BOT_TOKEN) {
  logger.warn('telegram_token_missing', { message: 'Run CLI with npm run cli -- scan SOLUSDT 5m, or set TELEGRAM_BOT_TOKEN.' });
} else {
  const bot = createBot();
  logger.info('telegram_bot_starting');
  bot.start();
}
