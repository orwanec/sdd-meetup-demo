/**
 * Authentication business logic — registration and login.
 * @module services/authService
 */

const { getDb } = require('../db');
const { comparePassword, hashPassword } = require('./passwordService');
const { isValidEmail, normalizeEmail } = require('../utils/validation');

/**
 * Validates password meets MVP requirements (min 8 characters).
 * @param {string} password
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
function validatePassword(password) {
  if (typeof password !== 'string' || !password) {
    return { ok: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters.' };
  }
  return { ok: true };
}

/**
 * Validates email format and uniqueness.
 * @param {string} email
 * @returns {Promise<{ ok: true, email: string } | { ok: false, message: string, status?: number }>}
 */
async function validateEmail(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, message: 'Email must be a valid email address.' };
  }

  const db = getDb();
  const existing = await dbGet(db, 'SELECT id FROM users WHERE email = ?', [normalized]);
  if (existing) {
    return { ok: false, status: 409, message: 'Email is already registered.' };
  }

  return { ok: true, email: normalized };
}

/**
 * Registers a new user with hashed password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ id: number, email: string }>}
 * @throws {Error & { status?: number, code?: string }} On validation or duplicate email
 */
async function register(email, password) {
  const emailCheck = await validateEmail(email);
  if (!emailCheck.ok) {
    const err = new Error(emailCheck.message);
    err.code = 'VALIDATION_EMAIL';
    err.status = emailCheck.status || 400;
    throw err;
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    const err = new Error(passwordCheck.message);
    err.code = 'VALIDATION_PASSWORD';
    err.status = 400;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const db = getDb();

  try {
    const result = await dbRun(db, 'INSERT INTO users (email, password_hash) VALUES (?, ?)', [
      emailCheck.email,
      passwordHash,
    ]);

    return { id: result.lastID, email: emailCheck.email };
  } catch (e) {
    // Race-condition safety: unique constraint at DB level.
    if (String(e && e.message).toLowerCase().includes('unique')) {
      const err = new Error('Email is already registered.');
      err.code = 'DUPLICATE_EMAIL';
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

/**
 * Authenticates a user by email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ id: number, email: string }>}
 * @throws {Error & { status?: number, code?: string }} On invalid credentials
 */
async function login(email, password) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    const err = new Error('Invalid credentials.');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  if (typeof password !== 'string' || !password) {
    const err = new Error('Invalid credentials.');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  const db = getDb();
  const user = await dbGet(db, 'SELECT id, email, password_hash FROM users WHERE email = ?', [
    normalized,
  ]);

  if (!user) {
    const err = new Error('Invalid credentials.');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
    const err = new Error('Invalid credentials.');
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  return { id: user.id, email: user.email };
}

/**
 * Updates a user's password after validation and hashing.
 * @param {number} userId
 * @param {string} password
 * @returns {Promise<void>}
 * @throws {Error & { status?: number, code?: string }} On validation failure or missing user
 */
async function updatePassword(userId, password) {
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    const err = new Error(passwordCheck.message);
    err.code = 'VALIDATION_PASSWORD';
    err.status = 400;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const db = getDb();
  const result = await dbRun(db, 'UPDATE users SET password_hash = ? WHERE id = ?', [
    passwordHash,
    userId,
  ]);

  if (result.changes === 0) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
}

module.exports = {
  register,
  login,
  updatePassword,
  validateEmail,
  validatePassword,
};

function dbGet(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
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
