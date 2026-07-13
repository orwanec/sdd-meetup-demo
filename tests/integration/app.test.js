const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');
const { postFormWithCsrf } = require('../helpers/http');

describe('Express app', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('GET / redirects unauthenticated users to login', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/auth/login');
  });

  test('GET / redirects authenticated users to dashboard', async () => {
    const agent = request.agent(app);

    await postFormWithCsrf(
      agent,
      '/auth/register',
      {
        email: 'root@example.com',
        password: 'password123',
      },
      '/auth/register'
    );
    await postFormWithCsrf(
      agent,
      '/auth/login',
      {
        email: 'root@example.com',
        password: 'password123',
      },
      '/auth/login'
    );

    const response = await agent.get('/');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/dashboard');
  });
});
