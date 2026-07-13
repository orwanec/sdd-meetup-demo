const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getAll, getByStatus } = require('../services/taskService');

const router = express.Router();

router.get('/tasks', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.session.user.id;

    if (status && status !== 'all') {
      const tasks = await getByStatus(userId, status);
      return res.status(200).json(tasks);
    }

    const tasks = await getAll(userId);
    return res.status(200).json(tasks);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
