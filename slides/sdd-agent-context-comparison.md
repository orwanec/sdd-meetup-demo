# SDD & Agent Context — Speaker Notes

**Meetup:** Spec-Driven Development (TaskFlow demo)  
**Author:** Denys Pavlenko  
**Date:** 2026-07-15  
**Repo:** [sdd-meetup-demo](https://github.com/orwanec/sdd-meetup-demo)

Use this document alongside `spec_driven_development_pavlenko_v14072026.pptx`. Numbers come from the TaskFlow codebase on `main` unless noted.

---

## One-liner for the talk

> **Without specs, the agent doesn't read requirements — it archaeologically infers them from code, or invents them from training data.**

---

## TaskFlow scale (anchor numbers)

| Area | Lines | Role |
|------|------:|------|
| `src/` + `tests/` + `views/` | ~2,400 | What the agent explores without specs |
| Auth-related cluster | ~700 | Minimum code to read for an auth feature |
| `specs/prd-001.md` | 393 | MVP product contract |
| `specs/prd-002.md` *(PR #11)* | 333 | Password reset product contract |
| `tech-plans/tech-plan-001.md` | 933 | MVP technical contract |
| Core architecture files (`app`, `db`, routes, services, `API.md`) | ~1,500 | What the agent reads to infer *how* things are built |

**Takeaway:** TaskFlow is intentionally small. If vibe-coding already struggles here, it gets worse fast at 20k–200k+ LOC.

---

## Part 1 — PRD: without SDD vs with SDD

### Scenario A: New feature (Password Reset)

Prompt: *"Implement password reset for TaskFlow."*

| | **Without SDD (no PRD)** | **With SDD (`specs/prd-002.md`)** |
|---|--------------------------|-----------------------------------|
| **Source of truth** | Agent's training data + whatever code exists | PRD acceptance criteria |
| **Product rules** | Invented (TTL, enumeration, single-use) | Explicit in §7–§8 |
| **Unknown-email behavior** | Often "user not found" | Same confirmation message always |
| **Link expiry** | Often 1h / 24h (model default) | 30 minutes (agreed) |
| **Out of scope** | Feature creep (MFA, SMS, etc.) | Listed in §10 |
| **Files read (typical)** | 8–15 (auth cluster + patterns + tests) | 1–2 (`prd-002`, maybe `prd-001` §7) |
| **Lines in context (rough)** | 800–2,000+ | ~400 |
| **Input tokens (rough)** | ~15k–40k | ~3k–5k |
| **Requirements correct?** | ⚠️ Unreliable | ✅ PR-reviewed |
| **Tests trace to criteria?** | Assert whatever got built | Map to §8 checkboxes |

### Scenario B: Brownfield change (extend login)

Prompt: *"Why does login fail silently? Should we change the error message?"*

| | **Without SDD (no PRD)** | **With SDD (`specs/prd-001.md`)** |
|---|--------------------------|-----------------------------------|
| **Intent** | Guess from code | §7.2: generic "Invalid credentials" is intentional |
| **Security rationale** | May be missed | Prevents email enumeration |
| **Scope** | Agent may "improve" UX and break security | PRD + Out of Scope guide the change |
| **Discovery path** | Read auth code + tests + grep | Read §7.2 first, then confirm in code |

### What code cannot tell the agent (Password Reset)

| Requirement | In `prd-002`? | Inferable from code today? |
|-------------|:-------------:|:--------------------------:|
| Same confirmation for unknown email | ✅ | ❌ |
| 30-minute link expiry | ✅ | ❌ (not built yet) |
| Single-use reset link | ✅ | ❌ (not built yet) |
| Min 8 characters for new password | ✅ | ⚠️ (only if agent finds registration) |
| MFA / SMS out of scope | ✅ | ❌ |

**~70% of password-reset acceptance criteria are not discoverable from code** for a greenfield feature.

### PRD slide — suggested title

**The agent without a PRD reads your repo — and writes the product spec for you**

---

## Part 2 — Tech Plan: without SDD vs with SDD

A PRD says **what**. A tech plan says **how**. Without it, the agent must reverse-engineer architecture from code — or invent a new one.

### Scenario C: Implement Password Reset (PRD approved, no tech plan yet)

Prompt: *"Implement password reset per `specs/prd-002.md`."*

| | **PRD only (no tech plan)** | **With SDD (PRD + `tech-plan-002`)** |
|---|------------------------------|--------------------------------------|
| **Architecture** | Agent guesses or copies ad hoc from existing files | Defined: token storage, email adapter, routes |
| **API / routes** | Agent invents naming (`/reset` vs `/auth/forgot-password`) | Matches existing `/auth/*` conventions |
| **Data model** | Agent may add columns/tables inconsistently | Schema change documented upfront |
| **Security** | Agent may skip CSRF, session invalidation, rate limits | Explicit in plan (mirrors MS-6 patterns) |
| **Email delivery** | Mock vs SMTP vs log-only — random choice | Decision recorded once, reused in tests |
| **Files read (typical)** | PRD + 10–20 implementation files | PRD + tech plan + 2–5 targeted files |
| **Lines in context (rough)** | ~1,200–2,500 | ~700–1,200 |
| **Mismatch risk with existing app** | High (naming, middleware, test helpers) | Low (plan references `tech-plan-001` patterns) |
| **Reviewer can verify** | "Looks reasonable" | Plan ↔ PRD ↔ code traceability |

### Scenario D: Build MVP from scratch (TaskFlow history)

| | **Without SDD** | **With SDD (`prd-001` + `tech-plan-001`)** |
|---|-----------------|---------------------------------------------|
| **Stack choice** | Agent picks (or defaults to familiar stack) | Node, Express, SQLite, EJS, bcrypt — agreed |
| **Structure** | `controllers/` vs `services/` vs monolith — random | Milestones 1–8, folder layout in plan |
| **Endpoints** | Drift from REST habits | §4 API Endpoints match PRD §7 |
| **Test strategy** | Afterthought | Milestone 7: unit + integration + acceptance |
| **Upfront spec reading** | 0 lines | ~1,326 lines (393 + 933) |
| **Total exploration during build** | Often **entire codebase** re-read many times | Targeted reads per milestone |
| **Post-hoc documentation** | `API.md` written to catch up | `API.md` traces to plan §4 |

### Tech plan vs code archaeology (brownfield)

To infer **how TaskFlow is built** without `tech-plan-001`, an agent typically reads:

```
src/app.js          → middleware order, route mounting
src/db.js           → schema, migrations
src/routes/*.js     → URL conventions
src/services/*.js   → business logic patterns
src/middleware/*    → auth, CSRF
API.md              → documented contracts (if it exists)
tests/integration/* → behavioral truth
```

| Approach | Lines (rough) | Gets you |
|----------|-------------:|----------|
| Read `tech-plan-001.md` | 933 | Architecture, schema, endpoints, milestones, security |
| Reverse-engineer from code + API.md | ~1,500+ | Current behavior — not always original intent |
| **Delta** | **~1.6× more context** | Still missing *why* decisions were made |

### Tech plan slide — suggested title

**The PRD is not enough — without a tech plan, every agent re-architects your app**

---

## Combined workflow comparison

| Stage | Vibe-coding | Spec-driven (TaskFlow) |
|-------|-------------|------------------------|
| **1. Requirements** | Prompt + hope | `specs/prd-{NNN}.md` |
| **2. Design** | Agent reads codebase / invents | `tech-plans/tech-plan-{NNN}.md` |
| **3. Tests** | "Looks fine" | Red → green from acceptance criteria |
| **4. Implementation** | Unbounded exploration | Targeted files from plan |
| **5. Review** | Subjective | PR: spec + plan + tests + code |
| **6. Agent context cost** | High, repeated | Front-loaded, then cheap |

---

## Token & cost framing (order-of-magnitude)

Assumptions: ~4 characters per token, ~$3 / 1M input tokens (varies by model/plan).

| Task | Without SDD (tokens) | With SDD (tokens) | Rough $ delta per task |
|------|---------------------:|------------------:|-----------------------:|
| Password reset requirements | 15k–40k | 3k–5k | ~$0.04–$0.10 |
| Architecture for new feature | 20k–50k | 5k–10k | ~$0.05–$0.12 |
| **One feature session (total)** | **35k–90k** | **8k–15k** | **~$0.08–$0.23** |

**Per-task savings are cents. Rework from wrong requirements is dollars.**

Wrong TTL, wrong enumeration handling, wrong schema → fix PR → re-review → re-test. That dominates cost, not the extra grep.

---

## Scale: demo repo → real world

| Codebase | Implementation LOC | Without SDD | With SDD |
|----------|-------------------:|-------------|----------|
| **TaskFlow (demo)** | ~2,400 | Agent can sample most files — still invents product rules | PRD + tech plan fit in context |
| **Team service** | ~20,000 | Random sampling, missed edge cases | Specs stay small; code reads are targeted |
| **Monolith** | ~200,000+ | Agent sees <5% — confident hallucinations | Specs are the steering wheel |

> **Token cost grows linearly. Wrong-requirements cost grows with codebase size and model confidence.**

---

## Live demo ideas (2 minutes each)

### Demo 1 — PRD

Same prompt, two runs:

1. *"Implement password reset per `specs/prd-002.md`"*
2. *"Implement password reset for this app"*

Ask audience to predict: link TTL, unknown-email message, tests.

### Demo 2 — Tech plan

Show `tech-plan-001` §4 (API Endpoints) next to `src/routes/auth.js`.

Ask: *"If you only had the PRD, would the agent mount routes under `/auth` or `/api/auth`?"*

---

## Jira / external tools (optional talking point)

| | Spec in repo | Jira ticket as spec |
|---|-------------|---------------------|
| **Agent access** | Direct file read | MCP + auth + JSON overhead |
| **Versioning** | Git history, PR review | Ticket edits, comment threads |
| **Co-located with code/tests** | Same PR | Manual linking |
| **Best use of Jira** | — | Status, assignee, sprint (*pointer* to `specs/prd-002.md`) |

---

## Closing line

**Specs aren't bureaucracy — they're the steering wheel.**  
Without them, AI-assisted development is fast but directionless. With them, you get speed *and* control.

---

## Related repo files

| File | Purpose |
|------|---------|
| [CONVENTIONS.md](../CONVENTIONS.md) | Agent-agnostic SDD workflow |
| [specs/prd-001.md](../specs/prd-001.md) | MVP requirements |
| [specs/prd-002.md](../specs/prd-002.md) | Password reset requirements |
| [tech-plans/tech-plan-001.md](../tech-plans/tech-plan-001.md) | MVP implementation plan |
| [README.md](../README.md) | SDD vs vibe-coding table |
