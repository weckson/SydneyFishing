import "dotenv/config";

const required = (key, fallback) => {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${key}`);
  return v;
};

export const config = {
  env: process.env.NODE_ENV || "development",
  isProd: (process.env.NODE_ENV || "development") === "production",
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: required("DATABASE_URL", "postgres://sf:sf@localhost:5432/sydneyfishing"),
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000")
    .split(",").map(s => s.trim()).filter(Boolean),
  cookieSecret: required("COOKIE_SECRET", "dev-insecure-cookie-secret-change-me"),
  requireEmailVerify: (process.env.REQUIRE_EMAIL_VERIFY || "false") === "true",
  sessionTtlDays: 30
};
