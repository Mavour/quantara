import type { MarketFeatures, NormalizedMarketData, SignalCandidate } from '../../core/types.js';

export function breakoutScalpStrategy(data: NormalizedMarketData, features: MarketFeatures): SignalCandidate | null {
  const price = data.currentPrice;
  const isBullBreakout =
    features.trendDirection === 'up' && price > features.nearestResistance * 0.999 && features.volumeRatio >= 1.4;
  const isBearBreakdown =
    features.trendDirection === 'down' && price < features.nearestSupport * 1.001 && features.volumeRatio >= 1.4;

  if (!isBullBreakout && !isBearBreakdown) return null;

  const action = isBullBreakout ? 'BUY' : 'SELL';
  const stopDistance = Math.max(features.atr * 1.2, price * 0.003);
  const entryBuffer = Math.max(features.atr * 0.15, price * 0.0005);
  const stopLoss = action === 'BUY' ? price - stopDistance : price + stopDistance;
  const tp1 = action === 'BUY' ? price + stopDistance * 1.5 : price - stopDistance * 1.5;
  const tp2 = action === 'BUY' ? price + stopDistance * 2.2 : price - stopDistance * 2.2;

  return {
    symbol: data.symbol,
    timeframe: data.timeframe,
    strategy: 'breakout_scalp',
    action,
    entry: { min: price - entryBuffer, max: price + entryBuffer },
    stopLoss,
    takeProfits: [tp1, tp2],
    invalidation:
      action === 'BUY'
        ? `${data.timeframe} close below ${stopLoss.toFixed(4)}`
        : `${data.timeframe} close above ${stopLoss.toFixed(4)}`,
    confidence: Math.min(88, 55 + Math.round(features.volumeRatio * 8) + Math.round(features.trendStrength / 4)),
    reasons: [
      `${action === 'BUY' ? 'Breakout' : 'Breakdown'} near key level`,
      `Volume ${features.volumeRatio.toFixed(2)}x average`,
      `Trend direction ${features.trendDirection}`
    ]
  };
}
