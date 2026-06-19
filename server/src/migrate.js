// Applies db/schema.sql (idempotent). Run: npm run migrate
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "db", "schema.sql");

try {
  const sql = await readFile(schemaPath, "utf8");
  await pool.query(sql);
  console.log("[migrate] schema applied OK");
  await pool.end();
  process.exit(0);
} catch (e) {
  console.error("[migrate] failed:", e.message);
  await pool.end().catch(() => {});
  process.exit(1);
}
