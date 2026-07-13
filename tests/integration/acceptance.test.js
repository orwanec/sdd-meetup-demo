const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');
const { postFormWithCsrf } = require('../helpers/http');

/**
 * End-to-end acceptance test mapping to specs/prd-001.md Section 8.
 * Validates the full MVP workflow without assistance.
 */
describe('PRD acceptance criteria (Milestone 7)', () => {
  const email = 'acceptance@example.com';
  const password = 'password123';

  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('user completes full MVP workflow per PRD Section 8', async () => {
    const agent = request.agent(app);

    // Register a new account with email and password
    const registerRes = await postFormWithCsrf(
      agent,
      '/auth/register',
      { email, password },
      '/auth/register'
    );
    expect(registerRes.status).toBe(302);
    expect(registerRes.headers.location).toBe('/auth/login?registered=1');

    // Login with registered credentials
    const loginRes = await postFormWithCsrf(
      agent,
      '/auth/login',
      { email, password },
      '/auth/login'
    );
    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.location).toBe('/dashboard');

    // View personalized dashboard with task summary
    const emptyDash = await agent.get('/dashboard');
    expect(emptyDash.status).toBe(200);
    expect(emptyDash.text).toContain(`Hello, ${email}!`);
    expect(emptyDash.text).toContain('Total tasks: <strong>0</strong>');
    expect(emptyDash.text).toContain('Open tasks: <strong>0</strong>');
    expect(emptyDash.text).toContain('Completed tasks: <strong>0</strong>');

    // Create a new task with title and description
    const createRes = await postFormWithCsrf(agent, '/tasks/create', {
      title: 'Ship MVP',
      description: 'Validate acceptance criteria',
    });
    expect(createRes.status).toBe(302);
    expect(createRes.headers.location).toBe('/dashboard');

    // View all created tasks in a list
    const dashWithTask = await agent.get('/dashboard');
    expect(dashWithTask.text).toContain('Ship MVP');
    expect(dashWithTask.text).toContain('Validate acceptance criteria');
    expect(dashWithTask.text).toContain('Total tasks: <strong>1</strong>');
    expect(dashWithTask.text).toContain('Open tasks: <strong>1</strong>');

    const apiRes = await agent.get('/api/tasks');
    expect(apiRes.body).toHaveLength(1);
    const taskId = apiRes.body[0].id;

    // Mark a task as completed
    const tokenMatch = dashWithTask.text.match(/name="csrf-token"\s+content="([^"]+)"/);
    const completeRes = await agent
      .post(`/tasks/${taskId}/complete`)
      .set('X-CSRF-Token', tokenMatch[1]);
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.success).toBe(true);

    // See updated task counts after completion
    const completedDash = await agent.get('/dashboard');
    expect(completedDash.text).toContain('Open tasks: <strong>0</strong>');
    expect(completedDash.text).toContain('Completed tasks: <strong>1</strong>');
    expect(completedDash.text).toContain('task-completed');

    // Logout securely
    const logoutRes = await postFormWithCsrf(agent, '/auth/logout', {}, '/dashboard');
    expect(logoutRes.status).toBe(302);
    expect(logoutRes.headers.location).toBe('/auth/login');

    const protectedDash = await agent.get('/dashboard');
    expect(protectedDash.status).toBe(302);
    expect(protectedDash.headers.location).toBe('/auth/login');

    // Login again and see previously created tasks
    const reloginRes = await postFormWithCsrf(
      agent,
      '/auth/login',
      { email, password },
      '/auth/login'
    );
    expect(reloginRes.status).toBe(302);
    expect(reloginRes.headers.location).toBe('/dashboard');

    const persistedDash = await agent.get('/dashboard');
    expect(persistedDash.text).toContain('Ship MVP');
    expect(persistedDash.text).toContain('Completed tasks: <strong>1</strong>');
  });
});
