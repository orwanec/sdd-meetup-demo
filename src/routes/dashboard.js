const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../db');

const router = express.Router();

function dbGet(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = req.session.user;
    const db = getDb();

    const statsRow = await dbGet(
      db,
      `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
        FROM tasks
        WHERE user_id = ?
      `,
      [user.id]
    );

    const stats = {
      total: Number(statsRow?.total || 0),
      open: Number(statsRow?.open || 0),
      completed: Number(statsRow?.completed || 0),
    };

    return res.status(200).render('dashboard/index', { user, stats });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

