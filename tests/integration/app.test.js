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

  test('GET / returns 200', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
  });

  test('GET / returns expected JSON shape', async () => {
    const response = await request(app).get('/');

    expect(response.body).toEqual({
      status: 'ok',
      message: 'TaskFlow server running',
    });
  });
});
