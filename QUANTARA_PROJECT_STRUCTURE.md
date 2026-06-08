# Quantara Project Structure

Quantara adalah crypto trading advisor berbasis Telegram yang memberi masukan buy, sell, scalp, wait, atau no-trade berdasarkan data market, risk management, memory percakapan, dan reasoning LLM. Agent ini bukan auto-trader di tahap awal. Semua rekomendasi harus punya entry, stop loss, take profit, confidence, invalidation, dan alasan risiko.

## Core Principle

```text
Data decides first.
Risk manager can veto.
DeepSeek explains and challenges the setup.
Telegram keeps the conversation context.
User approves every action.
```

## Target MVP

MVP pertama harus bisa:

1. Jalan sebagai Telegram bot.
2. Menerima command seperti `/scan SOL`, `/scalp BTCUSDT`, dan `/risk`.
3. Mengambil market data dari exchange atau market API.
4. Menghasilkan signal deterministik: buy, sell, wait, avoid.
5. Menghitung stop loss, take profit, R:R, dan position size.
6. Memakai DeepSeek via `app.generalcompute.com` untuk analisis naratif.
7. Menyimpan signal snapshot agar saat user reply pesan lama, bot langsung paham konteks.
8. Menolak setup buruk dengan output `NO TRADE`.

## Closed MVP Decisions

Keputusan ini ditutup untuk build pertama supaya scope tidak melebar.

| Decision | Answer |
|---|---|
| Telegram library | `grammY` |
| Market data MVP | Binance only via `ccxt` |
| Default risk per trade | 1% |
| Supported symbols MVP | BTC, ETH, SOL USDT pairs |
| Longer-term coverage | All crypto coins via CEX + DEX modes |
| LLM | DeepSeek via `app.generalcompute.com` OpenAI-compatible endpoint |
| DeepSeek model | `deepseek-chat` |
| TA library | `technicalindicators` |
| Database | `better-sqlite3` |
| Logger | `winston` |
| Runtime | Node.js 20+, TypeScript 5+, ESM |
| CLI testable | Yes, must work without Telegram token |
| Deployment MVP | Ubuntu VPS + PM2 |

## Recommended Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js + TypeScript |
| Telegram Bot | grammY |
| Database | SQLite untuk MVP |
| LLM | DeepSeek via app.generalcompute.com |
| Market Data | Binance / Bybit / DexScreener |
| Solana Data | Jupiter / Helius / RugCheck, ditambahkan setelah MVP |
| Backtesting | systematic-trading-framework sebagai testing layer |
| Deployment | Ubuntu VPS + PM2 untuk MVP |

## Environment Contract

```env
# Telegram
TELEGRAM_BOT_TOKEN=

# LLM
GENERALCOMPUTE_BASE_URL=https://app.generalcompute.com/v1
GENERALCOMPUTE_API_KEY=

# Binance read-only, no trading in MVP
BINANCE_API_KEY=
BINANCE_API_SECRET=

# Database
DATABASE_PATH=./data/quantara.db

# Risk defaults
DEFAULT_RISK_PERCENT=1
MAX_CONCURRENT_SIGNALS=2

# Logging
LOG_LEVEL=info

# Alert scheduler
ALERT_SCAN_INTERVAL_MINUTES=5
ALERT_DEDUP_WINDOW_MINUTES=30
ALERT_ENABLED=true
ALERT_NOTIFY_WAIT_CONFIRMATION=true
```

## Package Dependencies

```json
{
  "dependencies": {
    "grammy": "^1.30.0",
    "ccxt": "^4.4.0",
    "better-sqlite3": "^11.0.0",
    "technicalindicators": "^3.1.0",
    "winston": "^3.13.0",
    "zod": "^3.23.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tsx": "^4.16.0",
    "@types/node": "^20.0.0",
    "@types/better-sqlite3": "^7.6.0",
    "vitest": "^1.6.0"
  },
  "scripts": {
    "dev": "tsx src/app.ts",
    "migrate": "tsx scripts/migrate.ts",
    "cli": "tsx scripts/dev.ts",
    "test": "vitest"
  }
}
```

## High-Level Architecture

```text
Telegram User
  -> Telegram Bot
    -> Command Router
    -> Context Resolver
    -> Quantara Core
      -> Market Data Adapter
      -> Feature Engine
      -> Signal Engine
      -> Risk Engine
      -> Strategy Researcher
      -> DeepSeek Advisor
      -> Decision Gate
    -> Database
    -> Telegram Response Formatter
```

## Project Layout

