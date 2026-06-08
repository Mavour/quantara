import type { MarketFeatures, SignalCandidate } from '../../core/types.js';

export function buildBullCase(signal: SignalCandidate, features: MarketFeatures): string {
  const points = signal.reasons.filter(Boolean);
  if (features.fundingBias === 'short_heavy' && signal.action === 'BUY') points.push('Short-heavy funding can support squeeze');
  return points.join('; ') || 'No strong bullish case.';
}
