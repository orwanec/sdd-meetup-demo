const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  return db;
}

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