Files marked as later-phase modules should exist as typed stubs during scaffold, with a clear `// Phase 2` or later comment, but their logic should not be implemented in MVP.

```text
quantara/
  src/
    app.ts
    config/
      env.ts
      markets.ts
      risk.ts
      llm.ts
    telegram/
      bot.ts
      commands/
        scan.command.ts
        scalp.command.ts
        risk.command.ts
        watch.command.ts
        settings.command.ts
      middleware/
        auth.middleware.ts
        context.middleware.ts
      formatters/
        signal.formatter.ts
        no-trade.formatter.ts
        risk.formatter.ts
        error.formatter.ts
    core/
      quantara.ts
      decision-gate.ts
      types.ts
    data/
      market-data.provider.ts
      adapters/
        binance.adapter.ts
        bybit.adapter.ts
        dexscreener.adapter.ts
      normalizers/
        candle.normalizer.ts
        symbol.normalizer.ts
    features/
      trend.ts
      volatility.ts
      volume.ts
      support-resistance.ts
      liquidity.ts
      funding.ts
    signals/
      signal-engine.ts
      strategies/
        breakout-scalp.strategy.ts
        mean-reversion.strategy.ts
        momentum-continuation.strategy.ts
      validators/
        signal-quality.validator.ts
        market-regime.validator.ts
    risk/
      risk-engine.ts
      position-sizing.ts
      stop-loss.ts
      take-profit.ts
      risk-reward.ts
      exposure-gate.ts
    advisors/
      deepseek/
        deepseek.client.ts
        prompts/
          signal-advisor.prompt.ts
          trade-review.prompt.ts
          no-trade.prompt.ts
          followup.prompt.ts
      agents/
        market-analyst.ts
        sentiment-analyst.ts
        onchain-analyst.ts
        bull-researcher.ts
        bear-researcher.ts
        risk-manager-agent.ts
        portfolio-gatekeeper.ts
    memory/
      db.ts
      migrations/
        001_initial.sql
      repositories/
        telegram-message.repository.ts
        signal-snapshot.repository.ts
        user-settings.repository.ts
        watchlist.repository.ts
        trade-journal.repository.ts
      context-resolver.ts
    backtesting/
      framework-bridge.ts
      strategy-exporter.ts
      reports/
    alerts/
      watchlist-runner.ts
      alert-engine.ts
      alert-scheduler.ts
    safety/
      token-safety.ts
      rug-check.ts
      solana-token-checks.ts
    utils/
      logger.ts
      time.ts
      number.ts
  tests/
    signal-engine.test.ts
    risk-engine.test.ts
    context-resolver.test.ts
  scripts/
    dev.ts
    backtest.ts
    migrate.ts
  docs/
    prompts.md
    telegram-commands.md
    signal-contract.md
    risk-rules.md
  .env.example
  package.json
  tsconfig.json
  README.md
```

MVP implementation should keep these as typed no-op stubs that do not break boot:

```text
data/adapters/bybit.adapter.ts        -> Phase 2
data/adapters/dexscreener.adapter.ts  -> Phase 3
advisors/agents/sentiment-analyst.ts  -> Phase 2
advisors/agents/onchain-analyst.ts    -> Phase 4
backtesting/*                         -> Phase 2
safety/*                              -> Phase 4
scripts/backtest.ts                   -> Phase 2
```

## Module Responsibilities

### Telegram Layer

Telegram layer bertugas menerima pesan, membaca command, mendeteksi reply ke pesan lama, dan mengirim response yang ringkas.

Command awal:

| Command | Fungsi |
|---|---|
| `/scan SOL` | Analisis cepat asset |
| `/scalp SOLUSDT` | Cari setup scalping |
| `/risk 1000 2` | Hitung position size dari modal dan risk percent |
| `/watch BTC ETH SOL` | Tambah asset ke watchlist |
| `/settings` | Atur risk profile dan timeframe |

### Context Resolver

Fitur ini membuat Quantara tidak pikun di Telegram.

```text
User reply ke pesan lama
  -> ambil reply_to_message.message_id
  -> cari telegram_messages.context_id
  -> ambil signal_snapshots lama
  -> ambil market data terbaru
  -> jawab berdasarkan konteks lama + kondisi terbaru
```

Contoh:

```text
User reply ke signal SOL lama:
"masih valid ga?"

Quantara:
"Masih refer ke signal SOL/USDT 5m dari 14:32.
Status: INVALID.
Harga sudah close di bawah invalidation 167.00.
Action: jangan entry ulang."
```

Implementation rule:

