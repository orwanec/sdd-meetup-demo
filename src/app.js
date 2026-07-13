/**
 * Express application factory for TaskFlow.
 * Configures middleware (Helmet, sessions, CSRF), static assets, and route mounting.
 * @module app
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const taskRoutes = require('./routes/tasks');
const apiRoutes = require('./routes/api');
const { csrfProtection } = require('./middleware/csrf');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    hsts: isProduction,
  })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    name: 'taskflow.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: Number.parseInt(process.env.SESSION_TIMEOUT || '3600000', 10),
    },
  })
);

app.use(csrfProtection);

/** Root redirect — dashboard if authenticated, otherwise login. */
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(302, '/dashboard');
  }

  return res.redirect(302, '/auth/login');
});

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/tasks', taskRoutes);
app.use('/api', apiRoutes);

module.exports = app;
