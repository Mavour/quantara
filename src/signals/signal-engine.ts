import type { MarketFeatures, NormalizedMarketData, SignalCandidate } from '../core/types.js';
import { breakoutScalpStrategy } from './strategies/breakout-scalp.strategy.js';
import { meanReversionStrategy } from './strategies/mean-reversion.strategy.js';
import { momentumContinuationStrategy } from './strategies/momentum-continuation.strategy.js';

export class SignalEngine {
  generate(data: NormalizedMarketData, features: MarketFeatures, mode: 'scan' | 'scalp' = 'scan'): SignalCandidate {
    const strategies =
      mode === 'scalp'
        ? [breakoutScalpStrategy, momentumContinuationStrategy, meanReversionStrategy]
        : [momentumContinuationStrategy, breakoutScalpStrategy, meanReversionStrategy];

    const candidates = strategies
      .map((strategy) => strategy(data, features))
      .filter((candidate): candidate is SignalCandidate => candidate !== null)
      .sort((a, b) => b.confidence - a.confidence);

    return candidates[0] ?? this.noTrade(data, 'No deterministic setup passed strategy conditions');
  }

  private noTrade(data: NormalizedMarketData, reason: string): SignalCandidate {
    return {
      symbol: data.symbol,
      timeframe: data.timeframe,
      strategy: 'none',
      action: 'NO_TRADE',
      entry: { min: data.currentPrice, max: data.currentPrice },
      stopLoss: 0,
      takeProfits: [],
      invalidation: 'No active setup',
      confidence: 0,
      reasons: [reason]
    };
  }
}
