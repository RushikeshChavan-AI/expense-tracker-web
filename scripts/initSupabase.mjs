import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function loadEnv() {
  const envPath = path.join(root, ".env");
  try {
    const content = await fs.readFile(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional; process.env may already contain the secret.
  }
}

await loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL.");
  console.error("Add your Supabase database connection string to .env, then run this again.");
  console.error("Example key name: SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-...pooler.supabase.com:6543/postgres");
  process.exit(1);
}

const schemaPath = path.join(root, "supabase", "schema.sql");
const schema = await fs.readFile(schemaPath, "utf8");
const sql = postgres(dbUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
});

try {
  await sql.unsafe(schema);
  console.log("Supabase schema initialized successfully.");
  console.log("Tables ready: public.categories, public.transactions");
} catch (err) {
  console.error("Failed to initialize Supabase schema.");
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
