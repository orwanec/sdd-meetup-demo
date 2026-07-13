/**
 * CSRF protection for form posts and JSON mutations.
 * Tokens are stored in the session and exposed to EJS via res.locals.csrfToken.
 * @module middleware/csrf
 */

const crypto = require('crypto');

/**
 * Generates a cryptographically random CSRF token.
 * @returns {string} 64-character hex string
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Ensures the session has a CSRF token, creating one if needed.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function ensureCsrfToken(req) {
  if (!req.session) {
    return null;
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }

  return req.session.csrfToken;
}

/**
 * Determines whether the client expects a JSON error response.
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function wantsJsonResponse(req) {
  if (req.path.startsWith('/api')) {
    return true;
  }

  if (/^\/tasks\/\d+\/complete$/.test(req.path)) {
    return true;
  }

  const accept = req.headers.accept || '';
  return accept.includes('application/json') && !accept.includes('text/html');
}

/**
 * Validates CSRF tokens on non-safe HTTP methods.
 * Safe methods (GET, HEAD, OPTIONS) pass through after attaching the token to locals.
 * @type {import('express').RequestHandler}
 */
function csrfProtection(req, res, next) {
  const token = ensureCsrfToken(req);
  res.locals.csrfToken = token;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const submitted =
    (req.body && req.body._csrf) || req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'];

  if (!submitted || submitted !== req.session.csrfToken) {
    if (wantsJsonResponse(req)) {
      return res.status(403).json({ success: false, error: 'Invalid CSRF token.' });
    }

    return res.status(403).send('Invalid CSRF token.');
  }

  return next();
}

module.exports = {
  csrfProtection,
  ensureCsrfToken,
};
