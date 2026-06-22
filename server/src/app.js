import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { config } from "./config.js";
import { pingDb } from "./db.js";
import { UPLOADS_DIR } from "./storage.js";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import catchRoutes from "./routes/catches.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import forumRoutes from "./routes/forum.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import insightsRoutes from "./routes/insights.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: { level: config.isProd ? "info" : "debug" },
    // Trust an exact number of proxy hops (CloudFront/LB) so X-Forwarded-For can't be spoofed
    // to evade IP rate limits. 0 in dev (direct), 1 in prod by default.
    trustProxy: config.trustProxyHops,
    bodyLimit: 1_000_000 // 1 MB JSON (photos go via separate upload later, not JSON)
  });

  await app.register(helmet, {
    // API returns JSON; a tight CSP here mainly hardens any error pages.
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: "same-site" }
  });

  await app.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  });

  await app.register(cookie, { secret: config.cookieSecret });

  await app.register(multipart, { limits: { fileSize: 12 * 1024 * 1024, files: 1 } });

  // Serve locally-stored user images (MVP local-disk driver). In prod with S3/R2+CDN this
  // route is unused — images are served from the CDN instead.
  await app.register(fastifyStatic, {
    root: UPLOADS_DIR, prefix: "/uploads/", decorateReply: false,
    cacheControl: true, maxAge: "7d", immutable: true
  });

  // Global baseline rate limit; auth routes tighten this further per-route.
  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
    keyGenerator: req => req.ip
  });

  // ---- health ----
  app.get("/healthz", async () => ({ ok: true, service: "sydney-fishing-api", env: config.env }));

  // ---- public feature flags (the PWA reads these to hide disabled features) ----
  app.get("/api/meta", async () => ({ features: config.features }));
  app.get("/readyz", async (req, reply) => {
    try { await pingDb(); return { ok: true, db: "up" }; }
    catch (e) { req.log.error("readyz db check failed: " + e.message); reply.code(503); return { ok: false, db: "down" }; }
  });

  // ---- API routes ----
  // Auth is always on; other route groups are gated by feature flags (disabled features
  // simply don't expose their endpoints, so the server enforces the gate, not just the UI).
  const F = config.features;
  await app.register(authRoutes, { prefix: "/api/auth" });
  if (F.reviews) await app.register(reviewRoutes, { prefix: "/api/reviews" });
  if (F.catches) await app.register(catchRoutes, { prefix: "/api/catches" });
  if (F.photos) await app.register(mediaRoutes, { prefix: "/api/media" });
  if (F.forum) {
    await app.register(forumRoutes, { prefix: "/api/forum" });
    await app.register(notificationRoutes, { prefix: "/api/notifications" });
  }
  if (F.insights) await app.register(insightsRoutes, { prefix: "/api/insights" });

  return app;
}
