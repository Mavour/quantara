import type { RiskResult } from '../../core/types.js';

export function summarizeRisk(risk: RiskResult): string {
  if (!risk.passed) return `Risk veto: ${risk.vetoReasons.join('; ')}`;
  return `Risk passed with R:R ${risk.riskReward}, level ${risk.riskLevel}, size ${risk.positionSizePercent}% max risk.`;
}
