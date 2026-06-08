import type { MarketFeatures, NormalizedMarketData, SignalCandidate } from '../../core/types.js';

export function meanReversionStrategy(data: NormalizedMarketData, features: MarketFeatures): SignalCandidate | null {
  if (features.volatilityRegime === 'high' || features.trendStrength > 55) return null;

  const price = data.currentPrice;
  const nearSupport = price <= features.nearestSupport + features.atr * 0.5;
  const nearResistance = price >= features.nearestResistance - features.atr * 0.5;
  if (!nearSupport && !nearResistance) return null;

  const action = nearSupport ? 'BUY' : 'SELL';
  const stopDistance = Math.max(features.atr, price * 0.0035);
  const stopLoss = action === 'BUY' ? price - stopDistance : price + stopDistance;
  const tp1 = action === 'BUY' ? price + stopDistance * 1.5 : price - stopDistance * 1.5;
  const tp2 = action === 'BUY' ? price + stopDistance * 2.0 : price - stopDistance * 2.0;

  return {
    symbol: data.symbol,
    timeframe: data.timeframe,
    strategy: 'mean_reversion',
    action,
    entry: { min: price - features.atr * 0.1, max: price + features.atr * 0.1 },
    stopLoss,
    takeProfits: [tp1, tp2],
    invalidation:
      action === 'BUY'
        ? `${data.timeframe} close below ${stopLoss.toFixed(4)}`
        : `${data.timeframe} close above ${stopLoss.toFixed(4)}`,
    confidence: Math.min(78, 58 + Math.round((features.liquidityScore + features.volumeRatio * 10) / 5)),
    reasons: [
      `Price near ${nearSupport ? 'support' : 'resistance'}`,
      `Volatility regime ${features.volatilityRegime}`,
      'Trend not strongly directional'
    ]
  };
}
