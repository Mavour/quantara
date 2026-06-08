import { riskConfig } from '../config/risk.js';
import { SignalSnapshotRepository } from '../memory/repositories/signal-snapshot.repository.js';

export class ExposureGate {
  constructor(private readonly snapshots = new SignalSnapshotRepository()) {}

  canOpen(telegramChatId: string): { allowed: boolean; activeCount: number } {
    const activeCount = this.snapshots.countActive(telegramChatId);
    return {
      allowed: activeCount < riskConfig.maxConcurrentSignals,
      activeCount
    };
  }
}
