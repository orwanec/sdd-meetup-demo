# Technical Plan 002: Password Reset

**Version:** 1.1  
**Date Created:** 2026-07-15  
**Status:** Implemented (2026-07-15)  
**Tech Stack:** Node.js, Express, SQLite, EJS (no external email providers)

---

## 1. Executive Summary

This plan implements the Password Reset feature defined in [prd-002](../specs/prd-002.md). It extends the existing TaskFlow MVP (tech-plan-001) with a self-service flow: request reset by email address, retrieve reset instructions from an in-app developer mailbox, set a new password via a time-limited single-use link, and log in normally.

TaskFlow is a **local development and demonstration** application. Reset messages are **not** sent through SMTP or any third-party email provider. Instead, the app uses an **in-memory developer mailbox** that stores generated reset messages and exposes them via a simple UI (`GET /dev/mailbox`).

The implementation prioritizes:

- **Demo-friendly delivery** — reset links appear in the in-app mailbox immediately; zero external configuration
- **Privacy** — identical confirmation messaging for registered and unregistered emails
- **Security** — unpredictable tokens, 30-minute expiry, single-use links, hashed token storage
- **Consistency** — reuse existing validation, password hashing, CSRF, and EJS auth styling from prd-001
- **Testability** — tests use the **same** `mailboxService` as the running app (no separate SMTP mocks or transports)

**New dependencies:** none.

---

## 2. Implementation of

Implements [prd-002](../specs/prd-002.md) — Password Reset (TaskFlow v1.1).

Builds on:

- [prd-001](../specs/prd-001.md) — registration, login, session auth
- [tech-plan-001](tech-plan-001.md) — Express/SQLite architecture (frozen; verify paths in code)

---

## 3. Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 22.15.0+ | Same as MVP |
| **Framework** | Express 4.x | Auth routes under `/auth/*`; dev mailbox under `/dev/*` |
| **Database** | SQLite3 | New `password_reset_tokens` table |
| **Templates** | EJS | Forgot-password, reset-password, confirmation, dev mailbox views |
| **Message delivery** | In-memory `mailboxService` | Store and display reset messages (dev/demo only) |
| **Crypto** | Node.js `crypto` | Generate reset tokens; SHA-256 hash before DB storage |
| **Password hashing** | bcryptjs (existing) | Hash new password on reset |
| **Testing** | Jest + Supertest | Unit + integration coverage per acceptance criteria |

---

## 4. Architecture & Design

### 4.1 Flow Overview

```
Login page ──► GET /auth/forgot-password (email form)
                    │
                    ▼
              POST /auth/forgot-password
                    │
        ┌───────────┴───────────┐
        │                       │
   email invalid            email valid format
        │                       │
        ▼                       ▼
  400 validation error    passwordResetService.requestReset()
  (no enumeration)              │
                    ┌───────────┴───────────┐
                    │                       │
              user exists              user missing
                    │                       │
                    ▼                       ▼
         invalidate old tokens         no-op (no message)
         create token (30 min)
         mailboxService.send({ to, subject, body, resetUrl })
                    │
                    └───────────┬───────────┘
                                ▼
              Same 200 confirmation page (always)
              + link to GET /dev/mailbox

Demo user ──► GET /dev/mailbox
                    │
                    ▼
              List of reset messages (newest first)
              Each entry shows to, subject, body, clickable resetUrl

Reset link ──► GET /auth/reset-password/:token (new password form)
                    │
                    ▼
              POST /auth/reset-password/:token
                    │
        ┌───────────┴───────────┐
        │                       │
   token invalid/expired/used   token valid
        │                       │
        ▼                       ▼
  error page + link to      update password_hash
  request new reset         mark token used_at
                            redirect to login + success message
```

### 4.2 New Modules

| File | Responsibility |
|------|----------------|
| `src/services/passwordResetService.js` | Token lifecycle: request, validate, consume, invalidate prior tokens |
| `src/services/mailboxService.js` | In-memory store: `send()`, `list()`, `clear()` |
| `src/routes/auth.js` | Add forgot/reset routes (extend existing router) |
| `src/routes/dev.js` | `GET /dev/mailbox` — developer mailbox UI |
| `views/auth/forgot-password.ejs` | Email input form |
| `views/auth/reset-password.ejs` | New password form |
| `views/auth/forgot-password-sent.ejs` | Uniform confirmation + link to dev mailbox |
| `views/auth/reset-link-invalid.ejs` | Expired/invalid/used link error |
| `views/dev/mailbox.ejs` | List reset messages with clickable links |

