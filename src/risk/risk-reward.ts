import type { SignalCandidate } from '../core/types.js';

export function calculateRiskReward(signal: SignalCandidate): number {
  const entry = (signal.entry.min + signal.entry.max) / 2;
  const firstTarget = signal.takeProfits[0];
  if (!firstTarget || !signal.stopLoss || signal.action === 'NO_TRADE') return 0;

  const risk = Math.abs(entry - signal.stopLoss);
  const reward = Math.abs(firstTarget - entry);
  return risk === 0 ? 0 : reward / risk;
}
