/**
 * Seeds demo users and sample tasks for local development.
 * Safe to re-run — skips users that already exist.
 * @module scripts/seed
 */

require('dotenv').config();

const { initDatabase, closeDatabase } = require('../src/db');
const { register } = require('../src/services/authService');
const { create, complete } = require('../src/services/taskService');

const DEMO_USERS = [
  {
    email: 'demo@taskflow.local',
    password: 'demo12345',
    tasks: [
      { title: 'Review pull requests', description: 'Check open PRs on GitHub' },
      { title: 'Write weekly summary', description: null, completed: true },
      { title: 'Plan sprint backlog', description: 'Groom stories for next sprint' },
    ],
  },
  {
    email: 'alice@taskflow.local',
    password: 'alice12345',
    tasks: [
      { title: 'Buy groceries', description: 'Milk, eggs, bread' },
      { title: 'Schedule dentist appointment', description: null },
    ],
  },
];

async function seed() {
  await initDatabase();

  for (const user of DEMO_USERS) {
    let account;
    try {
      account = await register(user.email, user.password);
      console.log(`Created user: ${account.email}`);
    } catch (err) {
      if (err.status === 409) {
        console.log(`Skipped existing user: ${user.email}`);
        continue;
      }
      throw err;
    }

    for (const task of user.tasks) {
      const created = await create(account.id, task.title, task.description);
      if (task.completed) {
        await complete(created.id, account.id);
      }
      console.log(`  - Task: ${task.title}${task.completed ? ' (completed)' : ''}`);
    }
  }

  await closeDatabase();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
