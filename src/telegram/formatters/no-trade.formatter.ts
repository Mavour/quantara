import type { QuantaraDecision } from '../../core/types.js';

export function formatNoTrade(decision: QuantaraDecision): string {
  const { signal, risk } = decision;
  if (decision.status === 'WAIT_CONFIRMATION') {
    return [
      'Quantara Signal',
      '',
      `Asset: ${signal.symbol} · ${signal.timeframe}`,
      'Action: WAIT - Setup forming',
      '',
      `Confidence: ${signal.confidence}% (need >=70 to trigger)`,
      '',
      'Wait for:',
      decision.waitFor ?? 'Confirmation candle with stronger volume.',
      '',
      'Do not enter yet.',
      '',
      decision.narrative
    ].join('\n');
  }

  return [
    'Quantara Check',
    '',
    `Asset: ${signal.symbol} · ${signal.timeframe}`,
    'Action: NO TRADE',
    '',
    'Why rejected:',
    ...(risk.vetoReasons.length ? risk.vetoReasons : signal.reasons).map((reason) => `- ${reason}`),
    '',
    'Wait for:',
    'Clear confirmation with acceptable R:R, spread, liquidity, and confidence.',
    '',
    decision.narrative
  ].join('\n');
}
