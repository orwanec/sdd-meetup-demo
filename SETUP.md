# TaskFlow — Setup Guide

Detailed installation and local development setup for TaskFlow MVP v1.0.

**Estimated time:** under 10 minutes for a developer with Node.js already installed.

---

## Prerequisites

| Requirement | Minimum version | Verify |
|-------------|-----------------|--------|
| Node.js | 22.15.0 | `node --version` |
| npm | 10.8.0 | `npm --version` |
| Git | any recent | `git --version` |

Optional but recommended:

- **VS Code** (or another editor)
- **curl** or a browser for smoke testing

---

## 1. Clone the repository

```bash
git clone https://github.com/orwanec/sdd-meetup-demo.git
cd sdd-meetup-demo
```

If you already have the repo locally, pull the latest changes:

```bash
git pull
```

---

## 2. Install dependencies

```bash
npm install
```

This installs Express, SQLite, bcryptjs, session middleware, EJS, Helmet, Jest, and Supertest.

---

## 3. Configure environment variables

Copy the example file and edit values as needed:

```bash
cp .env.example .env
```

See [.env.example](.env.example) for all supported variables. At minimum, change `SESSION_SECRET` before any shared or production deployment.

---

## 4. Start the application

```bash
npm start
```

Expected console output:

```
Server running on http://localhost:3000
Database initialized at ./data/taskflow.db
```

The SQLite database file is created automatically on first start under `data/taskflow.db`.

---

## 5. Verify the installation

### Smoke test in the browser

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **Register** and create an account (password must be at least 8 characters)
3. Log in and create a task on the dashboard
4. Mark the task complete and confirm counts update

### Run the test suite

```bash
npm test
```

All 81 tests should pass (unit + integration).

### Optional: seed demo data

```bash
npm run seed
```

Demo accounts (see [scripts/seed.js](scripts/seed.js)):

| Email | Password |
|-------|----------|
| `demo@taskflow.local` | `demo12345` |
| `alice@taskflow.local` | `alice12345` |

---

## Development workflow

| Command | Purpose |
|---------|---------|
| `npm start` | Run the server (production-style) |
| `npm run dev` | Run with auto-restart on file changes (nodemon) |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run seed` | Populate demo users and tasks |

---

## Project layout (implementation)

```
src/
├── app.js              # Express app, middleware, route mounting
├── db.js               # SQLite initialization and schema
├── middleware/         # Auth and CSRF protection
├── routes/             # HTTP route handlers
├── services/           # Business logic (auth, tasks, passwords)
└── utils/              # Validation helpers

views/                  # EJS templates (auth, dashboard, tasks)
public/css/             # Stylesheets
tests/                  # Unit and integration tests
scripts/seed.js         # Demo data seeder
```

---

## Environment reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Set to `production` when deployed |
| `SESSION_SECRET` | *(required in prod)* | Signs session cookies |
| `SESSION_TIMEOUT` | `3600000` | Session max age in milliseconds (1 hour) |
| `DB_PATH` | `./data/taskflow.db` | SQLite file path (`:memory:` for tests) |
| `CORS_ORIGIN` | `http://localhost:3000` | Reserved for future API clients |

---

## Next steps

- [API.md](API.md) — HTTP endpoints and request/response formats
- [DEPLOYMENT.md](DEPLOYMENT.md) — production deployment options
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — common issues and fixes
- [specs/prd-001.md](specs/prd-001.md) — product requirements
- [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) — architecture and milestones
