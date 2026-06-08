import { ExposureGate } from '../../risk/exposure-gate.js';

export class PortfolioGatekeeper {
  constructor(private readonly exposureGate = new ExposureGate()) {}

  canOpenSignal(chatId: string): boolean {
    return this.exposureGate.canOpen(chatId).allowed;
  }
}
