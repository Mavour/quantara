export function atrStopLoss(entry: number, atr: number, action: 'BUY' | 'SELL', multiplier = 1.2): number {
  return action === 'BUY' ? entry - atr * multiplier : entry + atr * multiplier;
}
