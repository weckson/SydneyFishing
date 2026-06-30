# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo. Read this first.

> 双语项目（zh/en）。代码注释与界面均为中英双语；本文件以英文为主，关键约束附中文。

## What this is

**悉尼钓鱼 · Sydney Fishing** — a bilingual (zh/en) PWA that recommends Sydney
land-based fishing spots using a live scoring engine (weather / tide / moon /
season / access), and is growing into a **community platform** (accounts, catch
reports, reviews, forum, insights).

Two independently-deployable parts in one repo:

1. **Static PWA** (repo root) — vanilla JS, **no build step, no bundler, no npm**.
   Plain `<script>` tags in `index.html`. Works fully standalone (map + scoring)
   even with the backend offline.
2. **Backend API** (`server/`) — Fastify + PostgreSQL. **Additive / strangler-fig**:
   the PWA degrades gracefully when it's unreachable (`SF_API.available = false`).
   Never make the static map/scoring experience depend on the server.

## ⛔ Scope guardrails — read `SCOPE.md` before adding features

This is an **online experience-sharing community**, NOT an in-person matchmaking
service. The following are **explicitly prohibited** (legal/duty-of-care reasons —
Sydney rock fishing has annual drownings):

- ❌ In-person meetup / find-a-buddy matchmaking
- ❌ Stranger boat-trip / charter matchmaking or payments
- ❌ Any feature that brings strangers together at a physical location

Implementation rule: **do not create `buddy`/`boat` tables, do not add meetup APIs.**
If asked to, point to `SCOPE.md` and confirm before proceeding.

Compliance: data stays in Australia (`ap-southeast-2`); Open-Meteo free tier is
**non-commercial** (see `DEPLOY.md` §0 before going live).

## Repo map

```
index.html              PWA entry; <script> load ORDER matters; CSP lives here
spots.js                window.SYDNEY_SPOTS — 205 spot objects (the core dataset)
access.js               window.ACCESS_DATA — transport/terrain per spot
rigs.js                 window.RIGS_BY_SPECIES — rig recommendations
seasons.js              window.SPECIES_SEASONS + SEASON_SPECIES_WEIGHTS
regulations.js          window.NSW_REGULATIONS + NSW_REGULATIONS_META + SAFETY_CONTENT (NSW size/bag/safety)
regions.js              window.SF_REGIONS + spotRegionId() — client-side spot→region buckets
cams.js                 window.SF_CAMS + camsForRegion() — live wave/surf monitoring links
reviews.js              window.SEED_REVIEWS — external discussion links
app.js                  CORE: Leaflet map + scoring engine v1.5 + spot search + spot detail
api.js                  window.SF_API — backend HTTP client (degrades gracefully)
auth-ui.js              window.SF_AUTH_UI — login/register modal
forum.js                community forum view (hash routes #/forum/...)
notify.js               notifications bell + polling
insights.js             本周鱼讯 weekly catch insights (#/insights)
admin.js                moderation panel (#/admin; report triage + takedown, admins only)
scene.js                鱼种×钓点 decision page (#/scene/:spotId/:species) — reuses app.js building blocks
glossary.js             window.SF_GLOSSARY — zh/en fishing-term glossary (#/glossary)
kits.js                 window.SF_KITS — scenario gear kits (#/kits)
competitions.js         online-comp view (#/comp) — DORMANT (unwired; kept for revival)
pwa-init.js             SW registration + iOS A2HS hint
service-worker.js       offline cache (cache-first; bump version on PWA release)
manifest.json, icons/   PWA manifest + app icons
styles.css              all styles (single file)
SCOPE.md                product red lines (READ before features)
DEPLOY.md               full decoupled deploy (Lightsail container + R2 + CloudFront)
DEPLOY-budget.md        CHOSEN cheap path: one Lightsail VM, Docker Compose (caddy+api+pg)
docker-compose.prod.yml prod stack; Dockerfile.caddy + Caddyfile = static edge + TLS + proxy

server/
  src/server.js         boot + graceful shutdown
  src/app.js            Fastify wiring: helmet, cors, cookie, multipart, static, rate-limit, routes
  src/config.js         env config; FAILS FAST in prod on insecure defaults
  src/db.js             single pg Pool; TLS auto-on in prod
  src/auth.js           Argon2id + opaque session cookies
  src/storage.js        pluggable image storage: "local" | "s3"(R2)
  src/photos.js         sharp resize + EXIF/GPS strip
  src/mailer.js         dev-log mailer; SES in prod
  src/migrate.js        applies db/schema.sql (idempotent)
  src/routes/*.routes.js   auth, reviews, catches, media, forum, notifications, insights, intel, admin
                           (competitions.routes.js present but UNREGISTERED — dormant)
  src/ingest/           fishing-intel harness: sources · fetcher · summarize (opt LLM) · run · scheduler
  db/schema.sql         Postgres schema (all CREATE ... IF NOT EXISTS)
  .env.example          copy to .env (gitignored); never commit secrets
```

