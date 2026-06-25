-- Sydney Fishing — MVP schema (PostgreSQL)
-- Idempotent: safe to run repeatedly (CREATE ... IF NOT EXISTS).
-- Scope: accounts + catch reports (with frozen scoring snapshot) + reviews + media.
-- OUT OF SCOPE (see SCOPE.md): buddy/meetup matchmaking and stranger boat-trip tables
-- are intentionally NOT created. Do not add them without legal + moderation prerequisites.

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;    -- case-insensitive email

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           citext UNIQUE NOT NULL,
  password_hash   text NOT NULL,
  display_name    text,
  preferred_lang  char(2) NOT NULL DEFAULT 'zh',
  role            text NOT NULL DEFAULT 'user',   -- user | moderator | admin
  email_verified  boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- ---------- sessions (opaque, server-side, revocable) ----------
-- We store only a SHA-256 hash of the session token; the raw token lives only in the
-- user's HttpOnly cookie. Logout / ban = delete the row.
CREATE TABLE IF NOT EXISTS sessions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash         text UNIQUE NOT NULL,
  user_agent         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  last_used_at       timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ---------- catch_reports ----------
-- spot_id is the existing string id from spots.js (e.g. 'bare-island'). Kept as text
-- so we do NOT have to migrate the 205-spot dataset into the DB yet.
-- conditions_snapshot freezes the EXACT scoring decomposition at catch time — this is the
-- single most valuable thing to capture now; it cannot be reconstructed retroactively and
-- is what later lets us calibrate the scoring weights against real outcomes.
CREATE TABLE IF NOT EXISTS catch_reports (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id             text NOT NULL,
  species             text,
  length_cm           numeric(5,1),
  weight_kg           numeric(5,2),
  kept                boolean,
  released            boolean,
  technique           text,
  bait                text,
  notes               text,
  body_lang           char(2) NOT NULL DEFAULT 'zh',
  caught_at           timestamptz,
  conditions_snapshot jsonb NOT NULL,
  engine_version      text,
  visibility          text NOT NULL DEFAULT 'public',  -- public | private
  like_count          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);
