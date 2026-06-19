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
  ('off-topic',     'Off-topic', '灌水闲聊', '轻松话题，钓鱼之外的一切', 90)
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

-- ---------- email verification tokens ----------
CREATE TABLE IF NOT EXISTS email_verifications (
  token       text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
