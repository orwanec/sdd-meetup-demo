# TaskFlow — API Reference

HTTP routes for TaskFlow MVP v1.0. The application uses **session-based authentication** (cookie `taskflow.sid`) and **CSRF protection** on all state-changing requests.

---

## Authentication

All protected routes require an active session. Unauthenticated browser requests are redirected to `/auth/login`. JSON API requests without a session receive `302` redirect to login (Supertest follows redirects; browsers do not receive JSON without auth).

### CSRF tokens

State-changing requests (`POST`, `PUT`, `DELETE`, etc.) must include a valid CSRF token:

| Method | How to submit |
|--------|---------------|
| HTML forms | Hidden field `_csrf` (included via `views/partials/csrf-field.ejs`) |
| JSON / fetch | Header `X-CSRF-Token` (token from `<meta name="csrf-token">` on dashboard) |

Invalid or missing tokens return **403** with `{ success: false, error: "Invalid CSRF token." }` for JSON endpoints.

---

## Root

### `GET /`

Redirects based on session state.

| Condition | Response |
|-----------|----------|
| Authenticated | `302` → `/dashboard` |
| Not authenticated | `302` → `/auth/login` |

---

## Authentication routes

Base path: `/auth`

### `GET /auth/register`

Renders the registration form.

**Response:** `200` HTML

---

### `POST /auth/register`

Creates a new user account.

**Content-Type:** `application/x-www-form-urlencoded`

| Field | Type | Rules |
|-------|------|-------|
| `email` | string | Required, valid format, unique (stored lowercase) |
| `password` | string | Required, minimum 8 characters |
| `_csrf` | string | Required |

**Responses:**

| Status | Body / behavior |
|--------|-----------------|
| `302` | Redirect to `/auth/login?registered=1` on success |
| `400` | Re-render form with validation error |
| `409` | Re-render form — email already registered |

**Example:**

```bash
# Browser form POST; use session + CSRF token from GET /auth/register
curl -c cookies.txt -b cookies.txt \
  -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=user@example.com&password=secret123&_csrf=TOKEN"
```

---

### `GET /auth/login`

Renders the login form. Shows a success message when `?registered=1` is present.

**Response:** `200` HTML

---

### `POST /auth/login`

Authenticates a user and creates a session.

**Content-Type:** `application/x-www-form-urlencoded`

| Field | Type | Rules |
|-------|------|-------|
| `email` | string | Required |
| `password` | string | Required |
| `_csrf` | string | Required |

**Responses:**

| Status | Body / behavior |
|--------|-----------------|
| `302` | Redirect to `/dashboard` — session contains `{ user: { id, email } }` |
| `401` | Re-render form — invalid credentials (generic message) |

---

### `POST /auth/logout`

Destroys the current session.

**Auth:** Session required (form POST from dashboard)

**Response:** `302` → `/auth/login`

---

## Dashboard

### `GET /dashboard`

Renders the authenticated user's dashboard with task statistics and task list.

**Auth:** Session required

**Response:** `200` HTML containing:

- User greeting (`Hello, {email}!`)
- Stats: total, open, and completed task counts
- Task list with complete actions for open tasks

**Unauthenticated:** `302` → `/auth/login`

---

## Task routes

Base path: `/tasks`

### `GET /tasks/create`

Renders the task creation form.

**Auth:** Session required

**Response:** `200` HTML

---

### `POST /tasks/create`

Creates a new task for the authenticated user.

**Auth:** Session required

**Content-Type:** `application/x-www-form-urlencoded`

| Field | Type | Rules |
|-------|------|-------|
| `title` | string | Required, non-empty after trim (max 200 chars) |
| `description` | string | Optional (max 2000 chars) |
| `_csrf` | string | Required |

**Responses:**

| Status | Body / behavior |
|--------|-----------------|
| `302` | Redirect to `/dashboard` on success |
| `400` | Re-render form with validation error |

New tasks are created with `status: "open"`.

---

### `POST /tasks/:id/complete`

Marks a task as completed.

**Auth:** Session required — task must belong to the current user

**CSRF:** Required via `_csrf` form field or `X-CSRF-Token` header

**Responses:**

| Status | Body |
|--------|------|
| `200` | `{ "success": true, "task": { ... } }` |
| `404` | `{ "success": false, "error": "Task not found." }` |
| `403` | `{ "success": false, "error": "Invalid CSRF token." }` |

**Task object shape:**

```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk and eggs",
  "status": "completed",
  "created_at": "2026-07-13 12:00:00",
  "completed_at": "2026-07-13 12:05:00"
}
```

---

## JSON API

Base path: `/api`

### `GET /api/tasks`

Returns tasks for the authenticated user as JSON.

**Auth:** Session required

**Query parameters:**

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `status` | `open`, `completed`, `all` | `all` | Filter by task status |

**Response:** `200` — JSON array of task objects (newest first)

```json
[
  {
    "id": 2,
    "user_id": 1,
    "title": "Write report",
    "description": null,
    "status": "open",
    "created_at": "2026-07-13 12:00:00",
    "completed_at": null
  }
]
```

**Errors:**

| Status | When |
|--------|------|
| `400` | Invalid `status` query value |
| `302` | Not authenticated (redirect to login) |

---

## Error handling summary

| HTTP status | Typical cause |
|-------------|---------------|
| `400` | Validation failure (empty title, invalid filter) |
| `401` | Invalid login credentials |
| `403` | Missing or invalid CSRF token |
| `404` | Task not found or not owned by user |
| `409` | Duplicate email on registration |

---

## Spec traceability

| Endpoint | PRD requirement |
|----------|-----------------|
| `POST /auth/register` | 7.1 User Registration |
| `POST /auth/login` | 7.2 User Login |
| `POST /auth/logout` | 7.5 Logout |
| `GET /dashboard` | 7.3 Dashboard, 7.4 Task Viewing |
| `POST /tasks/create` | 7.4 Task Creation |
| `POST /tasks/:id/complete` | 7.4 Task Completion |
| `GET /api/tasks` | 7.4 Task Viewing |

See [specs/prd-001.md](specs/prd-001.md) for acceptance criteria and [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) for implementation details.
