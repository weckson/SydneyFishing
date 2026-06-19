# Sydney Fishing API (MVP backend)

The community backend for the Sydney Fishing app: **accounts + catch reports + reviews**.
The static PWA at the repo root is unchanged and keeps working on its own; this server is
additive (strangler-fig migration). Scope & non-goals: see [../SCOPE.md](../SCOPE.md).

## Stack (deliberately lean / low-cost)
- **Fastify** (single small framework) + **PostgreSQL** (`pg`), no ORM
- Argon2id passwords (`@node-rs/argon2`, prebuilt — no native build on Windows)
- Opaque, revocable sessions in an HttpOnly+SameSite cookie (no JWT to leak)
- helmet + CORS + rate-limit baseline

## Run locally

### Option A — zero setup (in-memory DB, great for a quick try)
No Postgres/Docker needed. Data is in-memory and resets on restart.
```bash
cd server
npm install
npm run dev:mem               # http://localhost:3000  (pg-mem)
```
Caveat: pg-mem doesn't emulate `ON CONFLICT` dedup, so the review-import idempotency
only truly holds on real Postgres (the UNIQUE constraint still exists).

### Option B — real Postgres (use this for anything real)
```bash
cd server
cp .env.example .env          # then edit COOKIE_SECRET
docker compose up -d          # starts Postgres on :5432 (or use your own; set DATABASE_URL)
npm install
npm run migrate               # applies db/schema.sql (idempotent)
npm run dev                   # http://localhost:3000
```

With either option, open the PWA (e.g. `npx serve -l 5500 ..`) and it auto-detects the API
at `http://localhost:3000`. Override via `window.SF_CONFIG = { apiBase: "…" }`.

Smoke test:
```bash
curl localhost:3000/healthz                       # {"ok":true,...}
curl localhost:3000/readyz                         # {"ok":true,"db":"up"}
# register (sets HttpOnly cookie into cookies.txt)
curl -c cookies.txt -X POST localhost:3000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"a@b.com","password":"hunter2hunter","displayName":"Tester"}'
curl -b cookies.txt localhost:3000/api/auth/me
```

## API (MVP)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET  | `/healthz` `/readyz` | – | liveness / readiness |
| POST | `/api/auth/register` | – | create account, start session |
| POST | `/api/auth/login` | – | start session |
| POST | `/api/auth/logout` | cookie | end session |
| GET  | `/api/auth/me` | cookie | current user |
| GET  | `/api/reviews?spotId=` | – | list reviews for a spot |
| POST | `/api/reviews` | cookie | add a review |
| POST | `/api/reviews/import` | cookie | migrate localStorage `sf_reviews_v1` (idempotent) |
| GET  | `/api/catches?spotId=` | – | public catch reports for a spot |
| GET  | `/api/catches/mine` | cookie | my catch reports |
| POST | `/api/catches` | cookie | log a catch (+ frozen `conditionsSnapshot`) |
| DELETE | `/api/catches/:id` | cookie+owner | soft-delete own catch |

## Next increments (not built yet)
1. PWA wiring: a login sheet + "log a catch" form + send the engine's snapshot.
2. Photo upload with server-side EXIF/GPS stripping.
3. Email verification (SES) — column + toggle already in place.
4. Render-safety pass on the PWA before reviews are served from the DB (sanitize sinks + CSP).