### 4.3 Design Decisions

1. **Token in URL (plain once)** — Generate 32-byte random hex token; include plain token in reset link; store only SHA-256 hash in DB (limits DB leak impact).
2. **Latest link wins** — On new reset request for a user, delete all unused tokens for that `user_id` before creating a new one (prd-002 §15.1).
3. **Uniform response** — `POST /auth/forgot-password` always renders the same confirmation view on valid email format, regardless of account existence.
4. **Single delivery path** — `mailboxService` is used in development, demo, **and** tests. No nodemailer, no SMTP env vars, no console-only fallback that tests cannot assert against.
5. **Dev mailbox is first-class UX** — Confirmation page directs users to `/dev/mailbox`. Login footer may include a subtle "Developer mailbox" link for discoverability during demos.
6. **Extend authService** — Add `updatePassword(userId, newPassword)` reusing `validatePassword` and `hashPassword`; keep reset orchestration in `passwordResetService`.
7. **Test isolation** — Call `mailboxService.clear()` in `beforeEach` of password-reset tests (same pattern as in-memory DB).

---

## 5. Data Models & Database Design

### 5.1 New Table

Add to `SCHEMA_STATEMENTS` in `src/db.js`:

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token_hash ON password_reset_tokens(token_hash);
```

### 5.2 Token Rules

| Field | Rule |
|-------|------|
| `token_hash` | SHA-256 of the plain token from the reset link |
| `expires_at` | `now + 30 minutes` at creation |
| `used_at` | Set on successful password change; non-null tokens are rejected |
| Prior tokens | Invalidated (deleted) when a new reset is requested for the same user |

### 5.3 In-Memory Mailbox (not persisted)

Messages live in a module-level array inside `mailboxService.js`:

```javascript
// Shape of each stored message
{
  id: string,           // uuid or incrementing id
  to: string,           // recipient email
  subject: string,
  body: string,         // plain-text body
  resetUrl: string,     // full URL for one-click access in dev UI
  sentAt: Date,
}
```

Mailbox state resets on server restart (acceptable for local/demo). Tests call `clear()` between cases.

### 5.4 Data Preservation

Password reset updates only `users.password_hash`. Tasks and session data are unchanged (prd-002 §7.3).

---

## 6. API Contracts & Endpoints

All form POSTs require CSRF token (existing middleware).

### 6.1 GET /auth/forgot-password

**Response:** 200 — render forgot-password form.

**Spec mapping:** prd-002 §6.1 step 2, §7.1 (link from login page).

### 6.2 POST /auth/forgot-password

**Request:**

```
email: string (required, same validation as registration)
```

**Behavior:**

- Invalid email format → 400, validation error on form (does not reveal account existence).
- Valid format → always 200, render `forgot-password-sent.ejs` with uniform message:
  > If an account exists for that email, you will receive reset instructions shortly.
- Page includes a link to **`/dev/mailbox`** so demo users know where to find the reset link.
- If account exists → create token, call `mailboxService.send()` with link:
  `{APP_BASE_URL}/auth/reset-password/{token}`

**Spec mapping:** prd-002 §7.1, §7.4 (no enumeration).

### 6.3 GET /dev/mailbox

**Response:** 200 — render `views/dev/mailbox.ejs` listing all messages (newest first).

**Behavior:**

- Each row: recipient, subject, sent time, body preview, clickable `resetUrl`.
- Empty state: "No messages yet."
- No authentication required (demo/local tool; document in README that this route is not for production deployment as-is).

**Spec mapping:** prd-002 §8 — receive reset instructions for registered accounts.

### 6.4 GET /auth/reset-password/:token

**Behavior:**

- Valid, unexpired, unused token → 200, render reset-password form.
- Invalid / expired / used → render `reset-link-invalid.ejs` with clear message and link to `/auth/forgot-password`.

**Spec mapping:** prd-002 §6.2 step 2, §6.3, §7.2.

### 6.5 POST /auth/reset-password/:token

**Request:**

```
password: string (required, min 8 chars)
password_confirm: string (optional but recommended in UI)
```

**Behavior:**

- Invalid token → same error view as GET invalid link.
- Validation failure → 400 on form with errors.
- Success → update password, set `used_at`, redirect 302 to `/auth/login?reset=1`.

**Spec mapping:** prd-002 §7.3, §7.2 (single-use).

### 6.6 Login Page Update

- Add "Forgot password?" link → `/auth/forgot-password`.
- Optional footer link: "Developer mailbox" → `/dev/mailbox`.
- Show success message when `?reset=1` query param present.

---

## 7. Developer Mailbox Service

### 7.1 Configuration (`.env.example`)

```env
APP_BASE_URL=http://localhost:3000
```

No SMTP or mail-provider variables.

### 7.2 `mailboxService` API

| Method | Purpose |
|--------|---------|
| `send({ to, subject, body, resetUrl })` | Append message to in-memory store |
| `list()` | Return messages newest-first (copy of array) |
| `clear()` | Empty store — used in test `beforeEach` |

**Message content (minimum):**

- Subject: "Reset your TaskFlow password"
- Body: states link expires in 30 minutes; includes `resetUrl` as readable text
- `resetUrl`: full clickable URL in dev mailbox UI

### 7.3 Why not SMTP

TaskFlow targets local demos. External email adds configuration friction, flaky CI, and no user value in this context. A future PRD may add real email delivery; v1.1 explicitly excludes it (see prd-002 §10).

---

## 8. Implementation Plan

### Milestone 1: Schema & Services (Day 1)

**Tasks:**

- [ ] Add `password_reset_tokens` table and indexes in `src/db.js`
- [ ] Create `src/services/mailboxService.js` (`send`, `list`, `clear`)
- [ ] Create `src/services/passwordResetService.js`:
  - `requestReset(email)` → uniform result; enqueues mailbox message if user exists
  - `findValidToken(plainToken)` → user + token row or null
  - `resetPassword(plainToken, newPassword)` → updates hash, marks used
  - `invalidateTokensForUser(userId)`
- [ ] Add `updatePassword(userId, password)` to `authService.js`
- [ ] Unit tests: `tests/unit/passwordResetService.test.js`, `tests/unit/mailboxService.test.js`

**Success criteria:**

- Token generation, expiry, single-use, and invalidation covered by unit tests
- Mailbox send/list/clear covered by unit tests
- `npm test` passes

### Milestone 2: Routes & Views (Day 2)

**Tasks:**

- [ ] Extend `src/routes/auth.js` with forgot/reset handlers
- [ ] Create `src/routes/dev.js` and mount at `/dev` in `src/app.js`
- [ ] Create EJS views (match existing auth styling)
- [ ] Update `views/auth/login.ejs` with forgot-password link, optional dev mailbox link
- [ ] Add `APP_BASE_URL` to `.env.example`

**Success criteria:**

- Demo flow: request reset → open `/dev/mailbox` → click link → set password → login

### Milestone 3: Integration Tests & Cross-Check (Day 3)

**Tasks:**

- [ ] Create `tests/integration/passwordReset.test.js` covering all prd-002 acceptance criteria
- [ ] Run Cross-Check Protocol against prd-002 §8
- [ ] Set tech plan status to `Implemented (YYYY-MM-DD)` when complete

**Success criteria:**

- All integration tests pass
- `npm test` green
- Every acceptance criterion traced to a test

---

## 9. Development Phases & Milestones

| Phase | Deliverable | PRD sections |
|-------|-------------|--------------|
| MS-1 | DB + mailbox + reset services + unit tests | §7.2, §7.3, §7.4 |
| MS-2 | Routes + views + dev mailbox UI | §6.1, §6.2, §7.1 |
| MS-3 | Integration tests + cross-check | §8 (all criteria) |

Estimated effort: 2–3 days for a solo developer following test-first workflow.

---

## 10. Resource Requirements

- **Developer:** 1 (familiar with existing TaskFlow auth code)
- **Infrastructure:** none beyond existing local Node/SQLite setup
- **No external email accounts or API keys**

---

## 11. Testing Strategy

Tests assert against **`mailboxService.list()`** — the same code path the app uses at runtime. No SMTP mocks, no nodemailer stubs.

### 11.1 Unit Tests

**`tests/unit/mailboxService.test.js`**

- `send` adds a message retrievable via `list`
- `list` returns newest first
- `clear` empties the store

**`tests/unit/passwordResetService.test.js`**

- `requestReset` with unknown email does not insert token or enqueue message
- `requestReset` with known email creates token, invalidates previous tokens, enqueues message with `resetUrl`
- `findValidToken` rejects expired and used tokens
- `resetPassword` updates hash and sets `used_at`

### 11.2 Integration Tests (`tests/integration/passwordReset.test.js`)

Use `postFormWithCsrf` helper. Call `mailboxService.clear()` in `beforeEach`.

| Test | Acceptance criterion |
|------|---------------------|
| Login page contains forgot-password link | Request from login flow |
| POST forgot-password (unknown email) → confirmation text | Same message unregistered |
| POST forgot-password (known email) → same confirmation text | Same message registered |
| Known email → `mailboxService.list()` contains reset URL | Receive reset instructions |
| `GET /dev/mailbox` renders the reset link | Demo UX / discoverability |
| Follow link → POST new password → login succeeds | Set password + login |
| Login with old password → 401 | Old password fails |
| Reuse same link → error page | Single-use |
| Token with `expires_at` in past → error | 30-minute expiry |
| Random token → error | Invalid link |
| User with tasks retains tasks after reset | Data preserved |

### 11.3 Regression

- Existing `tests/integration/auth.test.js` and full suite must remain green

---

## 12. Performance & Scalability

| Metric | Target |
|--------|--------|
| Forgot-password POST | < 500ms (in-memory mailbox write) |
| Reset-password POST | < 800ms (includes bcrypt) |
| Token lookup | < 50ms (indexed `token_hash`) |
| Dev mailbox page | < 200ms |

No rate limiting in v1.1 (explicitly out of scope per prd-002 §10).

---

## 13. Security Considerations

- **Token entropy:** 32 bytes from `crypto.randomBytes` (256 bits)
- **Storage:** Only hashed tokens in DB
- **Enumeration:** Identical confirmation copy; no "user not found" on forgot-password
- **Single-use:** `used_at` set atomically with password update
- **Expiry:** Enforced in service layer on every validate/consume
- **CSRF:** All POST forms protected (existing middleware)
- **Dev mailbox exposure:** Acceptable for local/demo; document that `/dev/mailbox` must not be exposed in a production deployment without auth (out of scope for v1.1)

---

## 14. Dependencies & Integration Points

| Integration | Notes |
|-------------|-------|
| `authService` | User lookup by email; password update |
| `passwordService` | `hashPassword`, `comparePassword` |
| `validation.js` | `isValidEmail`, `normalizeEmail` |
| `db.js` | Schema migration via `CREATE TABLE IF NOT EXISTS` |
| `mailboxService` | Sole message delivery mechanism |

**No new npm packages.**

---

## 15. Risks & Mitigation (Technical)

| Risk | Mitigation |
|------|------------|
| Demo users cannot find reset link | Confirmation page links to `/dev/mailbox`; optional login footer link |
| Mailbox state lost on restart | Acceptable for demo; user re-requests reset |
| Clock skew on expiry | UTC timestamps; tests set explicit `expires_at` |
| Race: two resets concurrently | Invalidate-then-insert per user; acceptable for MVP |
| XSS in mailbox UI | Escape all dynamic fields in EJS templates |

---

## 16. Assumptions & Constraints

- PRD password rules unchanged (min 8 characters)
- `APP_BASE_URL` set correctly for reset link generation (default `http://localhost:3000`)
- Users retrieve reset links from `/dev/mailbox` within 30 minutes or request again
- Only latest unused token valid per user
- No external email provider integration in v1.1
- Does not modify registration, login, logout, or task behavior

