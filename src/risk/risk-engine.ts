import { riskConfig } from '../config/risk.js';
import type { MarketFeatures, RiskResult, SignalCandidate } from '../core/types.js';
import { round } from '../utils/number.js';
import { ExposureGate } from './exposure-gate.js';
import { calculatePositionSizePercent } from './position-sizing.js';
import { calculateRiskReward } from './risk-reward.js';

export interface ExposureGateLike {
  canOpen(telegramChatId: string): { allowed: boolean; activeCount: number };
}

export class RiskEngine {
  constructor(private readonly exposureGate: ExposureGateLike = new ExposureGate()) {}

  evaluate(params: {
    telegramChatId?: string;
    signal: SignalCandidate;
    features: MarketFeatures;
    riskPercent?: number;
  }): RiskResult {
    const riskPercent = params.riskPercent ?? riskConfig.defaultRiskPercent;
    const vetoReasons: string[] = [];
    const riskReward = round(calculateRiskReward(params.signal), 2);

    if (!params.signal.stopLoss) vetoReasons.push('No stop loss defined');
    if (riskReward < riskConfig.minRiskReward) vetoReasons.push(`R:R ${riskReward} below minimum 1.5`);
    if (params.features.spreadBps > riskConfig.maxSpreadBps) {
      vetoReasons.push(`Spread ${round(params.features.spreadBps, 2)}bps exceeds 15bps limit`);
    }
    if (params.features.liquidityScore < riskConfig.minLiquidityScore) {
      vetoReasons.push(`Liquidity score ${params.features.liquidityScore} below minimum 30`);
    }
    if (params.signal.confidence < riskConfig.minConfidence) {
      vetoReasons.push(`Confidence ${params.signal.confidence}% below minimum 60%`);
    }
    if (
      params.features.trendDirection === 'down' &&
      params.signal.action === 'BUY' &&
      params.features.trendStrength > riskConfig.strongTrendThreshold
    ) {
      vetoReasons.push('Strong downtrend conflicts with BUY signal');
    }
    if (params.telegramChatId) {
      const exposure = this.exposureGate.canOpen(params.telegramChatId);
      if (!exposure.allowed) {
        vetoReasons.push(`Max concurrent signals reached (${riskConfig.maxConcurrentSignals})`);
      }
    }

    const waitFor =
      vetoReasons.length === 0 &&
      params.signal.confidence >= riskConfig.minConfidence &&
      params.signal.confidence < riskConfig.fullTradeConfidence
        ? 'Confidence borderline - wait for confirmation candle'
        : undefined;

    return {
      passed: vetoReasons.length === 0,
      vetoReasons,
      riskReward,
      positionSizePercent: calculatePositionSizePercent(riskPercent, riskReward),
      riskLevel: riskReward >= 2 && params.features.liquidityScore >= 60 ? 'low' : riskReward >= 1.5 ? 'medium' : 'high',
      waitFor
    };
  }
}
