// DEV-ONLY launcher: runs the real Fastify app against an in-memory Postgres (pg-mem),
// so the full flow can be tested without installing Postgres. NOT for production.
import { newDb, DataType } from "pg-mem";
import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import pg from "pg";

const db = newDb();
db.public.registerFunction({ name: "gen_random_uuid", returns: DataType.uuid, implementation: () => crypto.randomUUID(), impure: true });
db.public.registerFunction({ name: "now", returns: DataType.timestamptz, implementation: () => new Date(), impure: true });
db.registerExtension("pgcrypto", () => {});
db.registerExtension("citext", () => {});

let schema = await readFile("db/schema.sql", "utf8");
schema = schema
  .replace(/CREATE EXTENSION[^;]*;/g, "")
  .replace(/citext/g, "text")
  .replace(/USING gin \(conditions_snapshot jsonb_path_ops\)/g, "(spot_id)");

const mem = db.adapters.createPg();
if (!mem.Pool.prototype.on) mem.Pool.prototype.on = function () { return this; };
// Inject pg-mem in place of the real driver BEFORE db.js / app.js are imported.
pg.Pool = mem.Pool;
pg.Client = mem.Client;

const setup = new mem.Pool();
await setup.query(schema);
console.log("[devserver] in-memory schema applied");

process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || "dev-mem-secret";
process.env.NODE_ENV = "development";
process.env.PORT = process.env.PORT || "3000";

const { buildApp } = await import("./src/app.js");
const app = await buildApp();
await app.listen({ port: parseInt(process.env.PORT, 10), host: "0.0.0.0" });
console.log("[devserver] API (pg-mem) on :" + process.env.PORT);
