import { describe, expect, it } from 'vitest';
import type { MarketFeatures, NormalizedMarketData } from '../src/core/types.js';
import { SignalEngine } from '../src/signals/signal-engine.js';

describe('SignalEngine', () => {
  it('returns NO_TRADE when no setup matches', () => {
    const candles = Array.from({ length: 60 }, (_, index) => ({
      timestamp: index,
      open: 100,
      high: 101,
      low: 99,
      close: 100,
      volume: 100
    }));
    const data: NormalizedMarketData = {
      symbol: 'SOL/USDT',
      timeframe: '5m',
      candles,
      currentPrice: 100,
      spread: 0.01,
      bidDepth: 100000,
      askDepth: 100000,
      fundingRate: null,
      openInterest: null
    };
    const features: MarketFeatures = {
      trendDirection: 'sideways',
      trendStrength: 5,
      ema20: 100,
      ema50: 100,
      atr: 1,
      volatilityRegime: 'medium',
      volumeRatio: 1,
      nearestSupport: 95,
      nearestResistance: 105,
      candlePattern: null,
      spreadBps: 1,
      liquidityScore: 90,
      fundingBias: 'neutral'
    };
    expect(new SignalEngine().generate(data, features).action).toBe('NO_TRADE');
  });
});
