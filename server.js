require('dotenv').config();

const app = require('./src/app');
const { initDatabase } = require('./src/db');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './data/taskflow.db';

async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database initialized at ${DB_PATH}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
