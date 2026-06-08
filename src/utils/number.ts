export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatPrice(value: number): string {
  if (value >= 1000) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(8);
}

export function formatPercent(value: number): string {
  return `${round(value, 2)}%`;
}

export function basisPoints(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 10_000;
}
