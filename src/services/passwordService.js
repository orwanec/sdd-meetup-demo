/**
 * Password hashing and verification using bcryptjs.
 * @module services/passwordService
 */

const bcrypt = require('bcryptjs');

/** Bcrypt cost factor (10 rounds). */
const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password for storage.
 * @param {string} password
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
