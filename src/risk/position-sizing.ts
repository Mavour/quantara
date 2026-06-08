export function calculatePositionSizePercent(riskPercent: number, riskReward: number): number {
  if (riskReward <= 0) return 0;
  return Math.min(riskPercent, 5);
}

export function calculatePositionUnits(capital: number, riskPercent: number, entry: number, stopLoss: number): number {
  const riskAmount = capital * (riskPercent / 100);
  const perUnitRisk = Math.abs(entry - stopLoss);
  return perUnitRisk === 0 ? 0 : riskAmount / perUnitRisk;
}
