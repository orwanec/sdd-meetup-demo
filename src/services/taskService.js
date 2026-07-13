const { getDb } = require('../db');
const { sanitizeString, sanitizeText } = require('../utils/validation');

function validateTitle(title) {
  const sanitized = sanitizeString(title);
  if (!sanitized) {
    return { ok: false, message: 'Title is required.' };
  }
  return { ok: true, title: sanitized };
}

function normalizeDescription(description) {
  if (typeof description !== 'string') return null;
  const sanitized = sanitizeText(description);
  return sanitized || null;
}

async function create(userId, title, description = null) {
  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) {
    const err = new Error(titleCheck.message);
    err.status = 400;
    throw err;
  }

  const db = getDb();
  const result = await dbRun(
    db,
    'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
    [userId, titleCheck.title, normalizeDescription(description), 'open']
  );

  return getById(result.lastID, userId);
}

async function getById(taskId, userId) {
  const db = getDb();
  const task = await dbGet(
    db,
    'SELECT id, user_id, title, description, status, created_at, completed_at FROM tasks WHERE id = ? AND user_id = ?',
    [taskId, userId]
  );

  if (!task) {
    const err = new Error('Task not found.');
    err.status = 404;
    throw err;
  }

  return task;
}

async function getAll(userId) {
  const db = getDb();
  return dbAll(
    db,
    'SELECT id, user_id, title, description, status, created_at, completed_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

async function getByStatus(userId, status) {
  if (!['open', 'completed'].includes(status)) {
    const err = new Error('Invalid status filter.');
    err.status = 400;
    throw err;
  }

  const db = getDb();
  return dbAll(
    db,
    'SELECT id, user_id, title, description, status, created_at, completed_at FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
    [userId, status]
  );
}

async function complete(taskId, userId) {
  const db = getDb();
  const task = await dbGet(
    db,
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
    [taskId, userId]
  );

  if (!task) {
    const err = new Error('Task not found.');
    err.status = 404;
    throw err;
  }

  await dbRun(
    db,
    "UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [taskId, userId]
  );

  return getById(taskId, userId);
}

async function getStats(userId) {
  const db = getDb();
  const statsRow = await dbGet(
    db,
    `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
      FROM tasks
      WHERE user_id = ?
    `,
    [userId]
  );

  return {
    total: Number(statsRow?.total || 0),
    open: Number(statsRow?.open || 0),
    completed: Number(statsRow?.completed || 0),
  };
}

module.exports = {
  create,
  getAll,
  getByStatus,
  complete,
  getStats,
  validateTitle,
};

function dbGet(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbRun(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
