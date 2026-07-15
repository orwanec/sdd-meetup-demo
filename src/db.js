/**
 * SQLite database initialization and schema management.
 * Creates users, tasks, and sessions tables on first run.
 * @module db
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

/** @type {import('sqlite3').Database | null} */
let db = null;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire TIMESTAMP NOT NULL,
    UNIQUE(sid)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  'CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_reset_tokens_token_hash ON password_reset_tokens(token_hash)',
];

function openDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else resolve(database);
    });
  });
}

function runStatement(database, sql) {
  return new Promise((resolve, reject) => {
    database.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function runSchema(database) {
  for (const statement of SCHEMA_STATEMENTS) {
    await runStatement(database, statement);
  }
}

function closeDatabaseConnection(database) {
  return new Promise((resolve, reject) => {
    database.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Opens (or reuses) the SQLite connection and applies schema migrations.
 * Creates the data directory when using a file-based DB_PATH.
 * @returns {Promise<import('sqlite3').Database>}
 */
async function initDatabase() {
  const dbPath = process.env.DB_PATH || './data/taskflow.db';

  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
  }

  if (db) {
    await runSchema(db);
    return db;
  }

  db = await openDatabase(dbPath);
  await runSchema(db);
  return db;
}

/**
 * Returns the active database connection.
 * @returns {import('sqlite3').Database}
 * @throws {Error} If initDatabase() has not been called
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  return db;
}

/**
 * Closes the database connection and resets the module singleton.
 * @returns {Promise<void>}
 */
async function closeDatabase() {
  if (!db) {
    return;
  }

  await closeDatabaseConnection(db);
  db = null;
}

module.exports = {
  initDatabase,
  getDb,
  closeDatabase,
};
