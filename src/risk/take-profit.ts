export function targetsFromRisk(entry: number, stopLoss: number, action: 'BUY' | 'SELL', multiples = [1.5, 2.2]): number[] {
  const risk = Math.abs(entry - stopLoss);
  return multiples.map((multiple) => (action === 'BUY' ? entry + risk * multiple : entry - risk * multiple));
}
