import "dotenv/config";

const DEV_COOKIE_SECRET = "dev-insecure-cookie-secret-change-me";
const DEV_DATABASE_URL = "postgres://sf:sf@localhost:5432/sydneyfishing";

const isProd = (process.env.NODE_ENV || "development") === "production";

// Feature flags. "false" disables; anything else (or unset) uses the default.
// SOFT-LAUNCH DEFAULTS on this branch: photos + email verification are OFF (no image
// moderation / R2 / SES needed). Re-enable any feature by setting its env var to "true".
const feat = (key, def) => (process.env[key] || (def ? "true" : "false")) !== "false";

export const config = {
  env: process.env.NODE_ENV || "development",
  isProd,
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL || DEV_DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000")
    .split(",").map(s => s.trim()).filter(Boolean),
  cookieSecret: process.env.COOKIE_SECRET || DEV_COOKIE_SECRET,
  cookieSameSite: process.env.COOKIE_SAMESITE || "lax",   // set "none" only if API is on a different site
  // Emails that are treated as admins (can moderate/delete any UGC). Set ADMIN_EMAILS to a
  // comma-separated list to bootstrap the first moderator without touching the DB.
  adminEmails: (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean),
  requireEmailVerify: (process.env.REQUIRE_EMAIL_VERIFY || "false") === "true",
  sessionTtlDays: 30,
  // Feature toggles (exposed to the PWA via GET /api/meta; also enforced server-side).
  features: {
    photos:      feat("FEATURE_PHOTOS", false),       // soft-launch OFF: avoids image moderation/CSAM + R2 cost
    emailVerify: feat("FEATURE_EMAIL_VERIFY", false), // soft-launch OFF: no SES needed
    catches:     feat("FEATURE_CATCHES", true),
    reviews:     feat("FEATURE_REVIEWS", true),
    forum:       feat("FEATURE_FORUM", true),
    insights:    feat("FEATURE_INSIGHTS", true)
  },
  // Number of proxy hops in front of the app (CloudFront/LB). Used for correct client IP in
  // rate limiting; trusting *all* hops lets clients spoof X-Forwarded-For.
  trustProxyHops: parseInt(process.env.TRUST_PROXY_HOPS || (isProd ? "1" : "0"), 10),
  // Canonical base URL of the API, used to build verification links (avoids trusting Host header).
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, ""),
  // Postgres TLS: managed PG (Lightsail/RDS) requires it. rejectUnauthorized defaults to false
  // for managed-cert compatibility; set PGSSL_STRICT=true once you bundle the provider CA.
  pgSsl: isProd || /sslmode=require/.test(process.env.DATABASE_URL || ""),
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
