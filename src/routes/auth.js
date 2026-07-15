/**
 * Authentication route handlers — registration, login, logout.
 * Maps to PRD requirements 7.1, 7.2, and 7.5.
 * @module routes/auth
 */

const express = require('express');

const { register, login } = require('../services/authService');
const passwordResetService = require('../services/passwordResetService');

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
  let message = null;
  if (req.query && req.query.registered) {
    message = 'Registration successful. Please login.';
  } else if (req.query && req.query.reset) {
    message = 'Your password was updated. Please log in with your new password.';
  }

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

router.get('/forgot-password', (_req, res) => {
  res.status(200).render('auth/forgot-password', { error: null, email: '' });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};

  try {
    await passwordResetService.requestReset(email);
    return res.status(200).render('auth/forgot-password-sent');
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).render('auth/forgot-password', {
      error: err.message || 'Unable to process reset request.',
      email: email || '',
    });
  }
});

router.get('/reset-password/:token', async (req, res) => {
  const token = req.params.token;
  const tokenData = await passwordResetService.findValidToken(token);

  if (!tokenData) {
    return res.status(200).render('auth/reset-link-invalid');
  }

  return res.status(200).render('auth/reset-password', {
    token,
    error: null,
  });
});

router.post('/reset-password/:token', async (req, res) => {
  const token = req.params.token;
  const { password, password_confirm: passwordConfirm } = req.body || {};

  if (passwordConfirm && password !== passwordConfirm) {
    const tokenData = await passwordResetService.findValidToken(token);
    if (!tokenData) {
      return res.status(200).render('auth/reset-link-invalid');
    }

    return res.status(400).render('auth/reset-password', {
      token,
      error: 'Passwords do not match.',
    });
  }

  try {
    await passwordResetService.resetPassword(token, password);
    return res.redirect(302, '/auth/login?reset=1');
  } catch (err) {
    if (err.code === 'INVALID_TOKEN') {
      return res.status(200).render('auth/reset-link-invalid');
    }

    const tokenData = await passwordResetService.findValidToken(token);
    if (!tokenData) {
      return res.status(200).render('auth/reset-link-invalid');
    }

    const status = err.status || 400;
    return res.status(status).render('auth/reset-password', {
      token,
      error: err.message || 'Unable to reset password.',
    });
  }
});

module.exports = router;
