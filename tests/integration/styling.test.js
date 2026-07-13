const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');

async function registerAndLogin(agent, email = 'style@example.com') {
  await agent.post('/auth/register').type('form').send({
    email,
    password: 'password123',
  });
  await agent.post('/auth/login').type('form').send({
    email,
    password: 'password123',
  });
}

describe('Styling (Milestone 5)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('GET /css/style.css serves stylesheet', async () => {
    const res = await request(app).get('/css/style.css');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/css/);
    expect(res.text).toContain('.container');
    expect(res.text).toContain('@media');
  });

  test('login page links stylesheet and uses auth layout classes', async () => {
    const res = await request(app).get('/auth/login');

    expect(res.status).toBe(200);
    expect(res.text).toContain('href="/css/style.css"');
    expect(res.text).toContain('page page-auth');
    expect(res.text).toContain('auth-card');
    expect(res.text).toContain('form-group');
    expect(res.text).toContain('btn btn-primary');
  });

  test('register page links stylesheet and uses auth layout classes', async () => {
    const res = await request(app).get('/auth/register');

    expect(res.status).toBe(200);
    expect(res.text).toContain('href="/css/style.css"');
    expect(res.text).toContain('page page-auth');
    expect(res.text).toContain('auth-card');
  });

  test('dashboard page links stylesheet and uses dashboard layout classes', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const res = await agent.get('/dashboard');

    expect(res.status).toBe(200);
    expect(res.text).toContain('href="/css/style.css"');
    expect(res.text).toContain('page page-dashboard');
    expect(res.text).toContain('stats-grid');
    expect(res.text).toContain('stat-card');
  });

  test('create task page links stylesheet and uses form layout classes', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const res = await agent.get('/tasks/create');

    expect(res.status).toBe(200);
    expect(res.text).toContain('href="/css/style.css"');
    expect(res.text).toContain('page page-form');
    expect(res.text).toContain('form-card');
    expect(res.text).toContain('form-group');
  });

  test('task list items expose status classes for styling', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    await agent.post('/tasks/create').type('form').send({ title: 'Styled task' });

    const res = await agent.get('/dashboard');

    expect(res.text).toContain('task-item task-open');
    expect(res.text).toContain('btn btn-secondary');
  });
});
