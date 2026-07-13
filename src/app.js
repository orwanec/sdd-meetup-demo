require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'TaskFlow server running',
  });
});

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

module.exports = app;
