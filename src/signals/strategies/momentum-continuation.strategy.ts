import type { MarketFeatures, NormalizedMarketData, SignalCandidate } from '../../core/types.js';

export function momentumContinuationStrategy(
  data: NormalizedMarketData,
  features: MarketFeatures
): SignalCandidate | null {
  if (features.trendDirection === 'sideways' || features.trendStrength < 35 || features.volumeRatio < 1.1) return null;

  const price = data.currentPrice;
  const action = features.trendDirection === 'up' ? 'BUY' : 'SELL';
  const stopDistance = Math.max(features.atr * 1.4, price * 0.004);
  const stopLoss = action === 'BUY' ? price - stopDistance : price + stopDistance;
  const tp1 = action === 'BUY' ? price + stopDistance * 1.5 : price - stopDistance * 1.5;
  const tp2 = action === 'BUY' ? price + stopDistance * 2.1 : price - stopDistance * 2.1;

  return {
    symbol: data.symbol,
    timeframe: data.timeframe,
    strategy: 'momentum_continuation',
    action,
    entry: { min: price - features.atr * 0.12, max: price + features.atr * 0.12 },
    stopLoss,
    takeProfits: [tp1, tp2],
    invalidation:
      action === 'BUY'
        ? `${data.timeframe} close below ${stopLoss.toFixed(4)}`
        : `${data.timeframe} close above ${stopLoss.toFixed(4)}`,
    confidence: Math.min(84, 52 + Math.round(features.trendStrength / 2) + Math.round(features.volumeRatio * 5)),
    reasons: [
      `Momentum continuation ${features.trendDirection}`,
      `Trend strength ${features.trendStrength}/100`,
      `Volume ${features.volumeRatio.toFixed(2)}x average`
    ]
  };
}
