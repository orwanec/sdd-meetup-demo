/**
 * Input validation and sanitization helpers.
 * @module utils/validation
 */

/**
 * Checks whether a string looks like a valid email address.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Simple but effective email check for MVP (not fully RFC-compliant).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Normalizes email for storage and lookup (trim + lowercase).
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Trims, strips null bytes, and caps length for short text fields.
 * @param {string} value
 * @param {number} [maxLength=200]
 * @returns {string}
 */
function sanitizeString(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value.replace(/\0/g, '').trim().slice(0, maxLength);
}

/**
 * Trims, strips null bytes, and caps length for longer text fields.
 * @param {string} value
 * @param {number} [maxLength=2000]
 * @returns {string}
 */
function sanitizeText(value, maxLength = 2000) {
  if (typeof value !== 'string') return '';
  return value.replace(/\0/g, '').trim().slice(0, maxLength);
}

module.exports = {
  isValidEmail,
  normalizeEmail,
  sanitizeString,
  sanitizeText,
};
