async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set before cancelling pending orders.");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  try {
    const res = await pool.query(
      `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE status = 'PENDING'`
    );
    console.log("Cancelled pending payments count:", res.rowCount);
  } finally {
    await pool.end();
  }
}

run().catch(console.error);
