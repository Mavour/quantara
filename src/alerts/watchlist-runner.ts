import type { Bot } from 'grammy';
import { env } from '../config/env.js';
import { defaultTimeframe } from '../config/markets.js';
import { MarketDataProvider } from '../data/market-data.provider.js';
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
    private readonly alerts = new AlertEngine(bot),
    private readonly marketData = new MarketDataProvider()
  ) {}

  async tick(): Promise<void> {
    const groups = this.watchlists.listScanGroups();
    const discoveryGroups = await this.buildDiscoveryGroups();
    const allGroups = mergeGroups(groups, discoveryGroups);
    logger.info('alert_scan_started', {
      watchlistGroups: groups.length,
      discoveryGroups: discoveryGroups.length,
      users: new Set(allGroups.flatMap((group) => group.entries.map((entry) => entry.userId))).size
    });

    for (const group of allGroups) {
      this.watchlists.updateLastScanned(group.entries.filter((entry) => entry.id > 0).map((entry) => entry.id));
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

  private async buildDiscoveryGroups(): Promise<Array<{ symbol: string; timeframe: string; entries: Array<{ id: number; userId: number }> }>> {
    if (!env.DISCOVERY_ENABLED) return [];

    const users = this.users.listAll();
    if (!users.length) return [];

    const symbols = await this.marketData.discoverTopSymbols(env.DISCOVERY_TOP_SYMBOLS);
    return symbols.map((symbol) => ({
      symbol,
      timeframe: defaultTimeframe,
      entries: users.map((user) => ({ id: 0, userId: user.id }))
    }));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ScanGroup = {
  symbol: string;
  timeframe: string;
  entries: Array<{ id: number; userId: number }>;
};

function mergeGroups(primary: ScanGroup[], secondary: ScanGroup[]): ScanGroup[] {
  const map = new Map<string, ScanGroup>();

  for (const group of [...primary, ...secondary]) {
    const key = `${group.symbol}|${group.timeframe}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...group, entries: [...group.entries] });
      continue;
    }

    const seenUsers = new Set(existing.entries.map((entry) => entry.userId));
    for (const entry of group.entries) {
      if (!seenUsers.has(entry.userId)) existing.entries.push(entry);
    }
  }

  return [...map.values()];
}
