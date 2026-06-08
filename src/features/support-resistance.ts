import type { RawCandle } from '../core/types.js';

export interface SupportResistanceResult {
  nearestSupport: number;
  nearestResistance: number;
}

export function calculateSupportResistance(candles: RawCandle[], lookback = 40): SupportResistanceResult {
  const current = candles.at(-1)?.close ?? 0;
  const window = candles.slice(-lookback);
  const lows = window.map((candle) => candle.low).filter((price) => price < current);
  const highs = window.map((candle) => candle.high).filter((price) => price > current);

  return {
    nearestSupport: lows.length ? Math.max(...lows) : Math.min(...window.map((candle) => candle.low)),
    nearestResistance: highs.length ? Math.min(...highs) : Math.max(...window.map((candle) => candle.high))
  };
}
