import "dotenv/config";

const DEV_COOKIE_SECRET = "dev-insecure-cookie-secret-change-me";
const DEV_DATABASE_URL = "postgres://sf:sf@localhost:5432/sydneyfishing";

const isProd = (process.env.NODE_ENV || "development") === "production";

export const config = {
  env: process.env.NODE_ENV || "development",
  isProd,
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL || DEV_DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000")
    .split(",").map(s => s.trim()).filter(Boolean),
  cookieSecret: process.env.COOKIE_SECRET || DEV_COOKIE_SECRET,
  cookieSameSite: process.env.COOKIE_SAMESITE || "lax",   // set "none" only if API is on a different site
  requireEmailVerify: (process.env.REQUIRE_EMAIL_VERIFY || "false") === "true",
  sessionTtlDays: 30,
  // Fishing-intel ingest harness (server-side cron). Stores curated/official source items always;
  // AI summarisation runs ONLY when ANTHROPIC_API_KEY is set (zero LLM cost otherwise).
  ingestEnabled: (process.env.INGEST_ENABLED || "true") !== "false",
  ingestIntervalHours: parseInt(process.env.INGEST_INTERVAL_HOURS || "24", 10),
  ingestOnBoot: (process.env.INGEST_ON_BOOT || (isProd ? "true" : "false")) === "true",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
  // Number of proxy hops in front of the app (CloudFront/LB). Used for correct client IP in
  // rate limiting; trusting *all* hops lets clients spoof X-Forwarded-For.
  trustProxyHops: parseInt(process.env.TRUST_PROXY_HOPS || (isProd ? "1" : "0"), 10),
  // Canonical base URL of the API, used to build verification links (avoids trusting Host header).
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, ""),
  // Postgres TLS: managed PG (Lightsail/RDS) requires it; auto-on in prod or when the URL says
  // sslmode=require. Override with PGSSL=disable for a same-host Postgres on a private Docker
  // network (single-box deploy — no TLS needed), or PGSSL=require to force it on.
  // rejectUnauthorized defaults to false for managed certs; PGSSL_STRICT=true once you bundle the CA.
  pgSsl: (process.env.PGSSL || "").toLowerCase() === "disable" ? false
       : (process.env.PGSSL || "").toLowerCase() === "require" ? true
       : (isProd || /sslmode=require/.test(process.env.DATABASE_URL || "")),
  pgSslStrict: (process.env.PGSSL_STRICT || "false") === "true"
};

// Fail fast in production on insecure defaults — better a crash at boot than a silent breach.
if (isProd) {
  const problems = [];
  if (config.cookieSecret === DEV_COOKIE_SECRET || config.cookieSecret.length < 16)
    problems.push("COOKIE_SECRET must be set to a strong value (>=16 chars) in production");
  if (config.databaseUrl === DEV_DATABASE_URL)
    problems.push("DATABASE_URL must be set in production");
  const badOrigin = config.corsOrigins.find(o => !/^https:\/\//.test(o));
  if (badOrigin)
    problems.push(`CORS_ORIGINS must be explicit https origins in production (got: ${badOrigin})`);
  if (problems.length) {
    throw new Error("Insecure production config:\n  - " + problems.join("\n  - "));
  }
}
