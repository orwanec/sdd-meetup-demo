const request = require('supertest');
const { initDatabase, closeDatabase } = require('../../src/db');
const app = require('../../src/app');

async function registerAndLogin(agent, email = 'tasks@example.com') {
  await agent.post('/auth/register').type('form').send({
    email,
    password: 'password123',
  });
  await agent.post('/auth/login').type('form').send({
    email,
    password: 'password123',
  });
}

describe('Task Management (Milestone 4)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('GET /tasks/create requires authentication', async () => {
    const res = await request(app).get('/tasks/create');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/auth/login');
  });

  test('GET /tasks/create renders form for authenticated user', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const res = await agent.get('/tasks/create');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Create Task</h1>');
    expect(res.text).toContain('action="/tasks/create"');
  });

  test('POST /tasks/create rejects empty title', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const res = await agent.post('/tasks/create').type('form').send({
      title: '   ',
      description: 'Optional notes',
    });

    expect(res.status).toBe(400);
    expect(res.text).toContain('Title is required.');
  });

  test('POST /tasks/create creates task with title only', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const res = await agent.post('/tasks/create').type('form').send({
      title: 'Buy groceries',
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.text).toContain('Buy groceries');
    expect(dashRes.text).toContain('Total tasks: <strong>1</strong>');
    expect(dashRes.text).toContain('Open tasks: <strong>1</strong>');
  });

  test('POST /tasks/create creates task with title and description', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    await agent.post('/tasks/create').type('form').send({
      title: 'Write report',
      description: 'Quarterly summary',
    });

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.text).toContain('Write report');
    expect(dashRes.text).toContain('Quarterly summary');
  });

  test('POST /tasks/:id/complete marks task as completed', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    await agent.post('/tasks/create').type('form').send({
      title: 'Finish milestone',
    });

    const apiRes = await agent.get('/api/tasks');
    const taskId = apiRes.body[0].id;

    const completeRes = await agent.post(`/tasks/${taskId}/complete`);
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.success).toBe(true);
    expect(completeRes.body.task.status).toBe('completed');

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.text).toContain('Finish milestone');
    expect(dashRes.text).toContain('Completed tasks: <strong>1</strong>');
    expect(dashRes.text).toContain('task-completed');
  });

  test('GET /api/tasks returns tasks for authenticated user', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    await agent.post('/tasks/create').type('form').send({ title: 'Task A' });
    await agent.post('/tasks/create').type('form').send({ title: 'Task B' });

    const res = await agent.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t) => t.title)).toEqual(expect.arrayContaining(['Task A', 'Task B']));
  });

  test('GET /api/tasks filters by status', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    await agent.post('/tasks/create').type('form').send({ title: 'Open task' });
    await agent.post('/tasks/create').type('form').send({ title: 'Done task' });

    const apiRes = await agent.get('/api/tasks');
    const doneTaskId = apiRes.body.find((t) => t.title === 'Done task').id;
    await agent.post(`/tasks/${doneTaskId}/complete`);

    const openRes = await agent.get('/api/tasks?status=open');
    expect(openRes.body).toHaveLength(1);
    expect(openRes.body[0].title).toBe('Open task');

    const completedRes = await agent.get('/api/tasks?status=completed');
    expect(completedRes.body).toHaveLength(1);
    expect(completedRes.body[0].title).toBe('Done task');
  });

  test('POST /tasks/:id/complete returns 404 for another user task', async () => {
    const owner = request.agent(app);
    const other = request.agent(app);

    await registerAndLogin(owner, 'owner@example.com');
    await registerAndLogin(other, 'other@example.com');

    await owner.post('/tasks/create').type('form').send({ title: 'Private task' });
    const ownerTasks = await owner.get('/api/tasks');
    const taskId = ownerTasks.body[0].id;

    const res = await other.post(`/tasks/${taskId}/complete`);
    expect(res.status).toBe(404);
  });

  test('tasks persist after logout and login', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'persist@example.com');

    await agent.post('/tasks/create').type('form').send({ title: 'Remember me' });
    await agent.post('/auth/logout');
    await agent.post('/auth/login').type('form').send({
      email: 'persist@example.com',
      password: 'password123',
    });

    const dashRes = await agent.get('/dashboard');
    expect(dashRes.text).toContain('Remember me');
  });
});
