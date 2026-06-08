import { WatchlistRepository } from '../memory/repositories/watchlist.repository.js';
import { logger } from '../utils/logger.js';
import { AlertEngine } from './alert-engine.js';

export class WatchlistRunner {
  constructor(
    private readonly watchlists = new WatchlistRepository(),
    private readonly alerts = new AlertEngine()
  ) {}

  async tick(): Promise<void> {
    for (const entry of this.watchlists.listEnabled()) {
      try {
        await this.alerts.scan(entry.symbol, entry.timeframe, String(entry.userId));
      } catch (error) {
        logger.warn('watchlist_scan_failed', { entry, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }
}
