import crypto from "node:crypto";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { query } from "./db.js";
import { config } from "./config.js";

export const SESSION_COOKIE = "sf_sid";

// ---- password hashing (Argon2id via prebuilt @node-rs/argon2 — no native build step) ----
export function hashPassword(plain) {
  return argonHash(plain); // argon2id defaults
}
export async function verifyPassword(stored, plain) {
  try { return await argonVerify(stored, plain); }
  catch { return false; }
}

// ---- opaque session tokens ----
const sha256 = s => crypto.createHash("sha256").update(s).digest("hex");

export async function createSession(userId, userAgent) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expires = new Date(Date.now() + config.sessionTtlDays * 86400_000);
  await query(
    `INSERT INTO sessions (user_id, token_hash, user_agent, expires_at) VALUES ($1,$2,$3,$4)`,
    [userId, tokenHash, (userAgent || "").slice(0, 300), expires]
  );
  return { token, expires };
}

export async function destroySession(token) {
  if (!token) return;
  await query(`DELETE FROM sessions WHERE token_hash = $1`, [sha256(token)]);
}

export async function userForToken(token) {
  if (!token) return null;
  const { rows } = await query(
    `SELECT u.id, u.email, u.display_name, u.preferred_lang, u.role, u.email_verified
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now() AND u.deleted_at IS NULL`,
    [sha256(token)]
  );
  if (!rows[0]) return null;
  // Touch last_used_at (best-effort, non-blocking).
  query(`UPDATE sessions SET last_used_at = now() WHERE token_hash = $1`, [sha256(token)]).catch(() => {});
  return rows[0];
}

export function setSessionCookie(reply, token, expires) {
  reply.setCookie(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    expires
  });
}
export function clearSessionCookie(reply) {
  reply.clearCookie(SESSION_COOKIE, { path: "/" });
}

// ---- Fastify preHandlers ----
export async function requireAuth(req, reply) {
  const token = req.cookies?.[SESSION_COOKIE];
  const user = await userForToken(token);
  if (!user) {
    reply.code(401).send({ error: "unauthorized", message: "请先登录 · Sign in required" });
    return reply; // returning the reply short-circuits the route handler
  }
  if (config.requireEmailVerify && !user.email_verified) {
    reply.code(403).send({ error: "email_unverified", message: "请先验证邮箱 · Verify your email first" });
    return reply;
  }
  req.user = user;
}

export async function optionalAuth(req) {
  req.user = await userForToken(req.cookies?.[SESSION_COOKIE]);
}

// Admin/moderator-only gate (moderation + takedown routes). Reuses users.role.
export async function requireAdmin(req, reply) {
  const token = req.cookies?.[SESSION_COOKIE];
  const user = await userForToken(token);
  if (!user) {
    reply.code(401).send({ error: "unauthorized", message: "请先登录 · Sign in required" });
    return reply;
  }
  if (user.role !== "admin" && user.role !== "moderator") {
    reply.code(403).send({ error: "forbidden", message: "需要管理员权限 · Admins only" });
    return reply;
  }
  req.user = user;
}
