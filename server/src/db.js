import pg from "pg";
import { config } from "./config.js";

// Single shared pool. Lazy: constructing it does not connect, so the server can boot
// (and answer /healthz) even if Postgres is momentarily down.
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  // Managed Postgres (Lightsail/RDS) requires TLS. rejectUnauthorized is relaxed by default
  // for managed certs; set PGSSL_STRICT=true once you bundle the provider CA.
  ssl: config.pgSsl ? { rejectUnauthorized: config.pgSslStrict } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on("error", err => {
  // Don't crash the process on an idle client error; log and let the pool recover.
  console.error("[db] idle client error:", err.message);
});

export const query = (text, params) => pool.query(text, params);

export async function pingDb() {
  const { rows } = await pool.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}
