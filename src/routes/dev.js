/**
 * Developer tools for local/demo use.
 * @module routes/dev
 */

const express = require('express');

const mailboxService = require('../services/mailboxService');

const router = express.Router();

router.get('/mailbox', (_req, res) => {
  res.status(200).render('dev/mailbox', {
    messages: mailboxService.list(),
  });
});

module.exports = router;
