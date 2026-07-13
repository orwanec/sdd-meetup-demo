# TaskFlow — Troubleshooting

Common issues and fixes when running TaskFlow locally or in production.

---

## Installation and startup

### `Error: Database not initialized. Call initDatabase() first.`

**Cause:** Code called `getDb()` before `initDatabase()` completed.

**Fix:** Always start via `server.js` or ensure tests call `initDatabase()` in `beforeEach` (see [tests/setup.js](tests/setup.js)).

---

### `Failed to start server: SQLITE_CANTOPEN`

**Cause:** The process cannot create or open the SQLite file at `DB_PATH`.

**Fix:**

1. Ensure the parent directory exists and is writable:
   ```bash
   mkdir -p data
   chmod 755 data
   ```
2. Check `DB_PATH` in `.env` points to a valid path.
3. On production, confirm the persistent volume is mounted.

---

### Port already in use (`EADDRINUSE`)

**Cause:** Another process is listening on port 3000 (or your configured `PORT`).

**Fix:** Kill whatever is holding port 3000, then restart:

```bash
kill -9 $(lsof -ti tcp:3000)
npm start
```

If nothing is listening, `lsof` prints nothing and the kill command is harmless.

Alternatives:

```bash
# Inspect which process uses the port
lsof -i :3000

# Or run on a different port
PORT=3001 npm start
```

---

### `npm install` fails or hangs

**Fix:**

1. Confirm Node.js ≥ 22.15.0: `node --version`
2. Clear cache and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. On Apple Silicon, ensure native modules (sqlite3) compile — install Xcode Command Line Tools if prompted.

---

## Authentication and sessions

### Login succeeds but dashboard redirects back to login

**Cause:** Session cookie not persisted — often `SESSION_SECRET` changed between restarts, or cookies blocked.

**Fix:**

1. Use a stable `SESSION_SECRET` in `.env`.
2. In production, serve over **HTTPS** — secure cookies are rejected on plain HTTP when `NODE_ENV=production`.
3. Check browser allows cookies for localhost/your domain.

---

### "Invalid credentials" on correct password

**Cause:** Email is normalized to lowercase; typo in email, or account registered with different casing.

**Fix:** Use the exact email registered. Re-register if unsure (or check `users` table in SQLite).

---

### Back button shows dashboard after logout

**Cause:** Browser back/forward cache (bfcache).

**Fix:** Already handled — dashboard includes a `pageshow` reload script. Hard-refresh (`Cmd+Shift+R`) if needed.

---

## CSRF errors

### `403 Invalid CSRF token` on form submit

**Cause:** Missing `_csrf` field, stale token, or session expired.

**Fix:**

1. Ensure forms include `<%- include('../partials/csrf-field') %>`.
2. For fetch/AJAX, send `X-CSRF-Token` header from the meta tag on the dashboard.
3. Reload the page to get a fresh token after session changes.

---

### Task complete button does nothing

**Cause:** JavaScript fetch failed (CSRF, network) or task already completed.

**Fix:**

1. Open browser DevTools → Network tab and inspect `POST /tasks/:id/complete`.
2. Confirm `<meta name="csrf-token">` is present on the dashboard page.
3. Check response status — `404` means wrong task ID or another user's task.

---

## Tasks and database

### Tasks disappear after restart (production)

**Cause:** Ephemeral filesystem (common on Heroku/serverless) — SQLite file was not persisted.

**Fix:** Use persistent storage or migrate to PostgreSQL. See [DEPLOYMENT.md](DEPLOYMENT.md).

---

### `Email is already registered` when seeding

**Cause:** `npm run seed` was run before; demo users already exist.

**Fix:** Expected behavior — seed skips existing users. Delete `data/taskflow.db` and restart to reset (development only):

```bash
rm -f data/taskflow.db
npm start
npm run seed
```

---

## Testing

### Tests fail with timeout on auth tests

**Cause:** bcrypt hashing is CPU-intensive; parallel tests may exceed Jest timeout.

**Fix:** Timeout is set to 10s in [package.json](package.json). Run tests serially if needed:

```bash
npm test -- --runInBand
```

---

### `CSRF token not found in response HTML`

**Cause:** Test helper expected a form with `_csrf` but page did not render it.

**Fix:** Ensure the target route renders a form with CSRF partial, or pass the correct `formUrl` to `postFormWithCsrf` in [tests/helpers/http.js](tests/helpers/http.js).

---

## Development

### `npm run dev` does not restart on changes

**Cause:** nodemon not installed or wrong script.

**Fix:**

```bash
npm install
npm run dev
```

Uses `nodemon server.js` per [package.json](package.json).

---

## Getting more help

1. Run `npm test` — failing tests often pinpoint regressions.
2. Check server console for stack traces.
3. Review [SETUP.md](SETUP.md) and [API.md](API.md).
4. Open an issue with `tech:` prefix and include Node version, OS, and error output.
