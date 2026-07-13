const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');

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

    await agent.post('/auth/register').type('form').send({
      email: 'root@example.com',
      password: 'password123',
    });
    await agent.post('/auth/login').type('form').send({
      email: 'root@example.com',
      password: 'password123',
    });

    const response = await agent.get('/');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/dashboard');
  });
});
