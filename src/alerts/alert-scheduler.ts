import { logger } from '../utils/logger.js';
import { WatchlistRunner } from './watchlist-runner.js';
import type { Bot } from 'grammy';
import type { QuantaraContext } from '../telegram/middleware/context.middleware.js';

export function startAlertScheduler(bot: Bot<QuantaraContext>, intervalMs = 60_000): NodeJS.Timeout {
  const runner = new WatchlistRunner(bot);
  logger.info('alert_scheduler_started', { intervalMs });

  const initialScan = setTimeout(() => {
    void runner.tick();
  }, 5_000);

  const interval = setInterval(() => {
    void runner.tick();
  }, intervalMs);

  const stop = () => {
    clearTimeout(initialScan);
    clearInterval(interval);
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  return interval;
}
