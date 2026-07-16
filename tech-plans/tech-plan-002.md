# Technical Plan 002: Password Reset

**Version:** 1.1  
**Date Created:** 2026-07-16  
**Status:** Active  
**Tech Stack:** Node.js, Express, SQLite, EJS, bcryptjs, crypto (built-in)  
**Implementation of:** [prd-002.md](../specs/prd-002.md) (Password Reset)  
**Builds on:** [tech-plan-001.md](tech-plan-001.md) (TaskFlow MVP)

---

## 1. Overview / Executive Summary

This plan implements self-service password reset for TaskFlow v1.1. Users request a reset by email from the login flow, “receive” a time-limited single-use link when an account exists (via a **developer mailbox**), set a new password, and sign in with the new credentials. Existing tasks and account data are unchanged.

Technical priorities (mapped to prd-002):

- **Privacy** — identical confirmation for registered and unregistered emails; no enumeration leaks
- **Security** — cryptographically unpredictable tokens, 30-minute expiry, single-use, prior tokens invalidated on new request
- **Consistency** — reuse existing auth validation, hashing, CSRF, session, and EJS patterns from tech-plan-001
- **Demo-friendly delivery** — in-memory mailbox UI instead of a real email provider (meetup / local demos)

---

## 2. Implementation of

| Document | Role |
|----------|------|
| [specs/prd-002.md](../specs/prd-002.md) | Product requirements and acceptance criteria |
| [specs/prd-001.md](../specs/prd-001.md) | Password rules (min 8 chars), auth UX baseline |
| [tech-plan-001.md](tech-plan-001.md) | Stack, `/auth/*` conventions, CSRF, bcryptjs, session |

---

## 3. Technical Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Runtime / framework | Node.js 22+, Express 4.x | Unchanged |
| Templates | EJS | New views under `views/auth/` + `views/dev/` |
| Database | SQLite3 | New `password_reset_tokens` table in `src/db.js` |
| Password hashing | bcryptjs (10 rounds) | Reuse `passwordService.hashPassword` / `comparePassword` |
| Token generation | Node `crypto.randomBytes` | 32 bytes → hex; store **SHA-256 hash** only |
| Email (demo) | In-memory developer mailbox | **No** nodemailer, SMTP, or external provider |
| Session / CSRF | express-session + existing CSRF middleware | All new POST forms require `_csrf` |

**New npm dependencies:** none.

---

## 4. Architecture & Design

### 4.1 Constraint — developer mailbox (no real email)

> This application is intended for local development and demonstrations. **Do not** integrate with a real email provider. Use an **in-memory developer mailbox** to display generated password reset emails.

| Rule | Detail |
|------|--------|
| Storage | Process-local array (or equivalent) in `mailService` — cleared on server restart |
| “Send” | `sendPasswordResetEmail(...)` appends a message `{ id, to, subject, body, resetUrl, createdAt }` |
| View | `GET /dev/mailbox` renders newest-first list; each message shows the clickable reset link |
| Tests | Same store — assert message count / content after reset request; `clearMailbox()` in `beforeEach` |
| Production SMTP | **Out of scope** for this plan |

Demo flow: request reset → open `/dev/mailbox` → click reset link → set password → login.

### 4.2 Flow

```
Browser                Express (/auth, /dev)     Services                 SQLite / Mailbox
───────                ─────────────────────     ────────                 ────────────────
Forgot password?  →    GET  /forgot-password
Submit email      →    POST /forgot-password  →  requestPasswordReset
                                                   ├─ validate email format
                                                   ├─ if user exists:
                                                   │    invalidate prior tokens
                                                   │    create token (hash + expiry)
                                                   │    push message to in-memory mailbox
                                                   └─ always same confirmation UX
Open /dev/mailbox →    GET  /dev/mailbox         list mailbox messages
Click reset link  →    GET  /reset-password?token=…
                                                   validate token (exists, unused, not expired)
Submit new pwd    →    POST /reset-password   →  resetPasswordWithToken
                                                   ├─ validate password (min 8)
                                                   ├─ UPDATE users.password_hash
                                                   └─ mark token used
Login with new    →    existing POST /login
```

### 4.3 Component layout

| Component | Path | Responsibility |
|-----------|------|----------------|
| Auth routes | `src/routes/auth.js` | Forgot/reset GET+POST handlers |
| Dev routes | `src/routes/dev.js` (or mount in `app.js`) | `GET /dev/mailbox` |
| Auth service | `src/services/authService.js` | `requestPasswordReset`, `getValidResetToken`, `resetPasswordWithToken` |
| Mail service | `src/services/mailService.js` | In-memory mailbox: `sendPasswordResetEmail`, `getMailbox`, `clearMailbox` |
| DB schema | `src/db.js` | `password_reset_tokens` + indexes |
| Views | `views/auth/forgot-password.ejs`, `reset-password.ejs`, `reset-invalid.ejs` | Forms and error UX |
| Mailbox view | `views/dev/mailbox.ejs` | List “emails” with reset links |
| Login link | `views/auth/login.ejs` | "Forgot password?" → `/auth/forgot-password` |

