# TaskFlow — Deployment Guide

Production deployment options and checklist for TaskFlow MVP v1.0.

TaskFlow is a **Node.js + Express + SQLite** server-rendered application. It does not require a build step.

---

## Pre-deployment checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set a strong, unique `SESSION_SECRET` (32+ random characters)
- [ ] Ensure `data/` directory is writable (SQLite file at `DB_PATH`)
- [ ] Run `npm test` and confirm all tests pass
- [ ] Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues

---

## Environment variables (production)

Copy [.env.example](.env.example) and set:

```env
PORT=3000
NODE_ENV=production
SESSION_SECRET=<generate-a-long-random-secret>
SESSION_TIMEOUT=3600000
DB_PATH=./data/taskflow.db
CORS_ORIGIN=https://your-domain.example
```

**Security notes:**

- In production, cookies are marked `secure: true` (HTTPS required).
- `trust proxy` is enabled when `NODE_ENV=production` (for reverse proxies).
- Helmet security headers are applied via [src/app.js](src/app.js).

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Option 1: Self-hosted VPS (recommended for SQLite)

Best fit because SQLite stores data in a local file.

### Stack

- Ubuntu/Debian VPS
- Node.js 22.x
- nginx reverse proxy
- systemd service
- Let's Encrypt TLS

### Steps

1. **Install Node.js 22** on the server.

2. **Clone and install:**

   ```bash
   git clone https://github.com/orwanec/sdd-meetup-demo.git
   cd sdd-meetup-demo
   npm ci --omit=dev
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Create systemd unit** (`/etc/systemd/system/taskflow.service`):

   ```ini
   [Unit]
   Description=TaskFlow
   After=network.target

   [Service]
   Type=simple
   User=taskflow
   WorkingDirectory=/opt/taskflow
   Environment=NODE_ENV=production
   EnvironmentFile=/opt/taskflow/.env
   ExecStart=/usr/bin/node server.js
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

4. **Configure nginx** as reverse proxy:

   ```nginx
   server {
     listen 443 ssl;
     server_name tasks.example.com;

     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

5. **Start the service:**

   ```bash
   sudo systemctl enable --now taskflow
   ```

6. **Back up** `data/taskflow.db` regularly (cron + off-site copy).

---

## Option 2: Railway

1. Connect the GitHub repository.
2. Set environment variables in the Railway dashboard.
3. Add a **persistent volume** mounted at `./data` so SQLite survives redeploys.
4. Railway sets `PORT` automatically — do not hardcode it.

**Procfile** (optional):

```
web: node server.js
```

---

## Option 3: Heroku

1. Create app and set config vars (`SESSION_SECRET`, `NODE_ENV=production`).
2. Add a **persistent add-on or external database** — Heroku's ephemeral filesystem resets on dyno restart, which will **wipe SQLite** unless you use a mounted volume (Heroku no longer offers free ephemeral-friendly persistence for SQLite).

For Heroku, consider migrating to PostgreSQL (Phase 2) instead of SQLite.

**Procfile:**

```
web: node server.js
```

---

## Option 4: Docker (single container)

Example `Dockerfile`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p data
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

Mount a volume for `/app/data` to persist the database:

```bash
docker run -p 3000:3000 -v taskflow-data:/app/data --env-file .env taskflow
```

---

## Database considerations

| Environment | Storage | Notes |
|-------------|---------|-------|
| Development | SQLite file | Default `./data/taskflow.db` |
| Production (MVP) | SQLite file | Requires persistent disk |
| Production (scale) | PostgreSQL / MySQL | Recommended for multi-instance deployments |

SQLite limitations in production:

- Single write connection — not ideal for high concurrency
- File must live on persistent storage
- Backups are file copies (stop writes or use SQLite backup API for consistency)

---

## Process management

| Tool | Command |
|------|---------|
| Direct | `npm start` |
| PM2 | `pm2 start server.js --name taskflow` |
| systemd | See Option 1 |

Always run with `NODE_ENV=production`.

---

## Health check

There is no dedicated `/health` endpoint in MVP v1.0. Verify deployment with:

```bash
curl -I http://localhost:3000/
# Expect: HTTP/1.1 302 Found (redirect to /auth/login)
```

---

## Rollback

1. Tag releases in Git (`git tag v1.0.0`).
2. Keep a backup of `data/taskflow.db` before schema changes.
3. To roll back code: checkout the previous tag and restart the process.
4. See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Future enhancements

- PostgreSQL adapter for horizontal scaling
- Rate limiting on auth endpoints
- Dedicated `/health` and `/ready` probes
- Structured logging and error tracking (Sentry)
- CI/CD pipeline with automated deploy on green tests

See [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) §8 and §12.3 for the full roadmap.
