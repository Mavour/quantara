import { riskConfig } from '../config/risk.js';
import type { DecisionStatus, RiskResult, SignalCandidate } from './types.js';

export function decideStatus(signal: SignalCandidate, risk: RiskResult): DecisionStatus {
  if (signal.action === 'NO_TRADE' || !risk.passed) return 'NO_TRADE';
  if (signal.confidence >= riskConfig.minConfidence && signal.confidence < riskConfig.fullTradeConfidence) {
    return 'WAIT_CONFIRMATION';
  }
  return 'TRADE_VALID';
}
