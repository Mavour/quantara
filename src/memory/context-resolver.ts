import { riskConfig } from '../config/risk.js';
import type { ResolvedContext } from '../core/types.js';
import { MarketDataProvider } from '../data/market-data.provider.js';
import { isOlderThanHours } from '../utils/time.js';
import { SignalSnapshotRepository } from './repositories/signal-snapshot.repository.js';
import { TelegramMessageRepository } from './repositories/telegram-message.repository.js';

interface TelegramMessageLookup {
  findByBotMessageId(telegramChatId: string, botMessageId: number): { contextId: number | null } | null;
}

interface SignalSnapshotLookup {
  findById(id: number): ReturnType<SignalSnapshotRepository['findById']>;
  markInvalidated(id: number): void;
}

interface CurrentPriceProvider {
  fetchCurrentPrice(symbol: string): Promise<number>;
}

export class ContextResolver {
  constructor(
    private readonly messages: TelegramMessageLookup = new TelegramMessageRepository(),
    private readonly snapshots: SignalSnapshotLookup = new SignalSnapshotRepository(),
    private readonly marketData: CurrentPriceProvider = new MarketDataProvider()
  ) {}

  async resolveContext(chatId: string, replyToMessageId: number): Promise<ResolvedContext | null> {
    const message = this.messages.findByBotMessageId(chatId, replyToMessageId);
    if (!message?.contextId) return null;

    const snapshot = this.snapshots.findById(message.contextId);
    if (!snapshot) return null;

    const currentPrice = await this.marketData.fetchCurrentPrice(snapshot.symbol);
    const isStale = isOlderThanHours(snapshot.createdAt, riskConfig.staleSignalHours);
    const stopLossHit =
      snapshot.stopLoss !== null &&
      ((snapshot.action === 'BUY' && currentPrice <= snapshot.stopLoss) ||
        (snapshot.action === 'SELL' && currentPrice >= snapshot.stopLoss));

    const status = isStale || stopLossHit || snapshot.status === 'INVALIDATED' ? 'INVALIDATED' : 'TRADE_VALID';
    if (status === 'INVALIDATED' && snapshot.status !== 'INVALIDATED') this.snapshots.markInvalidated(snapshot.id);

    return { snapshot, currentPrice, isStale, status };
  }
}
