const { initDatabase, closeDatabase } = require('../../src/db');
const { register } = require('../../src/services/authService');
const {
  create,
  getAll,
  getByStatus,
  complete,
  getStats,
} = require('../../src/services/taskService');

describe('taskService', () => {
  let userId;

  beforeEach(async () => {
    await initDatabase();
    const user = await register('taskservice@example.com', 'password123');
    userId = user.id;
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('create stores open task with title and description', async () => {
    const task = await create(userId, 'Plan sprint', 'Write stories');

    expect(task).toMatchObject({
      user_id: userId,
      title: 'Plan sprint',
      description: 'Write stories',
      status: 'open',
    });
    expect(task.id).toBeDefined();
    expect(task.created_at).toBeDefined();
  });

  test('create rejects empty title', async () => {
    await expect(create(userId, '   ')).rejects.toMatchObject({
      status: 400,
      message: 'Title is required.',
    });
  });

  test('getAll returns tasks for user only', async () => {
    const other = await register('other@example.com', 'password123');
    await create(userId, 'Mine');
    await create(other.id, 'Theirs');

    const tasks = await getAll(userId);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Mine');
  });

  test('getByStatus filters tasks', async () => {
    const task = await create(userId, 'Filter me');
    await complete(task.id, userId);

    const openTasks = await getByStatus(userId, 'open');
    const completedTasks = await getByStatus(userId, 'completed');

    expect(openTasks).toHaveLength(0);
    expect(completedTasks).toHaveLength(1);
    expect(completedTasks[0].status).toBe('completed');
  });

  test('complete marks task completed and updates stats', async () => {
    const task = await create(userId, 'Complete me');
    const completed = await complete(task.id, userId);

    expect(completed.status).toBe('completed');
    expect(completed.completed_at).toBeDefined();

    const stats = await getStats(userId);
    expect(stats).toEqual({ total: 1, open: 0, completed: 1 });
  });

  test('complete returns 404 when task belongs to another user', async () => {
    const other = await register('another@example.com', 'password123');
    const task = await create(userId, 'Not yours');

    await expect(complete(task.id, other.id)).rejects.toMatchObject({
      status: 404,
    });
  });
});
