import { buildBearCase } from '../advisors/agents/bear-researcher.js';
import { buildBullCase } from '../advisors/agents/bull-researcher.js';
import { summarizeMarket } from '../advisors/agents/market-analyst.js';
import { summarizeRisk } from '../advisors/agents/risk-manager-agent.js';
import { DeepSeekClient, DeepSeekError } from '../advisors/deepseek/deepseek.client.js';
import { buildNoTradePrompt } from '../advisors/deepseek/prompts/no-trade.prompt.js';
import { buildSignalAdvisorPrompt } from '../advisors/deepseek/prompts/signal-advisor.prompt.js';
import { FeatureEngine } from '../features/feature-engine.js';
import { MarketDataProvider } from '../data/market-data.provider.js';
import { RiskEngine } from '../risk/risk-engine.js';
import { SignalEngine } from '../signals/signal-engine.js';
import { logger } from '../utils/logger.js';
import { decideStatus } from './decision-gate.js';
import type { MarketFeatures, NormalizedMarketData, QuantaraDecision } from './types.js';

export interface QuantaraRunResult {
  decision: QuantaraDecision;
  marketData: NormalizedMarketData;
  features: MarketFeatures;
  reasoning: Record<string, string>;
}

export class Quantara {
  constructor(
    private readonly marketData = new MarketDataProvider(),
    private readonly featureEngine = new FeatureEngine(),
    private readonly signalEngine = new SignalEngine(),
    private readonly riskEngine = new RiskEngine(),
    private readonly deepSeek = new DeepSeekClient()
  ) {}

  async analyze(params: {
    symbol: string;
    timeframe: string;
    mode?: 'scan' | 'scalp';
    telegramChatId?: string;
    riskPercent?: number;
    useLlm?: boolean;
    enforceExposureGate?: boolean;
  }): Promise<QuantaraRunResult> {
    const marketData = await this.marketData.fetch(params.symbol, params.timeframe);
    const features = this.featureEngine.calculate(marketData);
    const signal = this.signalEngine.generate(marketData, features, params.mode ?? 'scan');
    const risk = this.riskEngine.evaluate({
      telegramChatId: params.telegramChatId,
      signal,
      features,
      riskPercent: params.riskPercent,
      enforceExposureGate: params.enforceExposureGate
    });
    const status = decideStatus(signal, risk);
    const reasoning = {
      market: summarizeMarket(features),
      bull: buildBullCase(signal, features),
      bear: buildBearCase(signal, features),
      risk: summarizeRisk(risk)
    };

    const narrative = await this.buildNarrative(status === 'NO_TRADE', signal, features, risk, params.useLlm ?? true);

    return {
      decision: {
        status,
        signal,
        risk,
        narrative,
        waitFor: risk.waitFor
      },
      marketData,
      features,
      reasoning
    };
  }

  private async buildNarrative(
    isNoTrade: boolean,
    signal: QuantaraDecision['signal'],
    features: MarketFeatures,
    risk: QuantaraDecision['risk'],
    useLlm: boolean
  ): Promise<string> {
    if (!useLlm) return this.localNarrative(isNoTrade, risk);

    try {
      const prompt = isNoTrade ? buildNoTradePrompt(signal, features, risk) : buildSignalAdvisorPrompt(signal, features, risk);
      return await this.deepSeek.complete([
        {
          role: 'system',
          content:
            'You are Quantara, a crypto trading advisor. Never invent prices, indicators, entries, stop losses, or take profits.'
        },
        { role: 'user', content: prompt }
      ]);
    } catch (error) {
      if (error instanceof DeepSeekError) {
        logger.warn('deepseek_narrative_fallback', { message: error.message, statusCode: error.statusCode });
        return this.localNarrative(isNoTrade, risk);
      }
      throw error;
    }
  }

  private localNarrative(isNoTrade: boolean, risk: QuantaraDecision['risk']): string {
    if (isNoTrade) return `Setup ditolak. ${risk.vetoReasons.join('; ') || 'Tidak ada setup deterministik yang valid.'}`;
    return `Setup lolos risk gate. R:R ${risk.riskReward}, risk level ${risk.riskLevel}.`;
  }
}
