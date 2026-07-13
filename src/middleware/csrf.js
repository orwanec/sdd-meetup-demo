const crypto = require('crypto');

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function ensureCsrfToken(req) {
  if (!req.session) {
    return null;
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }

  return req.session.csrfToken;
}

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
