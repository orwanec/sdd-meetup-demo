const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { create, complete } = require('../services/taskService');

const router = express.Router();

router.get('/create', requireAuth, (_req, res) => {
  res.status(200).render('tasks/create', { error: null, title: '', description: '' });
});

router.post('/create', requireAuth, async (req, res) => {
  const { title, description } = req.body || {};

  try {
    await create(req.session.user.id, title, description);
    return res.redirect(302, '/dashboard');
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).render('tasks/create', {
      error: err.message || 'Task creation failed.',
      title: title || '',
      description: description || '',
    });
  }
});

router.post('/:id/complete', requireAuth, async (req, res) => {
  try {
    const task = await complete(Number(req.params.id), req.session.user.id);
    return res.status(200).json({ success: true, task });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, error: err.message || 'Task completion failed.' });
  }
});

module.exports = router;
