import type { MarketFeatures, RiskResult, SignalCandidate } from '../../../core/types.js';

export function buildSignalAdvisorPrompt(signal: SignalCandidate, features: MarketFeatures, risk: RiskResult): string {
  return [
    'Explain this crypto trade setup for Telegram.',
    'Rules: do not invent prices, indicators, or new targets. Use only provided data.',
    `Signal: ${JSON.stringify(signal)}`,
    `Features: ${JSON.stringify(features)}`,
    `Risk: ${JSON.stringify(risk)}`,
    'Return concise Indonesian analysis with bull case, bear case, and invalidation.'
  ].join('\n');
}
