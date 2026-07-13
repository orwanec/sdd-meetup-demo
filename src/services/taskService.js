/**
 * Task CRUD operations and statistics.
 * @module services/taskService
 */

const { getDb } = require('../db');
const { sanitizeString, sanitizeText } = require('../utils/validation');

/**
 * Validates and sanitizes a task title.
 * @param {string} title
 * @returns {{ ok: true, title: string } | { ok: false, message: string }}
 */
function validateTitle(title) {
  const sanitized = sanitizeString(title);
  if (!sanitized) {
    return { ok: false, message: 'Title is required.' };
  }
  return { ok: true, title: sanitized };
}

/**
 * @param {string|null|undefined} description
 * @returns {string|null}
 */
function normalizeDescription(description) {
  if (typeof description !== 'string') return null;
  const sanitized = sanitizeText(description);
  return sanitized || null;
}

/**
 * Creates a new open task for the given user.
 * @param {number} userId
 * @param {string} title
 * @param {string|null} [description]
 * @returns {Promise<object>} Created task row
 */
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

/**
 * Fetches a single task owned by the user.
 * @param {number} taskId
 * @param {number} userId
 * @returns {Promise<object>}
 * @throws {Error & { status: number }} 404 if not found
 */
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

/**
 * Returns all tasks for a user, newest first.
 * @param {number} userId
 * @returns {Promise<object[]>}
 */
async function getAll(userId) {
  const db = getDb();
  return dbAll(
    db,
    'SELECT id, user_id, title, description, status, created_at, completed_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

/**
 * Returns tasks filtered by status (`open` or `completed`).
 * @param {number} userId
 * @param {'open'|'completed'} status
 * @returns {Promise<object[]>}
 */
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

/**
 * Marks a task as completed with a timestamp.
 * @param {number} taskId
 * @param {number} userId
 * @returns {Promise<object>} Updated task row
 */
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

/**
 * Aggregates task counts for dashboard display.
 * @param {number} userId
 * @returns {Promise<{ total: number, open: number, completed: number }>}
 */
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
