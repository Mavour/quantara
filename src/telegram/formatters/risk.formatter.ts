import { calculatePositionUnits } from '../../risk/position-sizing.js';
import { formatPrice, round } from '../../utils/number.js';

export function formatRisk(capital: number, riskPercent: number, entry?: number, stopLoss?: number): string {
  if (entry && stopLoss) {
    const units = calculatePositionUnits(capital, riskPercent, entry, stopLoss);
    return [
      'Quantara Risk',
      '',
      `Capital: $${round(capital, 2)}`,
      `Risk: ${riskPercent}%`,
      `Risk amount: $${round(capital * (riskPercent / 100), 2)}`,
      `Entry: ${formatPrice(entry)}`,
      `Stop Loss: ${formatPrice(stopLoss)}`,
      `Position units: ${round(units, 6)}`
    ].join('\n');
  }

  return [
    'Quantara Risk',
    '',
    `Capital: $${round(capital, 2)}`,
    `Risk: ${riskPercent}%`,
    `Max loss: $${round(capital * (riskPercent / 100), 2)}`
  ].join('\n');
}