---

## 17. Traceability Matrix

| PRD § | Requirement | Implementation | Test |
|-------|-------------|----------------|------|
| 7.1 | Request reset by email | POST `/auth/forgot-password` | Integration |
| 7.1 | Uniform confirmation | `forgot-password-sent.ejs` | Integration |
| 7.2 | 30-min expiry | `expires_at` + service check | Unit + integration |
| 7.2 | Single-use link | `used_at` column | Integration |
| 7.3 | Set new password | POST `/auth/reset-password/:token` | Integration |
| 7.4 | No enumeration | Same response path | Integration |
| 8 | Receive reset instructions | `mailboxService.send` + `/dev/mailbox` | Integration |
| 8 | Login with new password | Existing login route | Integration |
| 8 | Old password fails | Login 401 after reset | Integration |
| 8 | Invalid/expired errors | `reset-link-invalid.ejs` | Integration |

---

## 18. Approval & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Technical Lead | [Name] | [Date] | Pending |
| Product Owner | [Name] | [Date] | Pending |

**Next steps after approval:**

1. Set prd-002 to `Status: Active` (product sign-off)
2. Set this plan to `Status: Active`
3. Start a **new agent session** to implement (test-first per workspace rules)

---

## Appendix

### A. Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-15 | Initial draft for password reset |
| 1.1 | 2026-07-15 | Replace SMTP/nodemailer with in-memory developer mailbox |

### B. Related Documents

- [prd-002](../specs/prd-002.md)
- [tech-plan-001](tech-plan-001.md)
