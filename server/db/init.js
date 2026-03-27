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
    sqlDb.exec(SCHEMA);
    save();
  }
}

module.exports = { db, init };
