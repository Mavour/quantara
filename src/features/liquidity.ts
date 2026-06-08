import type { NormalizedMarketData } from '../core/types.js';
import { basisPoints } from '../utils/number.js';

export interface LiquidityResult {
  spreadBps: number;
  liquidityScore: number;
}

export function calculateLiquidity(data: NormalizedMarketData): LiquidityResult {
  const spreadBps = basisPoints(data.spread, data.currentPrice);
  const depth = Math.min(data.bidDepth, data.askDepth);
  const depthScore = Math.min(100, Math.round(depth / 10_000));
  const spreadPenalty = Math.min(70, Math.round(spreadBps * 3));
  return {
    spreadBps,
    liquidityScore: Math.max(0, depthScore - spreadPenalty)
  };
}
