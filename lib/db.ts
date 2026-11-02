import pg from "pg";

let poolInstance: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!poolInstance) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error("DATABASE_URL environment variable is required.");
    }
    const connectionString = rawUrl.replace(":6543", ":5432");

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