CREATE INDEX IF NOT EXISTS idx_catch_spot ON catch_reports(spot_id, caught_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catch_user ON catch_reports(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catch_snapshot ON catch_reports USING gin (conditions_snapshot jsonb_path_ops);

-- ---------- reviews ----------
-- Destination for the localStorage `sf_reviews_v1` migration AND new in-app reviews.
-- import_hash makes the migration idempotent (re-importing is a no-op).
CREATE TABLE IF NOT EXISTS reviews (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  spot_id       text NOT NULL,
  user_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  rating        smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          text NOT NULL,
  body_lang     char(2) NOT NULL DEFAULT 'zh',
  source_url    text,
  source_name   text,
  source        text NOT NULL DEFAULT 'user',   -- user | local_import
  import_hash   text UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reviews_spot ON reviews(spot_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ---------- media (photos) ----------
-- Metadata only; binaries live in object storage. exif_stripped MUST be true before a
-- derivative is ever served publicly (privacy: catch photos can carry GPS).
CREATE TABLE IF NOT EXISTS media (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key   text NOT NULL,
  mime          text,
  width         integer,
  height        integer,
  bytes         integer,
  entity_type   text,            -- 'catch_report' | 'review' | ...
  entity_id     bigint,
  exif_stripped boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id);

-- ---------- forum: categories / threads / posts ----------
CREATE TABLE IF NOT EXISTS forum_categories (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  name_cn     text NOT NULL,
  descr_cn    text,
  sort        integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id  bigint NOT NULL REFERENCES forum_categories(id),
  author_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  spot_id      text,
  is_pinned    boolean NOT NULL DEFAULT false,
  is_locked    boolean NOT NULL DEFAULT false,
  reply_count  integer NOT NULL DEFAULT 0,
  like_count   integer NOT NULL DEFAULT 0,
  last_post_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_threads_cat ON forum_threads(category_id, last_post_at DESC) WHERE deleted_at IS NULL;

-- The opening post is is_op=true; replies are is_op=false (uniform edit/like/report logic).
CREATE TABLE IF NOT EXISTS forum_posts (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id   bigint NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        text NOT NULL,
  body_lang   char(2) NOT NULL DEFAULT 'zh',
  is_op       boolean NOT NULL DEFAULT false,
  like_count  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON forum_posts(thread_id, created_at) WHERE deleted_at IS NULL;

-- Polymorphic reactions (MVP: kind='like' on target_type 'thread'|'post').
CREATE TABLE IF NOT EXISTS reactions (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id   bigint NOT NULL,
  kind        text NOT NULL DEFAULT 'like',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);

-- Moderation reports (forum + future targets).
CREATE TABLE IF NOT EXISTS forum_reports (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id   bigint NOT NULL,
  reason      text NOT NULL,
  detail      text,
  status      text NOT NULL DEFAULT 'open',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Seed the board taxonomy (idempotent via the slug unique constraint).
INSERT INTO forum_categories (slug, name, name_cn, descr_cn, sort) VALUES
  ('catch-reports', 'Catch Reports', '钓获报告', '晒渔获、分享当天海况与钓法', 10),
  ('species',       'Species & Tactics', '鱼种与钓法', '按鱼种交流饵料、钓组、技巧', 20),
  ('spots',         'Spots & Regions', '钓点与区域', '各区域钓点讨论与问答', 30),
  ('gear',          'Gear & Rigs', '装备与钓组', '竿轮线钩、DIY 钓组交流', 40),
  ('beginners',     'Beginners', '新手入门', '新手提问、答疑、避坑', 50),
  ('safety',        'Safety & Notices', '安全与公告', '岩钓/天气安全提醒、规则公告', 60),
  ('off-topic',     'Off-topic', '灌水闲聊', '轻松话题，钓鱼之外的一切', 90),
  -- Regional boards (r- prefix lets the client group "区域 Regions" separately from topics).
  ('r-harbour',          'Sydney Harbour',          '悉尼港',     '悉尼港及周边钓点交流', 110),
  ('r-northern-beaches', 'Northern Beaches',        '北部海滩',   '北部海滩区域钓点交流', 120),
  ('r-south',            'South (Botany–Cronulla)', '南区',       '南区/植物学湾钓点交流', 130),
  ('r-central-coast',    'Central Coast',           '中央海岸',   '中央海岸区域钓点交流', 140),
  ('r-wollongong',       'Wollongong / Illawarra',  '卧龙岗',     '卧龙岗/伊拉瓦拉钓点交流', 150),
  ('r-hawkesbury',       'Hawkesbury / West',       '霍克斯伯里', '霍克斯伯里水系钓点交流', 160)
ON CONFLICT (slug) DO NOTHING;

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        text NOT NULL,           -- 'reply'
  actor_name  text,
  thread_id   bigint,
  post_id     bigint,
  title       text,                    -- snapshot of the thread title
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, created_at DESC);

-- ---------- fishing-intel ingest (server-side harness: official sources + curated community links) ----------
-- A periodic backend job upserts items here; the PWA reads them via /api/intel. dedup_hash makes
-- re-runs idempotent. AI summaries (summary_cn/summary) are filled only when an LLM key is configured.
CREATE TABLE IF NOT EXISTS fishing_intel (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dedup_hash  text UNIQUE NOT NULL,
  scope_type  text NOT NULL,                 -- 'global' | 'region' | 'species' | 'topic'
  scope_key   text NOT NULL DEFAULT '',      -- e.g. 'harbour', 'Bream', 'safety'
  kind        text NOT NULL,                 -- 'regulation' | 'closure' | 'safety' | 'report' | 'news'
  title       text NOT NULL,
  title_cn    text,
  summary     text,
  summary_cn  text,
  source_url  text,
  source_name text,
  lang        char(2) NOT NULL DEFAULT 'en',
  published_at timestamptz,
  fetched_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_intel_scope ON fishing_intel(scope_type, scope_key, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_intel_kind ON fishing_intel(kind, fetched_at DESC);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  ok          boolean,
  items_added integer NOT NULL DEFAULT 0,
  note        text
);

-- ---------- email verification tokens ----------
CREATE TABLE IF NOT EXISTS email_verifications (
  token       text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- online competitions (SCOPE.md: ONLINE ONLY — photo + measurement, never in-person) ----------
-- A competition is just a time window + species filter over PUBLIC catch_reports. The leaderboard is
-- a query; there is NO separate entry flow — logging a public catch in-window IS entering. No events,
-- no RSVPs, no location gathering, no buddy/boat tables.
CREATE TABLE IF NOT EXISTS competitions (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  name_cn     text NOT NULL,
  descr_cn    text,
  species     text,                              -- English species (e.g. 'Bream'); NULL = any
  metric      text NOT NULL DEFAULT 'length',    -- 'length' | 'weight'
  region_id   text,                              -- optional client region id; NULL = all Sydney
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_active ON competitions(ends_at DESC);

-- Seed one example monthly competition (idempotent). Which competition runs is a content decision.
INSERT INTO competitions (slug, title, name_cn, descr_cn, species, metric, starts_at, ends_at) VALUES
  ('biggest-bream-2026-06', 'Biggest Bream — June 2026', '六月最大黑鲷', '本月最大黑鲷（按长度）· 记录一条公开渔获即参赛', 'Bream', 'length', '2026-06-01T00:00:00+10:00', '2026-07-01T00:00:00+10:00')
ON CONFLICT (slug) DO NOTHING;
