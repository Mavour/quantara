export const supportedSymbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'] as const;
export const supportedTimeframes = ['1m', '5m', '15m', '1h'] as const;
export const defaultTimeframe = '5m';
export const defaultCandleLimit = 200;

export type SupportedSymbol = (typeof supportedSymbols)[number];
export type SupportedTimeframe = (typeof supportedTimeframes)[number];
