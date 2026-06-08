import ccxt from 'ccxt';
import { defaultCandleLimit } from '../../config/markets.js';
import { env } from '../../config/env.js';
import type { NormalizedMarketData } from '../../core/types.js';
import { normalizeCandles } from '../normalizers/candle.normalizer.js';
import { toCcxtSymbol } from '../normalizers/symbol.normalizer.js';

export class BinanceAdapter {
  private readonly exchange = new ccxt.binanceusdm({
    apiKey: env.BINANCE_API_KEY || undefined,
    secret: env.BINANCE_API_SECRET || undefined,
    enableRateLimit: true,
    timeout: 30_000
  });

  async fetchMarketData(symbolInput: string, timeframe: string, limit = defaultCandleLimit): Promise<NormalizedMarketData> {
    const symbol = toCcxtSymbol(symbolInput);
    const [ohlcv, orderBook, fundingRate] = await Promise.all([
      this.exchange.fetchOHLCV(symbol, timeframe, undefined, limit),
      this.exchange.fetchOrderBook(symbol, 50),
      this.fetchFundingRateSafe(symbol)
    ]);

    const candles = normalizeCandles(ohlcv as number[][]);
    const last = candles.at(-1);
    if (!last) throw new Error(`No candles returned for ${symbol}`);

    const bestBid = orderBook.bids[0]?.[0] ?? last.close;
    const bestAsk = orderBook.asks[0]?.[0] ?? last.close;
    const currentPrice = last.close;
    const spread = Math.max(bestAsk - bestBid, 0);
    const lower = currentPrice * 0.995;
    const upper = currentPrice * 1.005;
    const bidDepth = orderBook.bids
      .filter(([price]) => typeof price === 'number' && price >= lower)
      .reduce((sum, [price = 0, amount = 0]) => sum + price * amount, 0);
    const askDepth = orderBook.asks
      .filter(([price]) => typeof price === 'number' && price <= upper)
      .reduce((sum, [price = 0, amount = 0]) => sum + price * amount, 0);

    return {
      symbol,
      timeframe,
      candles,
      currentPrice,
      spread,
      bidDepth,
      askDepth,
      fundingRate,
      openInterest: null
    };
  }

  private async fetchFundingRateSafe(symbol: string): Promise<number | null> {
    try {
      const rate = await this.exchange.fetchFundingRate(symbol);
      return typeof rate.fundingRate === 'number' ? rate.fundingRate : null;
    } catch {
      return null;
    }
  }
}
