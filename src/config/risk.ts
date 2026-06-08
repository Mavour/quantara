import { env } from './env.js';

export const riskConfig = {
  defaultRiskPercent: env.DEFAULT_RISK_PERCENT,
  minRiskReward: 1.5,
  maxSpreadBps: 15,
  minLiquidityScore: 30,
  minConfidence: 60,
  fullTradeConfidence: 70,
  strongTrendThreshold: 70,
  maxConcurrentSignals: env.MAX_CONCURRENT_SIGNALS,
  staleSignalHours: 4
} as const;
