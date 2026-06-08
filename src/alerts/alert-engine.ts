import { Quantara } from '../core/quantara.js';

export class AlertEngine {
  async scan(symbol: string, timeframe: string, telegramChatId: string) {
    return new Quantara().analyze({ symbol, timeframe, mode: 'scan', telegramChatId, useLlm: false });
  }
}
