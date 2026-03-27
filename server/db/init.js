const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'daylog.db');
const SCHEMA  = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

let sqlDb = null;

function save() {
  fs.writeFileSync(DB_PATH, sqlDb.export());
}

// Thin wrapper that mirrors the better-sqlite3 API used in routes
const db = {
  prepare(sql) {
    return {
      all(...params) {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params.flat());
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },
      get(...params) {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params.flat());
        let row = null;
        if (stmt.step()) row = stmt.getAsObject();
        stmt.free();
        return row;
      },
      run(...params) {
        sqlDb.run(sql, params.flat());
        const changes = sqlDb.getRowsModified();
        const rowidRes = sqlDb.exec('SELECT last_insert_rowid()');
        const lastInsertRowid = rowidRes[0]?.values[0]?.[0] ?? 0;
        save();
        return { lastInsertRowid, changes };
      },
    };
  },

  exec(sql) {
    sqlDb.exec(sql);
    save();
  },
};

async function init() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    sqlDb = new SQL.Database();
  }
  sqlDb.exec(SCHEMA);
  // Migrations: safe to run on every start — ignored if column already exists
  try { sqlDb.exec('ALTER TABLE tasks ADD COLUMN time_spent INTEGER NOT NULL DEFAULT 0'); } catch {}
  try { sqlDb.exec('ALTER TABLE tasks ADD COLUMN timer_started_at TEXT'); } catch {}
  try { sqlDb.exec('ALTER TABLE tasks ADD COLUMN carried_from TEXT'); } catch {}
  // day_reviews table (new — exec the CREATE IF NOT EXISTS, no ALTER needed)
  sqlDb.exec(`CREATE TABLE IF NOT EXISTS day_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    went_well TEXT NOT NULL DEFAULT '',
    blockers  TEXT NOT NULL DEFAULT '',
    tomorrow  TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  save();
}

module.exports = { db, init };