## Frontend architecture (no build step)

- **Global namespace pattern.** Data modules attach to `window.*`
  (`SYDNEY_SPOTS`, `ACCESS_DATA`, `RIGS_BY_SPECIES`, `SPECIES_SEASONS`,
  `SEASON_SPECIES_WEIGHTS`, `NSW_REGULATIONS`/`SAFETY_CONTENT`, `SF_REGIONS`, `SEED_REVIEWS`,
  `SF_GLOSSARY`, `SF_KITS`, `SF_API`, `SF_AUTH_UI`). `app.js` and the view modules define
  top-level functions in global scope (the view modules call `window.*` helpers defined in
  `app.js`). **`<script>` load order in `index.html` is the dependency graph** — data modules
  (incl. `regulations.js`/`regions.js`) + `api.js`/`auth-ui.js` load before `app.js`, which loads
  before the view modules `forum.js`/`notify.js`/`insights.js`/`admin.js`/`scene.js`/`glossary.js`/`kits.js`.
  Adding a frontend file = add a `<script>` in `index.html` (right position) **and** add it to
  `SHELL_FILES` in `service-worker.js` (and bump the SW cache version). The prod Caddy image
  auto-serves any root-level `*.js/*.css/*.html/*.json`, so no deploy-file edit is needed.
- **Scoring engine (v1.5, in `app.js`).** `scoreSpot(spot, refLoc, cond, mode)`
  returns a **finished** 0–100 `displayScore` plus an immutable factor breakdown.
  The live multiplier product is:

  ```
  condScore = baseScore × weather × tide × time × moon × season × access
  display   = displayScoreFor(baseScore, condScore / baseScore)   // shown 0–100
  ```

  `displayScoreFor` (v1.4.1+ **reputation-anchor + conditions-swing**) maps the spot's
  reputation band + the live product onto the full 0–100 scale: a neutral day reads ≈ the
  spot's reputation band, a great day → ~100 (the old direct clamp crammed everything into
  ~32–88). **Rank on `.score` (= condScore × distancePenalty), NEVER on `.displayScore`** —
  sorting on displayScore reorders the board. Distance is never in the score; it only affects
  ranking in `near`/`family`. `mode` ∈ `fish` | `near` | `family`. Helpers: `tideFactorFor`,
  `seasonFactorFor` (**strength-weighted**: each target species' season curve weighted by its
  strength; species absent from `SPECIES_SEASONS` are skipped, not counted as neutral 1.0),
  `displayScoreFor`, `toDisplayScore` (now just a 0–100 clamp). Keep the "算法说明 / Algorithm"
  modal in `index.html` in sync. Every score emits a `conditions_snapshot` (frozen weather/
  tide/moon/season + `engineVersion` = "1.5") — catch reports persist it for later calibration.
  **Don't break the snapshot shape.**
- **Live data + instant conditions.** Weather/marine/tide come from Open-Meteo, fetched per
  ~22 km coastal zone (not one map-center call), cached 10 min; times in Sydney tz. The center
  pill and every spot detail **seed instantly from the nearest preloaded zone**
  (`conditionsForSpot` / `nearestRegionConditions`), then a per-spot fetch refines them
  (race-guarded) — no "loading…" wait, and the pill tracks the search pin on drag.