Optional UX: after forgot-password confirmation, show a small link “Open developer mailbox” → `/dev/mailbox` (demo convenience; does not reveal whether mail was sent).

---

## 5. Data Models & Database Design

### 5.1 New table

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
  ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at
  ON password_reset_tokens(expires_at);
```

### 5.2 Token rules

| Rule | Implementation |
|------|----------------|
| Unpredictable | `crypto.randomBytes(32).toString('hex')` (64 hex chars) in reset URL only |
| Stored safely | Persist `SHA-256(token)` as `token_hash`; never store raw token |
| Expiry | `expires_at = now + 30 minutes` (prd-002 §7.2) |
| Single-use | Set `used_at` on successful reset; reject if `used_at IS NOT NULL` |
| Latest-only | On new request for a user, invalidate all prior unused rows for that `user_id` |
| Lookup | Hash incoming query/body token; `SELECT` by `token_hash` |

### 5.3 Users table

No schema change to `users`. Password update: `UPDATE users SET password_hash = ? WHERE id = ?`.

### 5.4 Mailbox (not in SQLite)

In-memory only — not persisted. Shape:

```js
{ id, to, subject, body, resetUrl, createdAt }
```

Body/subject must state the link expires in 30 minutes (prd-002 §7.2 UX).

---

## 6. API Contracts & Endpoints

All auth routes under existing `/auth` prefix. Form posts are `application/x-www-form-urlencoded` with `_csrf`.

### 6.1 Forgot password (request)

```
GET  /auth/forgot-password
POST /auth/forgot-password

Request (POST):
  email: string (required, same format as registration)
  _csrf: string

Success (POST):
  200 — confirmation message MUST be identical whether or not the email is registered, e.g.:
  "If an account exists for that email, you will receive reset instructions shortly."

Validation failure:
  400 — invalid/missing email format (does not reveal account existence)

Spec mapping: prd-002 §7.1
```

### 6.2 Reset password (set new)

```
GET  /auth/reset-password?token=<raw-token>
POST /auth/reset-password

Request (POST):
  token: string (required)
  password: string (required, min 8 chars)
  passwordConfirm: string (optional UX; if present must match password)
  _csrf: string

GET valid token:
  200 — render new-password form (include hidden token field)

GET/POST invalid, expired, or used token:
  400 — render reset-invalid view with clear error + link to /auth/forgot-password

POST success:
  302 — redirect to /auth/login?reset=1
  Side effects: password_hash updated; token marked used; old password fails login

Spec mapping: prd-002 §7.2–7.3
```

### 6.3 Developer mailbox

```
GET /dev/mailbox

Response:
  200 — list of in-memory messages (newest first), each with to/subject/body/resetUrl
  Empty state when no messages

No auth required (local demo tool). Not a product feature for end users.
```

### 6.4 Login page entry point

```
GET /auth/login
  — Add "Forgot password?" link to /auth/forgot-password
```

Existing register/login/logout contracts remain unchanged.

---

## 7. Implementation Plan

### 7.1 Files to add

| File | Purpose |
|------|---------|
| `src/services/mailService.js` | In-memory mailbox + send/list/clear |
| `src/routes/dev.js` | `GET /dev/mailbox` |
| `views/auth/forgot-password.ejs` | Request form + confirmation |
| `views/auth/reset-password.ejs` | New password form |
| `views/auth/reset-invalid.ejs` | Expired/invalid/used messaging |
| `views/dev/mailbox.ejs` | Display generated emails + reset links |
| `tests/unit/mailService.test.js` | Mailbox append / clear / content |
| `tests/unit/passwordResetService.test.js` (or extend authService tests) | Token lifecycle |
| `tests/integration/passwordReset.test.js` | Full HTTP flows with CSRF + mailbox |

### 7.2 Files to modify

| File | Change |
|------|--------|
| `src/db.js` | Add `password_reset_tokens` + indexes |
| `src/services/authService.js` | Reset request / validate / apply methods |
| `src/routes/auth.js` | Forgot/reset handlers |
| `src/app.js` | Mount `/dev` routes |
| `views/auth/login.ejs` | Forgot-password link |
| `.env.example` | `APP_BASE_URL` only (no SMTP) |
| `API.md` / `README.md` | Reset + `/dev/mailbox` (minimal, after code) |

### 7.3 Service API (sketch)

```js
// mailService.js
function sendPasswordResetEmail({ to, resetUrl, expiresMinutes }) { /* push to array */ }
function getMailbox() { /* return copy, newest first */ }
function clearMailbox() { /* tests / optional UI */ }

// authService.js
async function requestPasswordReset(email) { /* validate; maybe send to mailbox; always same ok */ }
async function getValidResetToken(rawToken) { /* hash + unused + not expired */ }
async function resetPasswordWithToken(rawToken, password) { /* validate; update hash; mark used */ }
```

Reset URL: `${APP_BASE_URL}/auth/reset-password?token=${rawToken}`  
Default `APP_BASE_URL=http://localhost:3000`.

### 7.4 Timing / enumeration

Same confirmation path for known and unknown emails. Only registered addresses append a mailbox message.

---

## 8. Development Phases & Milestones