```text
Lookup must use exact Telegram reply_to_message_id.
Do not rely on vector search for reply context.
Lookup telegram_messages.bot_message_id = reply_to_message_id.
If found, fetch signal_snapshots.id from context_id.
Fetch current price for snapshot.symbol.
Compare current price against stop loss and invalidation.
If signal is older than 4 hours, mark the follow-up response as INVALIDATED.
If no context is found, reply: "Reply to a Quantara signal to get context."
```

### Data Layer

Data layer mengambil dan menormalkan data dari exchange/API.

Data minimum:

| Data | Kegunaan |
|---|---|
| OHLCV | Trend, volatility, breakout, candle structure |
| Volume | Volume anomaly dan confirmation |
| Orderbook | Spread dan liquidity check |
| Funding | Risiko crowded long/short |
| Open Interest | Leverage expansion/contraction |
| Dex liquidity | Untuk alt/meme token |

MVP data source:

```text
Binance via ccxt
  -> OHLCV
  -> orderbook
  -> funding rate where available
```

Initial supported symbols:

```text
BTC/USDT
ETH/USDT
SOL/USDT
```

Universal crypto support tetap menjadi tujuan produk, tapi masuk bertahap:

```text
Phase 1: liquid Binance majors
Phase 2: broader CEX alts
Phase 3: DexScreener token address scan
Phase 4: Solana safety/rug checks
Phase 5: new-pair and meme scanner
```

### Feature Engine

Feature engine menghitung indikator secara deterministik. LLM tidak boleh mengarang indikator.

Feature awal:

1. Trend direction.
2. Support/resistance.
3. Volume anomaly.
4. Volatility regime.
5. Candle breakout/rejection.
6. Spread/liquidity quality.
7. Funding bias.

### Signal Engine

Signal engine menghasilkan kandidat trade.

Output internal:

```json
{
  "symbol": "SOLUSDT",
  "timeframe": "5m",
  "strategy": "breakout_scalp",
  "action": "BUY",
  "entry": {
    "min": 168.2,
    "max": 168.7
  },
  "stopLoss": 166.9,
  "takeProfits": [170.2, 172.0],
  "invalidation": "5m close below 167.00",
  "confidence": 74,
  "reasons": [
    "breakout resistance 5m",
    "volume 2.4x average",
    "BTC trend supportive"
  ]
}
```

### Risk Engine

Risk engine wajib jalan sebelum DeepSeek membuat final advice.

Rules awal:

1. Tidak ada signal tanpa stop loss.
2. Minimum R:R adalah 1.5.
3. Max risk default 1% per trade.
4. Reject jika spread terlalu besar.
5. Reject jika liquidity terlalu tipis.
6. Reject jika BTC market regime bertentangan keras dengan setup alt.
7. Reject jika confidence di bawah threshold.

Exact MVP risk rules:

```text
Rule 1: VETO if signal.stopLoss is null or 0
        reason: "No stop loss defined"

Rule 2: VETO if R:R < 1.5
        reason: "R:R {value} below minimum 1.5"

Rule 3: VETO if features.spreadBps > 15
        reason: "Spread {value}bps exceeds 15bps limit"

Rule 4: VETO if features.liquidityScore < 30
        reason: "Liquidity score {value} below minimum 30"

Rule 5: VETO if signal.confidence < 60
        reason: "Confidence {value}% below minimum 60%"

Rule 6: VETO if features.trendDirection === 'down'
             AND signal.action === 'BUY'
             AND features.trendStrength > 70
        reason: "Strong downtrend conflicts with BUY signal"

Rule 7: VETO if active signal count for chat_id >= MAX_CONCURRENT_SIGNALS
        reason: "Max concurrent signals reached ({MAX_CONCURRENT_SIGNALS})"

Rule 8: WAIT_CONFIRMATION, not VETO, if confidence is between 60 and 69
        flag: "Confidence borderline - wait for confirmation candle"
```

### DeepSeek Advisor

DeepSeek digunakan untuk:

1. Menjelaskan setup.
2. Membandingkan bull case vs bear case.
3. Mengubah data menjadi jawaban Telegram yang jelas.
4. Menghasilkan `NO TRADE` explanation jika risk gate menolak.
5. Menjawab follow-up berdasarkan signal snapshot lama.

DeepSeek tidak digunakan untuk:

1. Mengarang harga entry.
2. Mengarang indikator.
3. Mengabaikan risk gate.
4. Auto-execution tanpa approval.

DeepSeek client requirements:

```text
Base URL: https://app.generalcompute.com/v1
Model: deepseek-chat
API style: OpenAI-compatible /chat/completions
Temperature: 0.3
Max tokens: 1000
Timeout: 15s
Retry: once on 5xx
Failure mode: throw typed error, never return empty narrative silently
```

