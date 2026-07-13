const request = require('supertest');
const { initDatabase, closeDatabase, getDb } = require('../../src/db');
const app = require('../../src/app');
const { postFormWithCsrf, registerAndLogin } = require('../helpers/http');

describe('Security hardening (Milestone 6)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('POST without CSRF token is rejected', async () => {
    const res = await request(app).post('/auth/login').type('form').send({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.text).toContain('Invalid CSRF token');
  });

  test('passwords are stored hashed, never plaintext', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(agent, '/auth/register', {
      email: 'hash@example.com',
      password: 'password123',
    });

    const db = getDb();
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT password_hash FROM users WHERE email = ?', ['hash@example.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(user.password_hash).not.toBe('password123');
    expect(user.password_hash).toMatch(/^\$2[aby]\$/);
  });

  test('security headers are set via helmet', async () => {
    const res = await request(app).get('/auth/login');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  test('session cookie is httpOnly', async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get('/auth/login');

    const sessionHeader = loginPage.headers['set-cookie']?.find((value) =>
      value.startsWith('taskflow.sid=')
    );
    expect(sessionHeader).toBeDefined();
    expect(sessionHeader.toLowerCase()).toContain('httponly');
  });

  test('task creation sanitizes dangerous input before storage', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'sanitize@example.com');

    await postFormWithCsrf(agent, '/tasks/create', {
      title: '  Safe title\0  ',
      description: 'Notes\0here',
    });

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.text).toContain('Safe title');
    expect(dashRes.text).not.toContain('\0');
  });

  test('POST /tasks/:id/complete requires CSRF token header', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'csrf-api@example.com');

    await postFormWithCsrf(agent, '/tasks/create', { title: 'Complete me' });
    const apiRes = await agent.get('/api/tasks');
    const taskId = apiRes.body[0].id;

    const withoutToken = await agent.post(`/tasks/${taskId}/complete`);
    expect(withoutToken.status).toBe(403);

    const tokenRes = await agent.get('/dashboard');
    const tokenMatch = tokenRes.text.match(/name="csrf-token"\s+content="([^"]+)"/);
    expect(tokenMatch).toBeTruthy();

    const withToken = await agent
      .post(`/tasks/${taskId}/complete`)
      .set('X-CSRF-Token', tokenMatch[1]);
    expect(withToken.status).toBe(200);
    expect(withToken.body.success).toBe(true);
  });
});
