# TaskFlow

A lightweight task manager built with **Node.js, Express, SQLite, and EJS**. Register, log in, create tasks, mark them done — that's the MVP.

This repo is also a **Spec-Driven Development (SDD)** demo for the meetup: a working app *and* a case study in building with specs instead of prompts alone.

**Stack:** Node.js 22+ · Express · SQLite · bcrypt · session auth · Jest

---

## Spec-Driven Development

**SDD** means writing clear specifications *before* code — then implementing and testing against them. In this project:

1. **[specs/prd-001.md](specs/prd-001.md)** — *what* to build (features, acceptance criteria, no tech choices)
2. **[tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)** — *how* to build it (stack, architecture, milestones)
3. **`src/` + `tests/`** — implementation traced back to both

Specs stay implementation-agnostic. The tech plan translates requirements into concrete decisions. Tests are written from acceptance criteria, not from whatever the AI happened to generate.

### SDD vs. uncontrolled vibe-coding

| | **Spec-driven** | **Vibe-coding** |
|---|----------------|-----------------|
| **Starting point** | Written requirements & acceptance criteria | A prompt and hope |
| **Scope** | Defined upfront — in-scope and out-of-scope are explicit | Creeps as you go ("just one more thing…") |
| **Validation** | Tests map to spec criteria; pass/fail is objective | "Looks fine to me" |
| **AI assistance** | Specs are guardrails — AI fills in implementation details | AI invents requirements, architecture, and edge cases |
| **Traceability** | Every feature links back to a requirement | Hard to explain why code exists |
| **Rework** | Issues caught in spec review, before coding | Found in QA or production — expensive to unwind |
| **Team handoff** | PM, eng, and QA share the same source of truth | Knowledge lives in chat history |

The meetup thesis: **specs aren't bureaucracy — they're the steering wheel.** Without them, AI-assisted development is fast but directionless. With them, you get speed *and* control.

### Workflow in this repo

```
PRD (what)  →  Tech plan (how)  →  Code + tests  →  Docs
```

Each milestone in the tech plan was implemented in a focused pass — one concern at a time, validated against the spec before moving on. See [CONVENTIONS.md](CONVENTIONS.md) for the full SDD workflow and file conventions.

---

## Quick start

**Prerequisites:** Node.js 22.15+, npm 10.8+

```bash
git clone https://github.com/orwanec/sdd-meetup-demo.git
cd sdd-meetup-demo
npm install
cp .env.example .env
npm start
```

Open [http://localhost:3000](http://localhost:3000) → register → log in → create a task.

```bash
npm test          # 81 tests
npm run seed      # demo users (see SETUP.md)
```

Full install guide: [SETUP.md](SETUP.md)

---

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run the server |
| `npm run dev` | Run with auto-restart (nodemon) |
| `npm test` | Run all tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run seed` | Load demo data |

---

## Features (v1.0)

- User registration, login, logout
- Dashboard with task counts (total / open / completed)
- Create tasks (title + optional description)
- Mark tasks complete
- Responsive UI, CSRF protection, input validation

**Not in v1.0:** password reset, task edit/delete, priorities, due dates. See [specs/prd-001.md](specs/prd-001.md) for scope and roadmap.

---

## Documentation

| Doc | What it's for |
|-----|---------------|
| [SETUP.md](SETUP.md) | Detailed local setup |
| [API.md](API.md) | HTTP endpoints |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [specs/prd-001.md](specs/prd-001.md) | Product requirements |
| [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) | Architecture & milestones |
| [CONVENTIONS.md](CONVENTIONS.md) | SDD workflow & conventions |

---

## Project layout

```
src/           Express app, routes, services, middleware
views/         EJS templates
public/css/    Styles
tests/         Unit + integration tests
data/          SQLite database (created on first run)
```

---

## Contributing

Demo project for a meetup. Issues welcome — prefix with `spec:`, `tech:`, or `sdd:`.

## License

UNLICENSED