### Decision Gate

Decision gate adalah final approval logic sebelum pesan dikirim.

```text
Signal Candidate
  -> risk validation
  -> market regime validation
  -> liquidity validation
  -> optional DeepSeek critique
  -> APPROVE / WAIT / REJECT
```

Final status:

| Status | Meaning |
|---|---|
| `TRADE_VALID` | Setup boleh dipertimbangkan |
| `WAIT_CONFIRMATION` | Setup menarik tapi belum confirm |
| `NO_TRADE` | Setup ditolak |
| `INVALIDATED` | Signal lama sudah tidak valid |

## Database Design

### users

```sql
id
telegram_chat_id
risk_per_trade
default_timeframe
preferred_exchange
created_at
updated_at
```

### telegram_messages

```sql
id
telegram_chat_id
telegram_message_id
direction
text
context_type
context_id
created_at
```

### signal_snapshots

```sql
id
symbol
timeframe
strategy
action
entry_min
entry_max
stop_loss
take_profit_json
invalidation
confidence
risk_level
status
market_data_json
features_json
reasoning_json
created_at
```

### watchlists

```sql
id
user_id
symbol
mode
timeframe
enabled
created_at
```

### trade_journal

```sql
id
user_id
signal_snapshot_id
user_decision
entry_price
exit_price
pnl
notes
created_at
updated_at
```

### strategy_performance

```sql
id
strategy_name
symbol
timeframe
sample_size
win_rate
avg_rr
max_drawdown
profit_factor
updated_at
```

## Core Type Contract

These interfaces should live in `src/core/types.ts`.

```typescript
export interface RawCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedMarketData {
  symbol: string;
  timeframe: string;
  candles: RawCandle[];
  currentPrice: number;
  spread: number;
  bidDepth: number;
  askDepth: number;
  fundingRate: number | null;
  openInterest: number | null;
}

export interface MarketFeatures {
  trendDirection: 'up' | 'down' | 'sideways';
  trendStrength: number;
  ema20: number;
  ema50: number;
  atr: number;
  volatilityRegime: 'low' | 'medium' | 'high';
  volumeRatio: number;
  nearestSupport: number;
  nearestResistance: number;
  candlePattern: string | null;
  spreadBps: number;
  liquidityScore: number;
  fundingBias: 'long_heavy' | 'short_heavy' | 'neutral';
}

export interface SignalCandidate {
  symbol: string;
  timeframe: string;
  strategy: string;
  action: 'BUY' | 'SELL' | 'NO_TRADE';
  entry: { min: number; max: number };
  stopLoss: number;
  takeProfits: number[];
  invalidation: string;
  confidence: number;
  reasons: string[];
}

export interface RiskResult {
  passed: boolean;
  vetoReasons: string[];
  riskReward: number;
  positionSizePercent: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export type DecisionStatus =
  | 'TRADE_VALID'
  | 'WAIT_CONFIRMATION'
  | 'NO_TRADE'
  | 'INVALIDATED';

export interface QuantaraDecision {
  status: DecisionStatus;
  signal: SignalCandidate;
  risk: RiskResult;
  narrative: string;
  waitFor?: string;
}
```

## Telegram Response Contract

Every signal response should follow this structure:

```text
Quantara Signal

Asset: SOL/USDT
Action: BUY SCALP
Timeframe: 5m
Status: TRADE_VALID

Entry: 168.20 - 168.70
Stop Loss: 166.90
Take Profit: 170.20 / 172.00
R:R: 2.1
Confidence: 74%
Risk: Medium

Reason:
- Breakout resistance 5m
- Volume 2.4x average
- BTC trend supportive

Invalidation:
5m close below 167.00

Position Size:
Risk max 2% portfolio
```

For rejected trades:

```text
Quantara Check

Asset: SOL/USDT
Action: NO TRADE
Reason:
- R:R only 1.1
- Price is extended from support
- Volume confirmation is weak

Wait for:
5m close above resistance with volume > 1.8x average.
```

For wait confirmation:

```text
Quantara Signal

Asset: SOL/USDT · 5m
Action: WAIT - Setup forming

Confidence: 63% (need >=70 to trigger)

Wait for:
Confirmed close above 168.50 with volume > 1.5x avg

Do not enter yet.
```

## Skill Design Inspired By TradingAgents

Quantara can use a multi-agent reasoning pattern, but each agent receives computed data instead of raw unsupported assumptions.

