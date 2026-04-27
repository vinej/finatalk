import { config } from "dotenv";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Decide TLS:
//   1. DB_SSL=true       → strict TLS with cert verification (production / managed DBs).
//   2. DB_SSL=false      → plain TCP (only safe for localhost dev).
//   3. URL has sslmode   → honor it (Neon/Supabase/Render append `?sslmode=require`).
//   4. Otherwise         → "prefer" — try TLS, fall back to plain. Works for both
//                          local Postgres and managed providers without explicit config.
function resolveSsl(): boolean | "prefer" | "require" | { rejectUnauthorized: boolean } {
  const flag = process.env.DB_SSL?.toLowerCase();
  if (flag === "true" || flag === "1") return { rejectUnauthorized: true };
  if (flag === "false" || flag === "0") return false;
  const url = connectionString!;
  if (/[?&]sslmode=(require|verify-ca|verify-full)/i.test(url)) return "require";
  if (/[?&]sslmode=disable/i.test(url)) return false;
  return "prefer";
}

const client = postgres(connectionString, {
  prepare: false,
  ssl: resolveSsl(),
  max: parseInt(process.env.DB_POOL_MAX ?? "20"),
  idle_timeout: 30,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
