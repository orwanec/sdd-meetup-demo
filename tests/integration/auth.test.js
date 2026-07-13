const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');

describe('Authentication (Milestone 2)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('GET /auth/register renders form', async () => {
    const res = await request(app).get('/auth/register');

    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1>Register</h1>');
    expect(res.text).toContain('action="/auth/register"');
  });

  test('register rejects invalid email', async () => {
    const res = await request(app).post('/auth/register').type('form').send({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.text).toContain('Email must be a valid email address.');
  });

  test('register rejects short password', async () => {
    const res = await request(app).post('/auth/register').type('form').send({
      email: 'user@example.com',
      password: 'short',
    });

    expect(res.status).toBe(400);
    expect(res.text).toContain('at least 8 characters');
  });

  test('register rejects duplicate email', async () => {
    const agent = request.agent(app);
    await agent.post('/auth/register').type('form').send({
      email: 'dup@example.com',
      password: 'password123',
    });

    const res = await agent.post('/auth/register').type('form').send({
      email: 'dup@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.text).toContain('already registered');
  });

  test('register succeeds and redirects to login', async () => {
    const res = await request(app).post('/auth/register').type('form').send({
      email: 'new@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/auth/login?registered=1');
  });

  test('login rejects invalid credentials', async () => {
    const res = await request(app).post('/auth/login').type('form').send({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.text).toContain('Invalid credentials.');
  });

  test('login succeeds and session allows /dashboard', async () => {
    const agent = request.agent(app);

    await agent.post('/auth/register').type('form').send({
      email: 'session@example.com',
      password: 'password123',
    });

    const loginRes = await agent.post('/auth/login').type('form').send({
      email: 'session@example.com',
      password: 'password123',
    });

    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.location).toBe('/dashboard');

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.ok).toBe(true);
    expect(dashRes.body.user.email).toBe('session@example.com');
  });

  test('logout clears session', async () => {
    const agent = request.agent(app);

    await agent.post('/auth/register').type('form').send({
      email: 'logout@example.com',
      password: 'password123',
    });
    await agent.post('/auth/login').type('form').send({
      email: 'logout@example.com',
      password: 'password123',
    });

    const logoutRes = await agent.post('/auth/logout');
    expect(logoutRes.status).toBe(302);
    expect(logoutRes.headers.location).toBe('/auth/login');

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.status).toBe(302);
    expect(dashRes.headers.location).toBe('/auth/login');
  });
});

