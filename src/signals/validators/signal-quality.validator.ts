import type { SignalCandidate } from '../../core/types.js';
import { riskConfig } from '../../config/risk.js';

export function hasMinimumSignalQuality(signal: SignalCandidate): boolean {
  return signal.confidence >= riskConfig.minConfidence && signal.action !== 'NO_TRADE';
}
