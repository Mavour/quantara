import type { MarketFeatures } from '../../core/types.js';

export function summarizeMarket(features: MarketFeatures): string {
  return `Trend ${features.trendDirection} (${features.trendStrength}/100), volume ${features.volumeRatio.toFixed(
    2
  )}x, volatility ${features.volatilityRegime}, liquidity ${features.liquidityScore}/100.`;
}
