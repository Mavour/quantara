export function normalizeSymbol(input: string): string {
  const upper = input.trim().toUpperCase().replace('-', '/');
  const withSlash = upper.includes('/') ? upper : upper.endsWith('USDT') ? `${upper.slice(0, -4)}/USDT` : `${upper}/USDT`;

  if (!/^[A-Z0-9]+\/USDT$/.test(withSlash)) {
    throw new Error(`Unsupported symbol format: ${withSlash}. Use symbols like SOL, NEAR, or NEARUSDT.`);
  }

  return withSlash;
}

export function toCcxtSymbol(input: string): string {
  return normalizeSymbol(input);
}
