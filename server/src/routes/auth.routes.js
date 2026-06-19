import crypto from "node:crypto";
import { query } from "../db.js";
import {
  hashPassword, verifyPassword, createSession, destroySession,
  setSessionCookie, clearSessionCookie, requireAuth, SESSION_COOKIE
} from "../auth.js";
import { sendVerificationEmail } from "../mailer.js";
import { config } from "../config.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create a verification token and "email" the link. Returns the absolute URL (dev surfaces it).
async function issueVerification(req, userId, email) {
  const token = crypto.randomBytes(24).toString("base64url");
  const expires = new Date(Date.now() + 24 * 3600 * 1000);
  await query(`INSERT INTO email_verifications (token, user_id, expires_at) VALUES ($1,$2,$3)`, [token, userId, expires]);
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "http");
  const url = `${proto}://${req.headers.host}/api/auth/verify?token=${token}`;
  await sendVerificationEmail(email, url);
  return url;
}

const credSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      email: { type: "string", maxLength: 254 },
      password: { type: "string", minLength: 8, maxLength: 200 },
      displayName: { type: "string", maxLength: 40 },
      preferredLang: { type: "string", enum: ["zh", "en"] }
    }
  }
};

const publicUser = u => ({
  id: u.id, email: u.email, displayName: u.display_name,
  preferredLang: u.preferred_lang, role: u.role, emailVerified: u.email_verified
});

export default async function authRoutes(app) {
  // Tighter rate limit on auth endpoints to blunt credential stuffing.
  const tightLimit = { config: { rateLimit: { max: 10, timeWindow: "5 minutes" } } };

  // ---- register ----
  app.post("/register", { ...tightLimit, schema: credSchema }, async (req, reply) => {
    const email = req.body.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return reply.code(400).send({ error: "invalid_email", message: "邮箱格式不正确 · Invalid email" });
    }
    const password_hash = await hashPassword(req.body.password);
    let row;
    try {
      const r = await query(
        `INSERT INTO users (email, password_hash, display_name, preferred_lang)
         VALUES ($1,$2,$3,$4)
         RETURNING id, email, display_name, preferred_lang, role, email_verified`,
        [email, password_hash, req.body.displayName || null, req.body.preferredLang || "zh"]
      );
      row = r.rows[0];
    } catch (e) {
      if (e.code === "23505") { // unique_violation
        return reply.code(409).send({ error: "email_taken", message: "该邮箱已注册 · Email already registered" });
      }
      throw e;
    }
    const { token, expires } = await createSession(row.id, req.headers["user-agent"]);
    setSessionCookie(reply, token, expires);
    // Send a verification email (non-blocking; account is usable immediately — verification
    // is informational unless REQUIRE_EMAIL_VERIFY is on).
    issueVerification(req, row.id, email).catch(e => req.log.warn("verify email failed: " + e.message));
    return reply.code(201).send({ user: publicUser(row) });
  });

  // ---- resend verification (auth) ----
  app.post("/verify/send", { preHandler: requireAuth, config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } }, async (req) => {
    if (req.user.email_verified) return { ok: true, alreadyVerified: true };
    const url = await issueVerification(req, req.user.id, req.user.email);
    // In dev we surface the link so the flow can be completed without a real inbox.
    return config.isProd ? { ok: true } : { ok: true, devUrl: url };
  });

  // ---- verify (GET from the email link) ----
  app.get("/verify", {
    schema: { querystring: { type: "object", required: ["token"], properties: { token: { type: "string", maxLength: 100 } } } }
  }, async (req, reply) => {
    const html = (msg, ok) =>
      `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
       <title>邮箱验证</title></head>
       <body style="font-family:-apple-system,Segoe UI,sans-serif;text-align:center;padding:48px 20px;color:#0a1f33">
       <div style="font-size:42px">${ok ? "✅" : "⚠️"}</div>
       <h2 style="color:#013a63">${msg}</h2>
       <p style="color:#6b8299">可关闭此页返回应用 · You can close this page.</p></body></html>`;
    const { rows } = await query(
      `SELECT user_id FROM email_verifications WHERE token=$1 AND expires_at > now()`, [req.query.token]
    );
    if (!rows.length) return reply.type("text/html").send(html("链接无效或已过期", false));
    await query(`UPDATE users SET email_verified = true WHERE id=$1`, [rows[0].user_id]);
    await query(`DELETE FROM email_verifications WHERE user_id=$1`, [rows[0].user_id]);
    return reply.type("text/html").send(html("邮箱已验证成功", true));
  });

  // ---- login ----
  app.post("/login", { ...tightLimit, schema: credSchema }, async (req, reply) => {
    const email = req.body.email.trim().toLowerCase();
    const { rows } = await query(
      `SELECT id, email, password_hash, display_name, preferred_lang, role, email_verified
         FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    const user = rows[0];
    // Constant-ish behaviour: always verify against something, return a generic error.
    const ok = user ? await verifyPassword(user.password_hash, req.body.password) : false;
    if (!ok) {
      return reply.code(401).send({ error: "invalid_credentials", message: "邮箱或密码错误 · Invalid email or password" });
    }
    const { token, expires } = await createSession(user.id, req.headers["user-agent"]);
    setSessionCookie(reply, token, expires);
    return { user: publicUser(user) };
  });

  // ---- logout ----
  app.post("/logout", async (req, reply) => {
    await destroySession(req.cookies?.[SESSION_COOKIE]);
    clearSessionCookie(reply);
    return { ok: true };
  });

  // ---- current user ----
  app.get("/me", { preHandler: requireAuth }, async (req) => ({ user: publicUser(req.user) }));
}
