import type { MarketFeatures, SignalCandidate } from '../../core/types.js';
import { riskConfig } from '../../config/risk.js';

export function conflictsWithMarketRegime(signal: SignalCandidate, features: MarketFeatures): boolean {
  return (
    features.trendDirection === 'down' &&
    signal.action === 'BUY' &&
    features.trendStrength > riskConfig.strongTrendThreshold
  );
}
