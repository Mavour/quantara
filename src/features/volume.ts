import type { RawCandle } from '../core/types.js';

export function calculateVolumeRatio(candles: RawCandle[], period = 20): number {
  const recent = candles.slice(-period - 1, -1);
  const current = candles.at(-1)?.volume ?? 0;
  const average = recent.length ? recent.reduce((sum, candle) => sum + candle.volume, 0) / recent.length : current;
  return average ? current / average : 0;
}