- **Spot search.** `#spotSearch` filters by name (zh / en / `area` suburb) and **bypasses the
  radius gate** so a match always surfaces even if far from the map center; `×` clears it.
- **Backend client.** `api.js` reads `window.SF_CONFIG.apiBase` (set it before
  `api.js` loads). Default base: `http://localhost:3000` when served on port
  5500/5501 (static preview), else same-origin. All calls use
  `credentials:"include"` (HttpOnly session cookie). If the API is down the app
  stays a pure map/scoring tool (reviews fall back to `localStorage`).

## Backend architecture (`server/`)

- **Stack:** Fastify 5 + PostgreSQL (`pg`, no ORM), ESM (`"type":"module"`,
  Node ≥20). Argon2id passwords (`@node-rs/argon2`, prebuilt — no native build).
- **Sessions:** opaque token, only its SHA-256 hash stored in `sessions`; raw
  token lives in an HttpOnly+SameSite cookie. Logout/ban = delete the row.
- **Security baked in:** helmet + CORS (credentialed, explicit origins) +
  rate-limit; `trustProxy` = exact hop count (anti XFF-spoof); image uploads
  strip EXIF/GPS and cap pixels; storage keys are allowlisted (anti path-traversal);
  all mutating routes do ownership checks. `config.js` **refuses to boot in
  production** if `COOKIE_SECRET` is a dev default, `DATABASE_URL` is unset, or a
  CORS origin isn't https — intentional fail-fast.
- **Storage drivers** (`storage.js`): `local` (disk `/uploads`, dev) or `s3`
  (Cloudflare R2, prod, zero egress). DB stores only the key; `publicUrl()`
  decides URL shape — switching drivers needs no schema/caller change.
- **Schema** (`db/schema.sql`, idempotent): `users`, `sessions`, `catch_reports`
  (with `conditions_snapshot jsonb`), `reviews`, `media`, `forum_categories/threads/
  posts`, `reactions`, `forum_reports`, `notifications`, `email_verifications`,
  `fishing_intel` + `ingest_runs` (intel harness), `competitions` (dormant — feature unwired).
  `spot_id` is the **text id from `spots.js`** (e.g. `bare-island`) — the 205-spot
  dataset is intentionally NOT migrated into the DB. `forum_categories` is seeded with topic
  boards **plus 6 `r-*` regional boards** (Sydney Harbour / Northern Beaches / South / Central
  Coast / Wollongong / Hawkesbury).
- **Moderation:** any signed-in user can report a catch (`POST /api/catches/:id/report`) or a
  forum thread/post; reports land in the generic `forum_reports` table. `requireAdmin` (role
  `admin`/`moderator`) gates `/api/admin/*` — list open reports + take down (soft-delete)
  catches/threads/posts, which also soft-deletes attached media. Bootstrap the first admin with
  SQL (`UPDATE users SET role='admin' WHERE email=…`); see `DEPLOY-budget.md` §4. Takedowns are
  soft-deletes (audit/legal-hold) — never hard-delete reported content.
- **Fishing-intel ingest harness** (`src/ingest/`): a backend cron (`scheduler.js` — runs on a
  timer, `INGEST_INTERVAL_HOURS`, + an optional boot run in prod) upserts curated **official-source
  + community-link** items into `fishing_intel`, served read-only at `/api/intel` (surfaced in the
  insights "钓鱼动态" feed + per-species on scene pages). Idempotent via `dedup_hash`. AI
  summarisation (`summarize.js`, Anthropic Messages API, no SDK) is **OPTIONAL — gated on
  `ANTHROPIC_API_KEY`** (no key = link items only, zero LLM cost). Admin trigger:
  `POST /api/intel/run`. Env documented in `.env.example` (`INGEST_*`, `ANTHROPIC_*`); the prod
  compose passes `ANTHROPIC_API_KEY` through. Sources (`sources.js`) are **diversified, not
  Reddit-only**: 小红书 (Chinese) / Fishraider-Deckee / YouTube how-to / bilibili / Reddit + a
  `tutorial` kind that feeds the insights "🎓 新手必看" section. Live wave cams are a SEPARATE
  static layer (`cams.js`, frontend) — CSP-safe links (MHL buoys + Swellnet), not part of this feed.
