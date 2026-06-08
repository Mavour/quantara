CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_chat_id TEXT NOT NULL UNIQUE,
  risk_per_trade REAL NOT NULL DEFAULT 1.0,
  default_timeframe TEXT NOT NULL DEFAULT '5m',
  preferred_exchange TEXT NOT NULL DEFAULT 'binance',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS telegram_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_chat_id TEXT NOT NULL,
  telegram_message_id INTEGER NOT NULL,
  bot_message_id INTEGER,
  direction TEXT NOT NULL,
  text TEXT,
  context_type TEXT,
  context_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS signal_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_chat_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  strategy TEXT NOT NULL,
  action TEXT NOT NULL,
  entry_min REAL,
  entry_max REAL,
  stop_loss REAL,
  take_profit_json TEXT,
  invalidation TEXT,
  confidence INTEGER,
  risk_reward REAL,
  risk_level TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  market_data_json TEXT,
  features_json TEXT,
  reasoning_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS watchlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  symbol TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'scan',
  timeframe TEXT NOT NULL DEFAULT '5m',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trade_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  signal_snapshot_id INTEGER REFERENCES signal_snapshots(id),
  user_decision TEXT,
  entry_price REAL,
  exit_price REAL,
  pnl REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS strategy_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  win_rate REAL,
  avg_rr REAL,
  max_drawdown REAL,
  profit_factor REAL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(strategy_name, symbol, timeframe)
);
