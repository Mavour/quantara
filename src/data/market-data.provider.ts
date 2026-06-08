import type { NormalizedMarketData } from '../core/types.js';
import { BinanceAdapter } from './adapters/binance.adapter.js';

export class MarketDataProvider {
  constructor(private readonly binance = new BinanceAdapter()) {}

  fetch(symbol: string, timeframe: string): Promise<NormalizedMarketData> {
    return this.binance.fetchMarketData(symbol, timeframe);
  }

  async fetchCurrentPrice(symbol: string): Promise<number> {
    const data = await this.fetch(symbol, '1m');
    return data.currentPrice;
  }

  discoverTopSymbols(limit: number): Promise<string[]> {
    return this.binance.fetchTopUsdtSymbols(limit);
  }
}