- **Competitions = dormant.** `competitions.routes.js` + the `competitions` table exist (online-only
  leaderboard derived from public catches) but were **removed from the UX** by product decision —
  the route is unregistered and the frontend unwired. Kept for easy revival; don't re-enable without
  confirming against `SCOPE.md` (online-only — never in-person).
- API surface: see `server/README.md`.

## Running locally

**PWA** (static, no install):
```bash
npx serve -l 5500 .         # then open http://localhost:5500  (auto-detects API on :3000)
```

**Backend** — two options:
```bash
cd server && npm install
npm run dev:mem             # Option A: in-memory pg-mem, zero setup, resets on restart
# — or real Postgres —
cp .env.example .env        # edit COOKIE_SECRET
docker compose up -d        # Postgres on :5432
npm run migrate             # apply schema (idempotent)
npm run dev                 # http://localhost:3000  (node --watch)
```
Smoke test: `curl localhost:3000/healthz` and `/readyz` (`db:up`). More in `server/README.md`.

There is **no test suite and no linter** configured. Verify changes by running the
app. When changing the PWA, also bump the cache version in `service-worker.js`
(cache-first SW, or updates won't show).

## Conventions

- **Bilingual everywhere:** every user-facing string is zh + en; data objects carry
  `name`/`nameCn`, `tips`/`tipsCn`, etc. Match this when adding content.
- **Security-first rendering:** CSP in `index.html` has **no `script-src
  'unsafe-inline'`** — never introduce inline event handlers or `innerHTML` with
  unsanitized DB/user content; escape before insertion.
- **Vanilla only on the frontend** — no framework, no build tooling. Keep it that way
  unless explicitly asked.
- Commit style: conventional-ish (`feat:`, `chore:`, `vX.Y:`) — match recent history.

## ⚠️ Two-machine git workflow — don't lose files on push

This repo is developed on **two computers**, synced only through GitHub
(`origin` = `github.com/weckson/SydneyFishing`, branch `main`). The #1 risk is
**committing without staging a new file**, so it never gets pushed. Rules:

**开始工作前 · At the START of a session — pull first:**
```bash
git pull --rebase            # this machine has pull.rebase=true already
```

**结束工作时 · Before you finish — stage EVERYTHING, then verify, then push:**
```bash
git add -A                   # -A stages NEW + modified + deleted. NEVER use `git commit -am`
                             #    (it silently skips brand-new untracked files)
git status                   # eyeball it: are all intended files staged?
git commit -m "…"
git push
git status                   # MUST end on: "working tree clean" + "up to date with origin/main"
```

**Verify nothing important is being ignored** (run if a new file "won't add"):
```bash
git status --ignored --short      # see what .gitignore is hiding
git check-ignore -v <path>        # explain why a specific path is ignored
```
Intentionally ignored (do NOT force-add): `node_modules/`, `server/.env`,
`server/uploads/`, `*.log`, `.idea/`, `.claude/`. Everything else should be tracked.
Binary assets under `icons/` ARE tracked. `.gitattributes` pins line endings to LF
so Mac↔Windows checkouts don't produce phantom whole-file diffs.

If `git status` is clean and you're "up to date with origin/main" on **both**
machines, nothing was missed.

## Deployment

Live target: **sydneyfishing.au** on **one AWS Lightsail VM (Sydney / ap-southeast-2)** running
Docker Compose (Caddy + API + Postgres), **same-origin** (no CORS, first-party cookies), photos
on local disk, **non-commercial** Open-Meteo. Runbook: **`DEPLOY-budget.md`** (the chosen cheap
path, ≈AUD 8–16/mo). The fuller decoupled stack (managed PG + R2 + CloudFront) stays in `DEPLOY.md`
for when one box isn't enough. Photo **moderation now ships** (report + admin takedown) — promote
your account to admin per `DEPLOY-budget.md` §4 before opening photos publicly (`DEPLOY.md` §12).
