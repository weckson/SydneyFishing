# 省钱单机部署 · Budget single-box deploy

For **sydneyfishing.au** on **one AWS Lightsail VM in Sydney (ap-southeast-2)**. One box runs
everything via Docker Compose: **Caddy** (auto-HTTPS + static PWA + reverse proxy) + **Fastify
API** + **Postgres**. PWA and API share one origin → **no CORS, first-party cookies**. Photos
live on the box's disk. Cost ≈ **AUD 8–16/月** + domain.

> This is the chosen low-cost path (non-commercial Open-Meteo, self-hosted photos). The fuller
> decoupled stack (managed PG + R2 + CloudFront) is in [DEPLOY.md](DEPLOY.md) — use that only if
> you outgrow one box.

```
            sydneyfishing.au  (GoDaddy A record → box public IP)
                     │ :443 Let's Encrypt (auto)
        ┌────────────▼──────────── one Lightsail VM · Docker Compose ┐
        │  caddy   /          → static PWA (/srv)                    │
        │          /api/*,/uploads/* → api:3000                      │
        │  api (Fastify)  ───────────────  db (postgres + volume)    │
        └────────────────────────────────────────────────────────────┘
   weather: browser → api.open-meteo.com (non-commercial, unchanged)
```

---

## 0. Provision the VM

1. Lightsail → **Create instance** → Region **Sydney (ap-southeast-2)** → **Linux/Unix → OS Only →
   Ubuntu 22.04**. Plan: **1 GB ($5/mo)** is the sweet spot (512 MB is too tight for `sharp`).
2. **Networking → IPv4 firewall**: allow **TCP 22, 80, 443**. Attach a **Static IP** (free while attached).
3. SSH in (Lightsail browser SSH or your key).

```bash
# Docker + compose plugin
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER && newgrp docker
# 1 GB RAM is tight when sharp resizes images → add 2 GB swap
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 1. DNS (GoDaddy)

GoDaddy → **My Products → DNS** for `sydneyfishing.au`:
- **A** record: Host `@` → **Value = the Static IP**, TTL 600.
- (Optional `www`: see the note in [Caddyfile](Caddyfile) — omitted by default to keep one record.)

Wait for it to resolve: `dig +short sydneyfishing.au` should return your IP before step 3
(Caddy needs it for the TLS challenge).

## 2. Clone + secrets

```bash
git clone https://github.com/weckson/SydneyFishing.git && cd SydneyFishing
# Root .env holds production secrets. It is gitignored — NEVER commit it.
cat > .env <<EOF
COOKIE_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)        # alphanumeric → safe inside DATABASE_URL
ACME_EMAIL=a290191715@gmail.com
EOF
chmod 600 .env
```

## 3. Launch

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
This builds the API + Caddy images, starts Postgres, **auto-applies the schema** (`migrate.js`),
and Caddy fetches a Let's Encrypt cert for `sydneyfishing.au`. First boot ~1–2 min.

**Verify:**
```bash
curl -s https://sydneyfishing.au/healthz     # {"ok":true,...}
curl -s https://sydneyfishing.au/readyz      # {"ok":true,"db":"up"}   ← DB reachable
```
Then open https://sydneyfishing.au — the map/scoring works immediately; register an account.

## 4. Make yourself an admin (enables 🛡️ 审核 / takedown)

The moderation panel (#/admin) and takedown APIs require `role IN ('admin','moderator')`.
After registering your account in the app, promote it once:
```bash
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U sf -d sydneyfishing -c "UPDATE users SET role='admin' WHERE email='a290191715@gmail.com';"
```
Re-login; a **🛡️ 审核** button appears in the header. Reporters use the 🚩 on any catch; you
triage at `#/admin` (下架 = soft-delete + hide photos; Dismiss = mark handled). See `SCOPE.md` /
`DEPLOY.md` §12 — this is the minimum bar before opening photos publicly.

## 5. Backups (do this)

Single box = back up the DB. Nightly `pg_dump` via host cron, kept 7 days:
```bash
mkdir -p ~/backups
( crontab -l 2>/dev/null; echo '0 15 * * * cd ~/SydneyFishing && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U sf sydneyfishing | gzip > ~/backups/sf-$(date +\%F).sql.gz && find ~/backups -name "*.sql.gz" -mtime +7 -delete' ) | crontab -
```
Also enable **Lightsail automatic snapshots** (instance-level, covers the Docker volumes incl. photos).
Restore a dump: `gunzip -c sf-YYYY-MM-DD.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U sf -d sydneyfishing`.

## 6. Updating after a code change

You develop on two machines → push to GitHub, then on the box:
```bash
cd ~/SydneyFishing && git pull
docker compose -f docker-compose.prod.yml up -d --build   # rebuilds api + caddy, re-runs idempotent migrate
```
Caddy serves the new PWA files (rebuilt from the repo). The SW cache version is bumped per PWA
release, and Caddy sends `no-cache` for `index.html`/`service-worker.js`, so updates land fast.

---

## Notes / decisions

- **CSP unchanged.** `index.html`'s CSP uses `'self'` (covers the same-origin API + `/uploads`
  images) plus Open-Meteo + map tiles. The `http://localhost:3000` entries are harmless in prod
  (a page can only reach the visitor's *own* localhost) and keep local dev working; strip them
  later for hardening if you like.
- **Open-Meteo = non-commercial.** Free tier, ~10k calls/day, called from the browser. Keep the
  Open-Meteo attribution visible. If you monetise or hit limits, buy Standard (~$29/mo) and/or
  move weather behind a cached backend proxy (see DEPLOY.md §0).
- **Compliance:** box + DB + photos all in **Sydney (ap-southeast-2)** → data stays in Australia.
- **Email verification** is off (`REQUIRE_EMAIL_VERIFY=false`); verification links print to
  `docker compose logs api`. Wire SES later to turn it on (see DEPLOY.md §8).
- **Scale up** only if needed: bump the Lightsail plan to 2 GB, or move photos to R2 (set the
  `s3` storage driver) — no schema/caller change required.
