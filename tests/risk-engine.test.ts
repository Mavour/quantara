import { describe, expect, it } from 'vitest';
import type { MarketFeatures, SignalCandidate } from '../src/core/types.js';
import { RiskEngine } from '../src/risk/risk-engine.js';

const features: MarketFeatures = {
  trendDirection: 'up',
  trendStrength: 40,
  ema20: 101,
  ema50: 100,
  atr: 1,
  volatilityRegime: 'medium',
  volumeRatio: 1.5,
  nearestSupport: 99,
  nearestResistance: 103,
  candlePattern: null,
  spreadBps: 2,
  liquidityScore: 80,
  fundingBias: 'neutral'
};

const signal: SignalCandidate = {
  symbol: 'SOL/USDT',
  timeframe: '5m',
  strategy: 'test',
  action: 'BUY',
  entry: { min: 100, max: 100 },
  stopLoss: 99,
  takeProfits: [101.5, 102],
  invalidation: 'close below 99',
  confidence: 75,
  reasons: ['test']
};

describe('RiskEngine', () => {
  it('passes a valid signal', () => {
    const risk = new RiskEngine({ canOpen: () => ({ allowed: true, activeCount: 0 }) }).evaluate({ signal, features });
    expect(risk.passed).toBe(true);
    expect(risk.riskReward).toBe(1.5);
  });

  it('vetoes low confidence', () => {
    const risk = new RiskEngine({ canOpen: () => ({ allowed: true, activeCount: 0 }) }).evaluate({
      signal: { ...signal, confidence: 10 },
      features
    });
    expect(risk.passed).toBe(false);
    expect(risk.vetoReasons).toContain('Confidence 10% below minimum 60%');
  });
});
