const crypto = require('crypto');
const request = require('supertest');
const { initDatabase, closeDatabase, getDb } = require('../../src/db');
const app = require('../../src/app');
const mailboxService = require('../../src/services/mailboxService');
const { postFormWithCsrf, registerAndLogin } = require('../helpers/http');

const CONFIRMATION_TEXT =
  'If an account exists for that email, you will receive reset instructions shortly.';

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function extractTokenFromUrl(resetUrl) {
  return resetUrl.split('/').pop();
}

describe('Password Reset (prd-002)', () => {
  beforeEach(async () => {
    await initDatabase();
    mailboxService.clear();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('login page contains forgot-password link', async () => {
    const res = await request(app).get('/auth/login');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Forgot password?');
    expect(res.text).toContain('/auth/forgot-password');
  });

  test('POST forgot-password (unknown email) shows uniform confirmation', async () => {
    const agent = request.agent(app);
    const res = await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'unknown@example.com' },
      '/auth/forgot-password'
    );

    expect(res.status).toBe(200);
    expect(res.text).toContain(CONFIRMATION_TEXT);
    expect(mailboxService.list()).toEqual([]);
  });

  test('POST forgot-password (known email) shows same confirmation text', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'known@example.com', password: 'password123' },
      '/auth/register'
    );

    const res = await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'known@example.com' },
      '/auth/forgot-password'
    );

    expect(res.status).toBe(200);
    expect(res.text).toContain(CONFIRMATION_TEXT);
  });

  test('known email enqueues reset URL in mailbox', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'mailbox@example.com', password: 'password123' },
      '/auth/register'
    );

    await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'mailbox@example.com' },
      '/auth/forgot-password'
    );

    const messages = mailboxService.list();
    expect(messages).toHaveLength(1);
    expect(messages[0].to).toBe('mailbox@example.com');
    expect(messages[0].resetUrl).toMatch(/\/auth\/reset-password\/[a-f0-9]+$/);
  });

  test('GET /dev/mailbox renders the reset link', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'devbox@example.com', password: 'password123' },
      '/auth/register'
    );
    await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'devbox@example.com' },
      '/auth/forgot-password'
    );

    const resetUrl = mailboxService.list()[0].resetUrl;
    const res = await request(app).get('/dev/mailbox');

    expect(res.status).toBe(200);
    expect(res.text).toContain(resetUrl);
    expect(res.text).toContain('devbox@example.com');
  });

  test('full reset flow: set password and login with new credentials', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'flow@example.com', password: 'password123' },
      '/auth/register'
    );
    await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'flow@example.com' },
      '/auth/forgot-password'
    );

    const token = extractTokenFromUrl(mailboxService.list()[0].resetUrl);
    const resetRes = await postFormWithCsrf(
      agent,
      `/auth/reset-password/${token}`,
      { password: 'newpassword123', password_confirm: 'newpassword123' },
      `/auth/reset-password/${token}`
    );

    expect(resetRes.status).toBe(302);
    expect(resetRes.headers.location).toBe('/auth/login?reset=1');

    const loginRes = await postFormWithCsrf(
      agent,
      '/auth/login',
      { email: 'flow@example.com', password: 'newpassword123' },
      '/auth/login'
    );

    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.location).toBe('/dashboard');
  });

  test('login with old password fails after reset', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'oldpass@example.com', password: 'password123' },
      '/auth/register'
    );
    await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'oldpass@example.com' },
      '/auth/forgot-password'
    );

    const token = extractTokenFromUrl(mailboxService.list()[0].resetUrl);
    await postFormWithCsrf(
      agent,
      `/auth/reset-password/${token}`,
      { password: 'newpassword123', password_confirm: 'newpassword123' },
      `/auth/reset-password/${token}`
    );

    const loginRes = await postFormWithCsrf(
      agent,
      '/auth/login',
      { email: 'oldpass@example.com', password: 'password123' },
      '/auth/login'
    );

    expect(loginRes.status).toBe(401);
    expect(loginRes.text).toContain('Invalid credentials.');
  });

  test('reset link cannot be reused after successful password change', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'reuse@example.com', password: 'password123' },
      '/auth/register'
    );
    await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'reuse@example.com' },
      '/auth/forgot-password'
    );

    const token = extractTokenFromUrl(mailboxService.list()[0].resetUrl);
    await postFormWithCsrf(
      agent,
      `/auth/reset-password/${token}`,
      { password: 'newpassword123', password_confirm: 'newpassword123' },
      `/auth/reset-password/${token}`
    );

    const reuseRes = await agent.get(`/auth/reset-password/${token}`);
    expect(reuseRes.status).toBe(200);
    expect(reuseRes.text).toContain('no longer valid');
  });

  test('expired reset link shows error', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'expired@example.com', password: 'password123' },
      '/auth/register'
    );
    await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'expired@example.com' },
      '/auth/forgot-password'
    );

    const token = extractTokenFromUrl(mailboxService.list()[0].resetUrl);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const db = getDb();
    await dbRun(
      db,
      'UPDATE password_reset_tokens SET expires_at = ? WHERE token_hash = ?',
      ['2000-01-01T00:00:00.000Z', tokenHash]
    );

    const res = await agent.get(`/auth/reset-password/${token}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('no longer valid');
    expect(res.text).toContain('/auth/forgot-password');
  });

  test('invalid reset link shows error', async () => {
    const res = await request(app).get('/auth/reset-password/not-a-valid-token');

    expect(res.status).toBe(200);
    expect(res.text).toContain('no longer valid');
    expect(res.text).toContain('/auth/forgot-password');
  });

  test('user retains tasks after password reset', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'tasks@example.com', 'password123');

    await postFormWithCsrf(agent, '/tasks/create', { title: 'Keep this task' });

    await postFormWithCsrf(
      agent,
      '/auth/forgot-password',
      { email: 'tasks@example.com' },
      '/auth/forgot-password'
    );

    const token = extractTokenFromUrl(mailboxService.list()[0].resetUrl);
    await postFormWithCsrf(
      agent,
      `/auth/reset-password/${token}`,
      { password: 'newpassword123', password_confirm: 'newpassword123' },
      `/auth/reset-password/${token}`
    );

    await postFormWithCsrf(
      agent,
      '/auth/login',
      { email: 'tasks@example.com', password: 'newpassword123' },
      '/auth/login'
    );

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.status).toBe(200);
    expect(dashRes.text).toContain('Keep this task');
  });
});
