export interface RawCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedMarketData {
  symbol: string;
  timeframe: string;
  candles: RawCandle[];
  currentPrice: number;
  spread: number;
  bidDepth: number;
  askDepth: number;
  fundingRate: number | null;
  openInterest: number | null;
}

export interface MarketFeatures {
  trendDirection: 'up' | 'down' | 'sideways';
  trendStrength: number;
  ema20: number;
  ema50: number;
  atr: number;
  volatilityRegime: 'low' | 'medium' | 'high';
  volumeRatio: number;
  nearestSupport: number;
  nearestResistance: number;
  candlePattern: string | null;
  spreadBps: number;
  liquidityScore: number;
  fundingBias: 'long_heavy' | 'short_heavy' | 'neutral';
}

export interface SignalCandidate {
  symbol: string;
  timeframe: string;
  strategy: string;
  action: 'BUY' | 'SELL' | 'NO_TRADE';
  entry: { min: number; max: number };
  stopLoss: number;
  takeProfits: number[];
  invalidation: string;
  confidence: number;
  reasons: string[];
}

export interface RiskResult {
  passed: boolean;
  vetoReasons: string[];
  riskReward: number;
  positionSizePercent: number;
  riskLevel: 'low' | 'medium' | 'high';
  waitFor?: string;
}

export type DecisionStatus = 'TRADE_VALID' | 'WAIT_CONFIRMATION' | 'NO_TRADE' | 'INVALIDATED';

export interface QuantaraDecision {
  status: DecisionStatus;
  signal: SignalCandidate;
  risk: RiskResult;
  narrative: string;
  waitFor?: string;
}

export interface SignalSnapshot {
  id: number;
  telegramChatId: string;
  symbol: string;
  timeframe: string;
  strategy: string;
  action: string;
  entryMin: number | null;
  entryMax: number | null;
  stopLoss: number | null;
  takeProfits: number[];
  invalidation: string | null;
  confidence: number | null;
  riskReward: number | null;
  riskLevel: string | null;
  status: 'ACTIVE' | 'INVALIDATED' | 'CLOSED';
  marketDataJson: string | null;
  featuresJson: string | null;
  reasoningJson: string | null;
  createdAt: string;
}

export interface ResolvedContext {
  snapshot: SignalSnapshot;
  currentPrice: number;
  isStale: boolean;
  status: DecisionStatus;
}