| Agent | Role |
|---|---|
| Market Analyst | Reads trend, structure, volume, volatility |
| Sentiment Analyst | Reads news/social/narrative when available |
| On-chain Analyst | Reads token safety, whales, liquidity |
| Bull Researcher | Builds bullish case |
| Bear Researcher | Builds bearish case and invalidation |
| Risk Manager | Vetoes bad R:R, bad liquidity, bad sizing |
| Portfolio Gatekeeper | Checks exposure and final approval |

## Backtesting Plan

Use `systematic-trading-framework` as a testing layer for deterministic strategies.

Backtest flow:

```text
Quantara strategy
  -> export signal rules
  -> run systematic-trading-framework
  -> collect metrics
  -> update strategy_performance
  -> allow strategy only if metrics pass thresholds
```

Minimum strategy acceptance:

| Metric | Initial Threshold |
|---|---|
| Sample size | >= 100 trades |
| Profit factor | > 1.2 |
| Max drawdown | acceptable by risk profile |
| Average R:R | >= 1.5 |
| Win rate | strategy-dependent |

## CLI Dev Runner

MVP must be testable without Telegram token.

```bash
npx tsx scripts/dev.ts scan SOLUSDT 5m
npx tsx scripts/dev.ts scalp BTCUSDT 5m
npx tsx scripts/dev.ts risk 1000 2
```

Expected output:

```text
1. Full JSON decision to stdout.
2. Formatted Telegram-style message to console.
```

## Hard Rules

1. LLM never generates price levels, indicator values, or entry/SL/TP numbers.
2. All numbers come from Feature Engine, Signal Engine, and Risk Engine.
3. Risk Engine runs before DeepSeek.
4. If risk vetoes, DeepSeek only explains the rejection and cannot override it.
5. Every signal is stored to DB with `market_data_json` and `features_json`.
6. No silent failures. Log errors with `winston` and surface formatted errors.
7. No auto-execution in MVP. No order submission code in Phase 1.
8. Context Resolver must handle stale signals gracefully.
9. Any signal older than 4 hours is invalidated in follow-up response.

## Roadmap

### Phase 1: Telegram MVP

1. Project scaffold.
2. Telegram bot.
3. SQLite schema.
4. `/scan`, `/scalp`, `/risk`.
5. Market data adapter.
6. Signal and risk engine.
7. DeepSeek advisor.
8. Message snapshot and reply context.

### Phase 2: Strategy Validation

1. Backtesting bridge.
2. Strategy performance table.
3. Report generation.
4. Reject strategies that fail validation.

### Phase 3: Alerts

1. `/watch`.
2. Scheduled market scanner.
3. Telegram alert on valid setup.
4. Alert deduplication.

### Phase 4: Crypto-Native Intelligence

1. DexScreener token scanner.
2. Solana token safety check.
3. RugCheck/Helius/Jupiter integration.
4. Meme token liquidity and holder checks.

### Phase 5: Execution Guardrails

Execution should only be added after backtesting and alert performance are reliable.

1. Manual approval buttons.
2. Paper trading.
3. Exchange sandbox.
4. Real execution with strict risk caps.

## Initial Build Order

```text
Step 1:  package.json, tsconfig.json, .env.example
Step 2:  src/config/env.ts
Step 3:  src/config/llm.ts, risk.ts, markets.ts
Step 4:  src/utils/logger.ts, time.ts, number.ts
Step 5:  src/core/types.ts
Step 6:  src/memory/db.ts + migrations/001_initial.sql + scripts/migrate.ts
Step 7:  src/memory/repositories/
Step 8:  src/data/adapters/binance.adapter.ts
Step 9:  src/data/normalizers/ + market-data.provider.ts
Step 10: src/features/
Step 11: src/signals/
Step 12: src/risk/
Step 13: src/advisors/deepseek/
Step 14: src/advisors/agents/
Step 15: src/core/decision-gate.ts + quantara.ts
Step 16: src/memory/context-resolver.ts
Step 17: scripts/dev.ts
Step 18: src/telegram/
Step 19: src/app.ts
Step 20: src/alerts/
Step 21: tests/
Step 22: docs/ + README.md
```

## Previously Open Decisions

Claude prompt closes these as:

```text
grammY
Binance via ccxt
1% risk
BTC/ETH/SOL for MVP
deepseek-chat
CLI testable before Telegram
```

Remaining strategic decision:

```text
How aggressive should Phase 2 be for all-coin coverage:
  A. CEX alt expansion first
  B. Solana DEX token address scan first
  C. Meme/new-pair scanner first
```

Recommended answer: A first, then B, then C. This keeps signal quality testable before moving into high-rug-risk markets.
