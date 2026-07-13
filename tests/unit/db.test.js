const fs = require('fs');
const os = require('os');
const path = require('path');
const { initDatabase, getDb, closeDatabase } = require('../../src/db');

describe('Database initialization', () => {
  afterEach(async () => {
    await closeDatabase();
  });

  test('initDatabase creates users table', async () => {
    await initDatabase();

    const db = getDb();
    const tables = await queryTables(db);

    expect(tables).toContain('users');
  });

  test('initDatabase creates tasks table', async () => {
    await initDatabase();

    const db = getDb();
    const tables = await queryTables(db);

    expect(tables).toContain('tasks');
  });

  test('initDatabase creates sessions table', async () => {
    await initDatabase();

    const db = getDb();
    const tables = await queryTables(db);

    expect(tables).toContain('sessions');
  });

  test('initDatabase creates task indexes', async () => {
    await initDatabase();

    const db = getDb();
    const indexes = await queryIndexes(db);

    expect(indexes).toContain('idx_tasks_user_id');
    expect(indexes).toContain('idx_tasks_status');
  });

  test('initDatabase is idempotent', async () => {
    await initDatabase();
    await expect(initDatabase()).resolves.toBeDefined();

    const db = getDb();
    const tables = await queryTables(db);

    expect(tables).toEqual(expect.arrayContaining(['users', 'tasks', 'sessions']));
  });

  test('getDb returns a usable connection after init', async () => {
    await initDatabase();

    const db = getDb();
    const result = await queryAll(db, 'SELECT 1 AS value');

    expect(result).toEqual([{ value: 1 }]);
  });

  test('initDatabase creates database file at configured path', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-test-'));
    const dbPath = path.join(tempDir, 'taskflow.db');
    process.env.DB_PATH = dbPath;

    await initDatabase();

    expect(fs.existsSync(dbPath)).toBe(true);

    fs.rmSync(tempDir, { recursive: true, force: true });
    process.env.DB_PATH = ':memory:';
  });
});

function queryTables(db) {
  return queryAll(
    db,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
  ).then((rows) => rows.map((row) => row.name));
}

function queryIndexes(db) {
  return queryAll(db, "SELECT name FROM sqlite_master WHERE type = 'index'").then((rows) =>
    rows.map((row) => row.name)
  );
}

function queryAll(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
