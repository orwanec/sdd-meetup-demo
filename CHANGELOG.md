# Changelog

All notable changes to TaskFlow are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-13

First production-ready MVP release — Spec-Driven Development meetup demo.

### Added

- **Authentication** — user registration, login, logout with bcrypt password hashing and express-session
- **Dashboard** — personalized task summary (total, open, completed counts) and task list
- **Task management** — create tasks (title + optional description), mark tasks complete
- **JSON API** — `GET /api/tasks` with optional status filter
- **Security** — Helmet headers, CSRF protection, input validation and sanitization, cache-control on auth routes
- **Responsive UI** — mobile-first CSS for auth, dashboard, and task forms
- **Testing** — 81 unit and integration tests covering auth, tasks, security, styling, performance, and PRD acceptance criteria
- **Documentation** — SETUP.md, API.md, DEPLOYMENT.md, TROUBLESHOOTING.md, JSDoc on core modules
- **Seed script** — demo users and sample tasks via `npm run seed`

### Technical

- Node.js 22.15+, Express 4, SQLite3, EJS templates
- Implementation aligned with [specs/prd-001.md](specs/prd-001.md) and [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) milestones 1–8

### Known limitations (MVP scope)

- No password reset or email verification
- No task edit or delete
- No task priorities, due dates, or categories
- SQLite only (single-file database)

---

## [Unreleased]

### Planned (Phase 2)

- Task editing and deletion
- Password reset flow
- Email verification
- PostgreSQL option for production

See [specs/prd-001.md](specs/prd-001.md) roadmap for details.
