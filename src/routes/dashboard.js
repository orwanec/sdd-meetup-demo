const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  // Minimal placeholder for Milestone 2 to prove session persistence.
  res.status(200).json({
    ok: true,
    user: req.session.user,
  });
});

module.exports = router;

