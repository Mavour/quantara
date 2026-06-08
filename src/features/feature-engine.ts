import type { MarketFeatures, NormalizedMarketData } from '../core/types.js';
import { calculateFundingBias } from './funding.js';
import { calculateLiquidity } from './liquidity.js';
import { calculateSupportResistance } from './support-resistance.js';
import { calculateTrend } from './trend.js';
import { calculateVolatility } from './volatility.js';
import { calculateVolumeRatio } from './volume.js';

export class FeatureEngine {
  calculate(data: NormalizedMarketData): MarketFeatures {
    const trend = calculateTrend(data.candles);
    const volatility = calculateVolatility(data.candles);
    const sr = calculateSupportResistance(data.candles);
    const liquidity = calculateLiquidity(data);

    return {
      ...trend,
      ...volatility,
      volumeRatio: calculateVolumeRatio(data.candles),
      ...sr,
      candlePattern: null,
      ...liquidity,
      fundingBias: calculateFundingBias(data.fundingRate)
    };
  }
}
