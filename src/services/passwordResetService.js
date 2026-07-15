/**
 * Password reset token lifecycle and orchestration.
 * @module services/passwordResetService
 */

const crypto = require('crypto');

const { getDb } = require('../db');
const { isValidEmail, normalizeEmail } = require('../utils/validation');
const { updatePassword } = require('./authService');
const mailboxService = require('./mailboxService');

const TOKEN_BYTES = 32;
const EXPIRY_MS = 30 * 60 * 1000;

function hashToken(plainToken) {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

function getBaseUrl() {
  return process.env.APP_BASE_URL || 'http://localhost:3000';
}

/**
 * Deletes unused reset tokens for a user before issuing a new link.
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function invalidateTokensForUser(userId) {
  const db = getDb();
  await dbRun(db, 'DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL', [
    userId,
  ]);
}

/**
 * Starts a password reset for a valid email address.
 * Always returns success for valid email format (no enumeration).
 * @param {string} email
 * @returns {Promise<{ ok: true }>}
 * @throws {Error & { status?: number }} On invalid email format
 */
async function requestReset(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    const err = new Error('Email must be a valid email address.');
    err.status = 400;
    throw err;
  }

  const user = await findUserByEmail(normalized);
  if (user) {
    const plainToken = generateToken();
    const tokenHash = hashToken(plainToken);
    const expiresAt = new Date(Date.now() + EXPIRY_MS).toISOString();

    await invalidateTokensForUser(user.id);

    const db = getDb();
    await dbRun(
      db,
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `${getBaseUrl()}/auth/reset-password/${plainToken}`;
    mailboxService.send({
      to: user.email,
      subject: 'Reset your TaskFlow password',
      body: `Your password reset link expires in 30 minutes.\n\nReset your password: ${resetUrl}`,
      resetUrl,
    });
  }

  return { ok: true };
}

/**
 * Finds a valid, unexpired, unused token and its user.
 * @param {string} plainToken
 * @returns {Promise<{ tokenId: number, userId: number, email: string } | null>}
 */
async function findValidToken(plainToken) {
  if (typeof plainToken !== 'string' || !plainToken) {
    return null;
  }

  const tokenHash = hashToken(plainToken);
  const db = getDb();
  const row = await dbGet(
    db,
    `SELECT t.id, t.user_id, t.expires_at, t.used_at, u.email
     FROM password_reset_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ?`,
    [tokenHash]
  );

  if (!row || row.used_at) {
    return null;
  }

  if (new Date(row.expires_at) <= new Date()) {
    return null;
  }

  return {
    tokenId: row.id,
    userId: row.user_id,
    email: row.email,
  };
}

/**
 * Sets a new password using a valid reset token and marks the token used.
 * @param {string} plainToken
 * @param {string} newPassword
 * @returns {Promise<{ ok: true, email: string }>}
 * @throws {Error & { code?: string }} When token is invalid, expired, or used
 */
async function resetPassword(plainToken, newPassword) {
  const tokenData = await findValidToken(plainToken);
  if (!tokenData) {
    const err = new Error('This reset link is no longer valid.');
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  await updatePassword(tokenData.userId, newPassword);

  const db = getDb();
  await dbRun(db, 'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [
    tokenData.tokenId,
  ]);

  return { ok: true, email: tokenData.email };
}

async function findUserByEmail(email) {
  const db = getDb();
  return dbGet(db, 'SELECT id, email FROM users WHERE email = ?', [email]);
}

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

module.exports = {
  requestReset,
  findValidToken,
  resetPassword,
  invalidateTokensForUser,
};
