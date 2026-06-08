# Quantara

Quantara is a Telegram crypto trading advisor built with Node.js, TypeScript, deterministic signal logic, risk gates, and DeepSeek narrative reasoning.

Phase 1 is advisory only. There is no order submission code.

## Setup

```bash
npm install
cp .env.example .env
npm run migrate
npm run cli -- scan SOLUSDT 5m
```

To start Telegram mode, set `TELEGRAM_BOT_TOKEN` and run:

```bash
npm run dev
```

LLM config:

```env
GENERALCOMPUTE_BASE_URL=https://api.generalcompute.com/v1
GENERALCOMPUTE_API_KEY=your_key
GENERALCOMPUTE_MODEL=deepseek-v3.1
```

## MVP Scope

- Telegram bot via grammY.
- Binance market data via ccxt.
- BTC/USDT, ETH/USDT, SOL/USDT.
- SQLite memory with reply context.
- Proactive alert scheduler for watchlists.
- `/start` enables default auto-monitoring for BTC/ETH/SOL.
- Market discovery scanner can scan top-volume USDT markets automatically.
- Risk-first signal decisions.
- DeepSeek via OpenAI-compatible General Compute endpoint.

## Hard Rule

LLM never generates price levels or indicators. All numbers come from deterministic code.
