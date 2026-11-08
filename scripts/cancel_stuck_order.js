const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres.oyyhjyyadrsviehamztc:JituPes13DbM3l3tusyyy@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
});

async function run() {
  const res = await pool.query(
    `UPDATE "Payment" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE status = 'PENDING'`
  );
  console.log("Cancelled pending payments count:", res.rowCount);
  await pool.end();
}

run().catch(console.error);
