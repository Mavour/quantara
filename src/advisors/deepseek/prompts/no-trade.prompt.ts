import type { MarketFeatures, RiskResult, SignalCandidate } from '../../../core/types.js';

export function buildNoTradePrompt(signal: SignalCandidate, features: MarketFeatures, risk: RiskResult): string {
  return [
    'Explain why this crypto setup is rejected.',
    'Rules: do not invent prices, indicators, or new targets. Risk veto cannot be overridden.',
    `Signal: ${JSON.stringify(signal)}`,
    `Features: ${JSON.stringify(features)}`,
    `Risk: ${JSON.stringify(risk)}`,
    'Return concise Indonesian explanation and what confirmation to wait for.'
  ].join('\n');
}
