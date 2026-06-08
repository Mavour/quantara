import { EMA } from 'technicalindicators';
import type { RawCandle } from '../core/types.js';

export interface TrendResult {
  ema20: number;
  ema50: number;
  trendDirection: 'up' | 'down' | 'sideways';
  trendStrength: number;
}

export function calculateTrend(candles: RawCandle[]): TrendResult {
  const closes = candles.map((candle) => candle.close);
  const ema20 = EMA.calculate({ period: 20, values: closes }).at(-1) ?? closes.at(-1) ?? 0;
  const ema50 = EMA.calculate({ period: 50, values: closes }).at(-1) ?? closes.at(-1) ?? 0;
  const price = closes.at(-1) ?? 0;
  const spreadPercent = price ? Math.abs(ema20 - ema50) / price : 0;
  const trendStrength = Math.min(100, Math.round(spreadPercent * 5000));

  if (trendStrength < 10) {
    return { ema20, ema50, trendDirection: 'sideways', trendStrength };
  }

  return {
    ema20,
    ema50,
    trendDirection: ema20 > ema50 ? 'up' : 'down',
    trendStrength
  };
}
