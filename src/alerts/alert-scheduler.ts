import { logger } from '../utils/logger.js';
import { WatchlistRunner } from './watchlist-runner.js';

export function startAlertScheduler(intervalMs = 60_000): NodeJS.Timeout {
  const runner = new WatchlistRunner();
  logger.info('alert_scheduler_started', { intervalMs });
  return setInterval(() => {
    void runner.tick();
  }, intervalMs);
}
