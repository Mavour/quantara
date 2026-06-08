import { supportedSymbols } from '../../config/markets.js';

export function normalizeSymbol(input: string): string {
  const upper = input.trim().toUpperCase().replace('-', '/');
  const withSlash = upper.includes('/') ? upper : upper.endsWith('USDT') ? `${upper.slice(0, -4)}/USDT` : `${upper}/USDT`;

  if (!supportedSymbols.includes(withSlash as (typeof supportedSymbols)[number])) {
    throw new Error(`Unsupported MVP symbol: ${withSlash}. Supported: ${supportedSymbols.join(', ')}`);
  }

  return withSlash;
}

export function toCcxtSymbol(input: string): string {
  return normalizeSymbol(input);
}
