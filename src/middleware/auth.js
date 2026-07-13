/**
 * Session authentication middleware.
 * Redirects unauthenticated browser requests to login.
 * @module middleware/auth
 */

/**
 * Requires an authenticated session (`req.session.user`).
 * Sets no-cache headers to prevent back-button access after logout.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  // Prevent browsers from caching authenticated pages.
  // Otherwise, after logout the back button may show a cached page.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.session && req.session.user) {
    return next();
  }

  return res.redirect('/auth/login');
}

module.exports = {
  requireAuth,
};
