import type { MarketFeatures, SignalCandidate } from '../../core/types.js';

export function buildBearCase(signal: SignalCandidate, features: MarketFeatures): string {
  const risks: string[] = [];
  if (features.spreadBps > 10) risks.push('Spread is elevated');
  if (features.volumeRatio < 1.2) risks.push('Volume confirmation is weak');
  if (features.fundingBias === 'long_heavy' && signal.action === 'BUY') risks.push('Funding is long-heavy');
  return risks.join('; ') || 'No major bearish conflict detected.';
}
