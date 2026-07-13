const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getAll, getStats } = require('../services/taskService');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = req.session.user;
    const [stats, tasks] = await Promise.all([getStats(user.id), getAll(user.id)]);

    return res.status(200).render('dashboard/index', { user, stats, tasks });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
