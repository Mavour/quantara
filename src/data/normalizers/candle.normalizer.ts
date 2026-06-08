import type { RawCandle } from '../../core/types.js';

export function normalizeCandle(raw: number[]): RawCandle {
  const [timestamp, open, high, low, close, volume] = raw;
  if (
    timestamp === undefined ||
    open === undefined ||
    high === undefined ||
    low === undefined ||
    close === undefined ||
    volume === undefined
  ) {
    throw new Error('Invalid OHLCV candle from exchange');
  }

  return { timestamp, open, high, low, close, volume };
}

export function normalizeCandles(raw: number[][]): RawCandle[] {
  return raw.map(normalizeCandle);
}