### Milestone A: Schema + token service (tests first)

- [ ] Unit tests: create / validate / expire / single-use / invalidate-prior
- [ ] Schema + service methods green

### Milestone B: In-memory mailbox

- [ ] `mailService` + unit tests (send / list / clear; body mentions 30 minutes)
- [ ] Unregistered email → no mailbox message

### Milestone C: HTTP routes + views + mailbox page

- [ ] Integration tests (Supertest + CSRF + mailbox assertions)
- [ ] Auth views, login link, `GET /dev/mailbox`
- [ ] Full demo path: forgot → mailbox → reset → login; old password fails; tasks intact

### Milestone D: Docs + cross-check

- [ ] `.env.example` (`APP_BASE_URL`), brief README note for `/dev/mailbox`
- [ ] Cross-check prd-002 §8
- [ ] Set this plan to `Implemented (YYYY-MM-DD)`

---

## 9. Resource Requirements

| Role | Effort |
|------|--------|
| Solo full-stack | Meetup-sized slice (~hours, not days) |

No SMTP credentials or external services.

---

## 10. Testing Strategy

Test-first: failing tests → minimal code → refactor.

### Unit

- Token hashing / expiry / single-use / invalidate prior
- `validatePassword` on reset
- Mailbox message content (URL, 30-minute wording)
- Unregistered email: mailbox unchanged

### Integration (`tests/integration/passwordReset.test.js`)

| Case | Expect |
|------|--------|
| Login has forgot link | `/auth/forgot-password` |
| Registered email | Same confirmation; mailbox has one message with token URL |
| Unregistered email | Same confirmation; mailbox empty |
| Invalid email format | 400 |
| Valid token + good password | Login works with new; fails with old |
| Reuse / expired / invalid token | Clear error + link to forgot |
| Tasks after reset | Still present after login |
| `GET /dev/mailbox` | Renders stored messages |

---

## 11. Performance & Scalability

N/A beyond MVP — in-memory mailbox is per-process and demo-scale only.

---

## 12. Security Considerations

| Threat | Mitigation |
|--------|------------|
| Email enumeration | Identical success message |
| Token guessing | 256-bit random; only hash stored |
| Token theft / replay | 30-minute TTL; single-use; prior tokens invalidated |
| CSRF | Existing protection on POST forms |
| Weak new password | Reuse `validatePassword` (min 8) |
| Dev mailbox exposure | Acceptable for local/demo only; document as non-production |

**Out of scope (prd-002 §10):** rate limiting, password-changed notification, MFA, real email providers.

---

## 13. Dependencies & Integration Points

| Integration | Detail |
|-------------|--------|
| Existing auth | `validatePassword`, `hashPassword`, `login`, email helpers |
| CSRF | Existing middleware + partial |
| DB init | New table via `initDatabase()` |
| Env | `APP_BASE_URL` only |

---

## 14. Risks & Mitigation (technical)

| Risk | Mitigation |
|------|------------|
| Meetup audience expects inbox | `/dev/mailbox` is the intentional stand-in; link from confirmation page |
| Mailbox lost on restart | Documented; re-request reset |
| Clock skew on expiry | Single clock source for `expires_at` checks |
| Schema drift vs tech-plan-001 | Additive table only |

---

## 15. Assumptions & Constraints

- PRD-002 must be `Active` before implementation starts.
- **No real email provider** — in-memory developer mailbox only (see §4.1).
- Multiple reset requests: only latest unused, unexpired token works (prd-002 §15.1).
- Must not break registration, login, logout, or task flows.
- Password rules remain min 8 characters.

---

## 16. Approval & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Technical Lead | Meetup demo | 2026-07-16 | Approved |
| Product (PRD Active) | Meetup demo | 2026-07-16 | Approved — prd-002 Active |

---

## 17. Traceability Matrix

| PRD § / AC | Technical delivery |
|------------|-------------------|
| §7.1 Request reset | `GET/POST /auth/forgot-password`, login link |
| §7.1 Same confirmation | Single success string |
| §7.1 “Receive” link if registered | Message in `/dev/mailbox` (demo delivery) |
| §7.2 30 min / single-use / unique | Token table rules |
| §7.2 Invalid link UX | `reset-invalid.ejs` |
| §7.3 Set password + invalidate | `resetPasswordWithToken` |
| §7.3 Old password fails / data intact | Integration tests |
| §7.4 No enumeration / unguessable | Message parity + crypto tokens |
| §8 Acceptance list | `tests/integration/passwordReset.test.js` (+ unit) |

---

## Appendix

### A. Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-16 | Initial draft (nodemailer / SMTP option) |
| 1.1 | 2026-07-16 | Constraint: in-memory developer mailbox only; no real email provider |
| 1.2 | 2026-07-16 | Status set to Active (meetup approval) |

### B. Explicit non-goals

- Real SMTP / nodemailer / third-party email  
- Auto-login after reset  
- Authenticated "change password"  
- Rate limiting  
- Password-changed notification email  

---

## End of Technical Plan

**Next step:** Start a **new agent chat** and implement (tests → code → cross-check → mark this plan `Implemented`).
