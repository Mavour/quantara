import type { Bot } from 'grammy';
import { WatchlistRepository } from '../memory/repositories/watchlist.repository.js';
import { UserSettingsRepository } from '../memory/repositories/user-settings.repository.js';
import type { QuantaraContext } from '../telegram/middleware/context.middleware.js';
import { logger } from '../utils/logger.js';
import { AlertEngine } from './alert-engine.js';

export class WatchlistRunner {
  constructor(
    private readonly bot: Bot<QuantaraContext>,
    private readonly watchlists = new WatchlistRepository(),
    private readonly users = new UserSettingsRepository(),
    private readonly alerts = new AlertEngine(bot)
  ) {}

  async tick(): Promise<void> {
    const groups = this.watchlists.listScanGroups();
    logger.info('alert_scan_started', {
      groups: groups.length,
      users: new Set(groups.flatMap((group) => group.entries.map((entry) => entry.userId))).size
    });

    for (const group of groups) {
      this.watchlists.updateLastScanned(group.entries.map((entry) => entry.id));
      await delay(2_000);

      for (const entry of group.entries) {
        const user = this.users.findById(entry.userId);
        if (!user) continue;

      try {
          await this.alerts.runAlertScan(group.symbol, group.timeframe, user.telegramChatId, entry.id);
      } catch (error) {
          logger.warn('watchlist_scan_failed', {
            symbol: group.symbol,
            timeframe: group.timeframe,
            userId: entry.userId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
