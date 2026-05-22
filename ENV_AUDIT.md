# GAMIFY — Environment Variable Audit Report

## Complete Variable Reference

| # | Variable | Used In | Purpose | Example Value | Required | Environment |
|---|----------|---------|---------|---------------|----------|-------------|
| 1 | `SECRET_KEY` | `backend/app/config.py` | Flask session signing | `a8f3d...64chars` | ✅ Required | Both |
| 2 | `JWT_SECRET_KEY` | `backend/app/config.py` | Signs JWT tokens | `b9e2c...64chars` | ✅ Required | Both |
| 3 | `DATABASE_URL` | `backend/app/config.py` | DB connection string | `postgresql://user:pass@host/db` | ✅ Required (prod) | Both |
| 4 | `FLASK_ENV` | `backend/run.py` | Config class selector | `production` | ✅ Required | Both |
| 5 | `TEST_DATABASE_URL` | `backend/app/config.py` | Test suite DB | `postgresql://...gamify_test` | Optional | Dev only |
| 6 | `CORS_ORIGINS` | `backend/app/__init__.py` | Allowed CORS origins | `https://gamify.app` | Optional | Production |
| 7 | `JWT_ACCESS_TOKEN_EXPIRES_HOURS` | `backend/app/config.py` | Access token TTL | `24` | Optional | Both |
| 8 | `JWT_REFRESH_TOKEN_EXPIRES_DAYS` | `backend/app/config.py` | Refresh token TTL | `30` | Optional | Both |
| 9 | `FLASK_PORT` | `backend/run.py` | Server port | `5000` | Optional | Both |
| 10 | `GUNICORN_WORKERS` | `docker-compose.yml` | Gunicorn worker count | `4` | Optional | Production |
| 11 | `GUNICORN_TIMEOUT` | `backend/.env.example` | Request timeout (sec) | `60` | Optional | Production |
| 12 | `POSTGRES_USER` | `docker-compose.yml` | PG container user | `postgres` | Required (Docker) | Both |
| 13 | `POSTGRES_PASSWORD` | `docker-compose.yml` | PG container password | `str0ngP@ss!` | Required (Docker) | Both |
| 14 | `POSTGRES_DB` | `docker-compose.yml` | PG database name | `gamify_prod` | Required (Docker) | Both |
| 15 | `VITE_API_URL` | `frontend/src/lib/api.js` | Backend API base URL | `https://api.gamify.app` | Optional (dev) / Required (prod standalone) | Production |
| 16 | `VITE_APP_NAME` | `frontend/.env.example` | App display name | `GAMIFY` | Optional | Both |
| 17 | `VITE_APP_VERSION` | `frontend/.env.example` | App version string | `1.0.0` | Optional | Both |

---

## Security Issues Found & Fixed

| Severity | Issue | File | Status |
|----------|-------|------|--------|
| 🔴 Critical | `SECRET_KEY` had insecure default `"dev-secret-change-in-prod"` | `config.py` | Default kept for dev, warn in prod |
| 🔴 Critical | `JWT_SECRET_KEY` had insecure default | `config.py` | Default kept for dev, warn in prod |
| 🔴 Critical | Hardcoded `SECRET_KEY: change-me-in-production` in docker-compose | `docker-compose.yml` | **Fixed** — now uses `${SECRET_KEY:?}` |
| 🔴 Critical | Hardcoded `JWT_SECRET_KEY: change-jwt-in-production` in docker-compose | `docker-compose.yml` | **Fixed** — now uses `${JWT_SECRET_KEY:?}` |
| 🟠 High | CORS set to `"*"` (all origins allowed) | `app/__init__.py` | **Fixed** — now reads `CORS_ORIGINS` env var |
| 🟠 High | `VITE_API_URL` referenced in docker-compose but not consumed in `api.js` | `api.js` | **Fixed** — now uses `import.meta.env.VITE_API_URL` |
| 🟡 Medium | `TEST_DATABASE_URL` had hardcoded credentials in source | `config.py` | Reads from env, hardcoded only as fallback |
| 🟡 Medium | JWT expiry times hardcoded | `config.py` | **Fixed** — now reads from env vars |
| 🟢 None | No OAuth, mail, Redis, or cloud storage secrets | — | N/A — not used in this app |

---

## Variables Exposed to Client (Public)

These are bundled into the frontend JS bundle — **never put secrets here**:

| Variable | Safe to expose? | Reason |
|----------|----------------|--------|
| `VITE_API_URL` | ✅ Yes | Just a URL, no secret |
| `VITE_APP_NAME` | ✅ Yes | Display string |
| `VITE_APP_VERSION` | ✅ Yes | Display string |

JWT tokens are stored in `localStorage` (not env vars) — this is standard but note that `localStorage` is vulnerable to XSS. Consider `httpOnly` cookies for higher security in future.

---

## Deployment Checklists

### Railway (Backend)

Set these in Railway → Project → Variables:

```
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(64))">
JWT_SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(64))">
DATABASE_URL=<Railway provides this automatically when you add PostgreSQL plugin>
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend.up.railway.app
JWT_ACCESS_TOKEN_EXPIRES_HOURS=24
JWT_REFRESH_TOKEN_EXPIRES_DAYS=30
GUNICORN_WORKERS=4
```

Start command: `gunicorn --bind 0.0.0.0:$PORT --workers $GUNICORN_WORKERS run:app`

Note: Railway injects `PORT` automatically — update `run.py` to use `os.getenv("PORT", 5000)` if needed.

---

### Render (Backend — Web Service)

Set these in Render → Environment:

```
SECRET_KEY=<random 64 char hex>
JWT_SECRET_KEY=<random 64 char hex>
DATABASE_URL=<Render PostgreSQL internal URL>
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend.onrender.com
GUNICORN_WORKERS=2
```

Build command: `pip install -r requirements.txt`
Start command: `gunicorn --bind 0.0.0.0:10000 --workers 2 run:app`

---

### Vercel (Frontend only — backend must be deployed separately)

Set these in Vercel → Project → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.railway.app
VITE_APP_NAME=GAMIFY
VITE_APP_VERSION=1.0.0
```

Build command: `npm run build`
Output directory: `dist`
Framework preset: `Vite`

---

### Docker (Self-hosted)

Create a `.env` file in the project root (next to `docker-compose.yml`):

```env
SECRET_KEY=<random 64 char hex>
JWT_SECRET_KEY=<random 64 char hex>
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong password>
POSTGRES_DB=gamify_prod
FLASK_ENV=production
CORS_ORIGINS=https://yourdomain.com
GUNICORN_WORKERS=4
```

Then run: `docker-compose up --build`

---

## Generate Secure Keys

Run this once to generate production-ready secrets:

```bash
python -c "
import secrets
print('SECRET_KEY=' + secrets.token_hex(64))
print('JWT_SECRET_KEY=' + secrets.token_hex(64))
"
```

---

## Unused Variables

| Variable | Status |
|----------|--------|
| `VITE_APP_NAME` | Defined in `.env.example` but not yet consumed in code — optional |
| `VITE_APP_VERSION` | Same as above — optional |

---

## Not Applicable (no integration exists)

These are common variables that do NOT apply to this app:

- `REDIS_URL` — no caching layer
- `MAIL_*` — no email sending
- `OAUTH_*` — no social login
- `AWS_*` / `S3_*` — no file storage
- `STRIPE_*` — no payments
- `SENTRY_DSN` — no error tracking (recommended to add)
