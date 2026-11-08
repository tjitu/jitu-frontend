import pg from "pg";

let poolInstance: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!poolInstance) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error("DATABASE_URL environment variable is required.");
    }
    // For Supabase pooler, port 6543 (transaction pooling) is much faster and more reliable
    const connectionString = rawUrl.includes("pooler.supabase.com")
      ? rawUrl.replace(":5432", ":6543")
      : rawUrl;

    poolInstance = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
    });
  }
  return poolInstance;
}
