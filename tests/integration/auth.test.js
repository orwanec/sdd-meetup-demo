const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');
const { postFormWithCsrf } = require('../helpers/http');

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
    expect(res.text).toContain('Register</h1>');
    expect(res.text).toContain('action="/auth/register"');
    expect(res.text).toContain('name="_csrf"');
  });

  test('register rejects invalid email', async () => {
    const agent = request.agent(app);
    const res = await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'not-an-email',
        password: 'password123',
      },
      '/auth/register'
    );

    expect(res.status).toBe(400);
    expect(res.text).toContain('Email must be a valid email address.');
  });

  test('register rejects short password', async () => {
    const agent = request.agent(app);
    const res = await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'user@example.com',
        password: 'short',
      },
      '/auth/register'
    );

    expect(res.status).toBe(400);
    expect(res.text).toContain('at least 8 characters');
  });

  test('register rejects duplicate email', async () => {
    const agent = request.agent(app);
    await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'dup@example.com',
        password: 'password123',
      },
      '/auth/register'
    );

    const res = await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'dup@example.com',
        password: 'password123',
      },
      '/auth/register'
    );

    expect(res.status).toBe(409);
    expect(res.text).toContain('already registered');
  });

  test('register succeeds and redirects to login', async () => {
    const agent = request.agent(app);
    const res = await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'new@example.com',
        password: 'password123',
      },
      '/auth/register'
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/auth/login?registered=1');
  });

  test('login rejects invalid credentials', async () => {
    const agent = request.agent(app);
    const res = await postFormWithCsrf(
      agent,
      '/auth/login',
      {
        email: 'missing@example.com',
        password: 'password123',
      },
      '/auth/login'
    );

    expect(res.status).toBe(401);
    expect(res.text).toContain('Invalid credentials.');
  });

  test('login succeeds and session allows /dashboard', async () => {
    const agent = request.agent(app);

    await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'session@example.com',
        password: 'password123',
      },
      '/auth/register'
    );

    const loginRes = await postFormWithCsrf(
      agent,
      '/auth/login',
      {
        email: 'session@example.com',
        password: 'password123',
      },
      '/auth/login'
    );

    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.location).toBe('/dashboard');

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.status).toBe(200);
    expect(dashRes.headers['cache-control']).toContain('no-store');
    expect(dashRes.text).toContain('Dashboard</h1>');
    expect(dashRes.text).toContain('Hello, session@example.com!');
    expect(dashRes.text).toContain('Total tasks: <strong>0</strong>');
    expect(dashRes.text).toContain('Open tasks: <strong>0</strong>');
    expect(dashRes.text).toContain('Completed tasks: <strong>0</strong>');
  });

  test('logout clears session', async () => {
    const agent = request.agent(app);

    await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'logout@example.com',
        password: 'password123',
      },
      '/auth/register'
    );
    await postFormWithCsrf(
      agent,
      '/auth/login',
      {
        email: 'logout@example.com',
        password: 'password123',
      },
      '/auth/login'
    );

    const logoutRes = await postFormWithCsrf(agent, '/auth/logout', {}, '/dashboard');
    expect(logoutRes.status).toBe(302);
    expect(logoutRes.headers.location).toBe('/auth/login');

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.status).toBe(302);
    expect(dashRes.headers.location).toBe('/auth/login');
  });
});
