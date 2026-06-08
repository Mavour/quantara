import { ATR } from 'technicalindicators';
import type { RawCandle } from '../core/types.js';

export interface VolatilityResult {
  atr: number;
  volatilityRegime: 'low' | 'medium' | 'high';
}

export function calculateVolatility(candles: RawCandle[]): VolatilityResult {
  const atr = ATR.calculate({
    period: 14,
    high: candles.map((candle) => candle.high),
    low: candles.map((candle) => candle.low),
    close: candles.map((candle) => candle.close)
  }).at(-1) ?? 0;

  const price = candles.at(-1)?.close ?? 0;
  const atrPercent = price ? atr / price : 0;
  const volatilityRegime = atrPercent > 0.015 ? 'high' : atrPercent > 0.006 ? 'medium' : 'low';
  return { atr, volatilityRegime };
}
