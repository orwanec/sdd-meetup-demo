const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');
const { postFormWithCsrf, registerAndLogin } = require('../helpers/http');

/**
 * Performance targets from tech-plan-001.md Section 11.
 */
describe('Performance targets (Milestone 7)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('dashboard loads within 2 seconds', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'perf@example.com');

    const start = Date.now();
    const res = await agent.get('/dashboard');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(2000);
  });

  test('registration completes within 800ms', async () => {
    const agent = request.agent(app);

    const start = Date.now();
    const res = await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'reg-perf@example.com', password: 'password123' },
      '/auth/register'
    );
    const elapsed = Date.now() - start;

    expect(res.status).toBe(302);
    expect(elapsed).toBeLessThan(800);
  });

  test('login completes within 600ms', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      { email: 'login-perf@example.com', password: 'password123' },
      '/auth/register'
    );

    const start = Date.now();
    const res = await postFormWithCsrf(
      agent,
      '/auth/login',
      { email: 'login-perf@example.com', password: 'password123' },
      '/auth/login'
    );
    const elapsed = Date.now() - start;

    expect(res.status).toBe(302);
    expect(elapsed).toBeLessThan(600);
  });

  test('task creation completes within 500ms', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'task-perf@example.com');

    const start = Date.now();
    const res = await postFormWithCsrf(agent, '/tasks/create', {
      title: 'Fast task',
      description: 'Performance check',
    });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(302);
    expect(elapsed).toBeLessThan(500);
  });

  test('task completion completes within 300ms', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'complete-perf@example.com');
    await postFormWithCsrf(agent, '/tasks/create', { title: 'Complete fast' });

    const apiRes = await agent.get('/api/tasks');
    const taskId = apiRes.body[0].id;
    const dashRes = await agent.get('/dashboard');
    const tokenMatch = dashRes.text.match(/name="csrf-token"\s+content="([^"]+)"/);

    const start = Date.now();
    const res = await agent
      .post(`/tasks/${taskId}/complete`)
      .set('X-CSRF-Token', tokenMatch[1]);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(300);
  });
});
