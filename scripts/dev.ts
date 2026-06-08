import { Quantara } from '../src/core/quantara.js';
import { formatNoTrade } from '../src/telegram/formatters/no-trade.formatter.js';
import { formatRisk } from '../src/telegram/formatters/risk.formatter.js';
import { formatSignal } from '../src/telegram/formatters/signal.formatter.js';

const [command, symbol = 'SOLUSDT', timeframe = '5m', riskArg] = process.argv.slice(2);

if (command === 'risk') {
  const capital = Number(symbol);
  const risk = Number(timeframe);
  console.log(formatRisk(capital, risk));
} else if (command === 'scan' || command === 'scalp') {
  try {
    const result = await new Quantara().analyze({
      symbol,
      timeframe,
      mode: command,
      telegramChatId: 'cli',
      riskPercent: riskArg ? Number(riskArg) : undefined,
      useLlm: false
    });
    console.log(JSON.stringify(result.decision, null, 2));
    console.log('\n--- formatted ---\n');
    console.log(result.decision.status === 'TRADE_VALID' ? formatSignal(result.decision) : formatNoTrade(result.decision));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
} else {
  console.log('Usage: npx tsx scripts/dev.ts scan SOLUSDT 5m');
  console.log('       npx tsx scripts/dev.ts scalp BTCUSDT 5m');
  console.log('       npx tsx scripts/dev.ts risk 1000 2');
}
