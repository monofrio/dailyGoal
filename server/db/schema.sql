CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  completed   INTEGER NOT NULL DEFAULT 0,
  priority    TEXT    NOT NULL DEFAULT 'normal',
  tags        TEXT    NOT NULL DEFAULT '',
  position         INTEGER NOT NULL DEFAULT 0,
  time_spent       INTEGER NOT NULL DEFAULT 0,
  timer_started_at TEXT,
  carried_from     TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS day_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL UNIQUE,
  notes       TEXT    NOT NULL DEFAULT '',
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS day_reviews (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  date         TEXT    NOT NULL UNIQUE,
  went_well    TEXT    NOT NULL DEFAULT '',
  blockers     TEXT    NOT NULL DEFAULT '',
  tomorrow     TEXT    NOT NULL DEFAULT '',
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_day_logs_date ON day_logs(date);
