/**
 * In-memory developer mailbox for password reset messages (local/demo only).
 * @module services/mailboxService
 */

/** @type {Array<{ id: string, to: string, subject: string, body: string, resetUrl: string, sentAt: Date }>} */
let messages = [];

let nextId = 1;

/**
 * Stores a reset message in the in-memory mailbox.
 * @param {{ to: string, subject: string, body: string, resetUrl: string }} payload
 * @returns {{ id: string, to: string, subject: string, body: string, resetUrl: string, sentAt: Date }}
 */
function send({ to, subject, body, resetUrl }) {
  const message = {
    id: String(nextId++),
    to,
    subject,
    body,
    resetUrl,
    sentAt: new Date(),
  };

  messages.unshift(message);
  return message;
}

/**
 * Returns stored messages newest-first.
 * @returns {Array<{ id: string, to: string, subject: string, body: string, resetUrl: string, sentAt: Date }>}
 */
function list() {
  return [...messages];
}

/** Clears all stored messages (used in tests). */
function clear() {
  messages = [];
  nextId = 1;
}

module.exports = {
  send,
  list,
  clear,
};
