import type { QuantaraDecision } from '../../core/types.js';
import { formatPrice, round } from '../../utils/number.js';

export function formatSignal(decision: QuantaraDecision): string {
  const { signal, risk } = decision;
  const tp1 = signal.takeProfits[0] ? formatPrice(signal.takeProfits[0]) : '-';
  const tp2 = signal.takeProfits[1] ? formatPrice(signal.takeProfits[1]) : '-';

  return [
    'Quantara Signal',
    '',
    `Asset: ${signal.symbol} · ${signal.timeframe}`,
    `Action: ${signal.action} SCALP`,
    `Status: ${decision.status}`,
    '',
    `Entry:      ${formatPrice(signal.entry.min)} - ${formatPrice(signal.entry.max)}`,
    `Stop Loss:  ${formatPrice(signal.stopLoss)}`,
    `TP1:        ${tp1}`,
    `TP2:        ${tp2}`,
    `R:R:        ${round(risk.riskReward, 2)}`,
    `Confidence: ${signal.confidence}%`,
    `Risk:       ${risk.riskLevel}`,
    '',
    'Reason:',
    ...signal.reasons.map((reason) => `- ${reason}`),
    '',
    'Invalidation:',
    signal.invalidation,
    '',
    `Position Size: ${risk.positionSizePercent}% max risk`,
    '',
    decision.narrative
  ].join('\n');
}
