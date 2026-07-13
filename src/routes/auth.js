/**
 * Authentication route handlers — registration, login, logout.
 * Maps to PRD requirements 7.1, 7.2, and 7.5.
 * @module routes/auth
 */

const express = require('express');

const { register, login } = require('../services/authService');

const router = express.Router();

router.get('/register', (_req, res) => {
  res.status(200).render('auth/register', { error: null, email: '' });
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};

  try {
    await register(email, password);
    return res.redirect(302, '/auth/login?registered=1');
  } catch (err) {
    const status = err.status || 400;
    if (status === 409) {
      return res.status(409).render('auth/register', {
        error: err.message || 'Email already exists.',
        email: email || '',
      });
    }
    return res.status(status).render('auth/register', {
      error: err.message || 'Registration failed.',
      email: email || '',
    });
  }
});

router.get('/login', (req, res) => {
  const message = req.query && req.query.registered ? 'Registration successful. Please login.' : null;
  res.status(200).render('auth/login', { error: null, message, email: '' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const user = await login(email, password);
    req.session.user = { id: user.id, email: user.email };
    return res.redirect(302, '/dashboard');
  } catch (err) {
    const status = err.status || 401;
    return res.status(status).render('auth/login', {
      error: err.message || 'Invalid credentials.',
      message: null,
      email: email || '',
    });
  }
});

router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.redirect(302, '/auth/login');
  }

  req.session.destroy(() => {
    res.redirect(302, '/auth/login');
  });
});

module.exports = router;
