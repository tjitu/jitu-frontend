import { promises as fs } from "fs";
import path from "path";
import pg from "pg";
import {
  ApplicationStatus,
  HiringApplication,
  HIRING_POSITIONS,
} from "./hiring-types";

// In serverless (Vercel), process.cwd() is read-only (/var/task).
// Use /tmp for any ephemeral local caching, or process.cwd()/data in local dev.
const DATA_DIR =
  process.env.VERCEL || process.env.NODE_ENV === "production"
    ? path.join("/tmp", "data")
    : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "hiring-applications.json");

function getDatabaseUrl(): string {
  let url =
    process.env.DATABASE_URL ||
    "postgresql://postgres.oyyhjyyadrsviehamztc:JituPes13DbM3l3tusyyy@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres";
  // Always prefer transaction pooler port 6543 for serverless resilience
  if (url.includes("pooler.supabase.com:5432")) {
    url = url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }
  return url;
}

let poolInstance: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new pg.Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
    poolInstance.on("error", (err) => {
      console.warn("[pg pool error]", err.message);
      try {
        poolInstance?.end().catch(() => {});
      } catch {}
      poolInstance = null;
    });
  }
  return poolInstance;
}

function resetPool(): void {
  if (poolInstance) {
    try {
      poolInstance.end().catch(() => {});
    } catch {}
    poolInstance = null;
  }
}

async function queryWithRetry<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  try {
    const pool = getPool();
    return await pool.query<T>(text, params);
  } catch (err) {
    console.warn(
      "[pg query failed, resetting pool and retrying]:",
      (err as Error)?.message
    );
    resetPool();
    const freshPool = getPool();
    return await freshPool.query<T>(text, params);
  }
}

interface SupabaseHiringRow {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  university: string;
  major: string;
  academic_status: string;
  domicile: string;
  primary_role: string;
  primary_division: string;
  secondary_role: string | null;
  availability: string;
  start_date: string;
  cv_url: string;
  cv_file_name: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  experience_essay: string;
  motivation_essay: string;
  referral_source: string | null;
  commitment_agreed: boolean;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapRowToApplication(row: SupabaseHiringRow): HiringApplication {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    university: row.university,
    major: row.major,
    academicStatus: row.academic_status,
    domicile: row.domicile,
    primaryRole: row.primary_role,
    primaryDivision: row.primary_division as HiringApplication["primaryDivision"],
    secondaryRole: row.secondary_role || "",
    availability: row.availability,
    startDate: row.start_date,
    cvUrl: row.cv_url,
    cvFileName: row.cv_file_name || undefined,
    portfolioUrl: row.portfolio_url || "",
    linkedinUrl: row.linkedin_url || "",
    experienceEssay: row.experience_essay,
    motivationEssay: row.motivation_essay,
    referralSource: row.referral_source || "",
    commitmentAgreed: Boolean(row.commitment_agreed),
    status: row.status,
    adminNotes: row.admin_notes || undefined,
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
    updatedAt: row.updated_at
      ? new Date(row.updated_at).toISOString()
      : new Date().toISOString(),
  };
}

let inMemoryStore: HiringApplication[] = [];

async function ensureLocalStore(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    // Gracefully ignore filesystem errors in read-only / serverless runtimes
    console.warn("[LocalStore] Cannot initialize local file store:", (err as Error)?.message);
  }
}

async function getLocalApplications(): Promise<HiringApplication[]> {
  try {
    await ensureLocalStore();
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryStore = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }
  return inMemoryStore;
}

async function saveLocalApplications(apps: HiringApplication[]): Promise<void> {
  inMemoryStore = apps;
  try {
    await ensureLocalStore();
    await fs.writeFile(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
  } catch (err) {
    console.warn("[LocalStore] Failed to save local file cache:", (err as Error)?.message);
  }
}

export async function getAllApplications(): Promise<HiringApplication[]> {
  try {
    const res = await queryWithRetry<SupabaseHiringRow>(
      "SELECT * FROM hiring_applications ORDER BY created_at DESC;"
    );
    if (res.rows && res.rows.length >= 0) {
      const mapped = res.rows.map(mapRowToApplication);
      saveLocalApplications(mapped).catch(() => {});
      return mapped;
    }
  } catch (err) {
    console.error(
      "[Supabase] Failed to fetch applications from Supabase, using local fallback:",
      err
    );
  }

  return getLocalApplications();
}

export async function findExistingApplication(
  email: string,
  whatsapp: string
): Promise<HiringApplication | null> {
  const cleanEmail = email.trim().toLowerCase();
  const digits = whatsapp.replace(/\D/g, "");

  try {
    let query = "SELECT * FROM hiring_applications WHERE LOWER(email) = LOWER($1)";
    const params: string[] = [cleanEmail];
    if (digits.length >= 8) {
      query += " OR regexp_replace(whatsapp, '\\D', '', 'g') = $2";
      params.push(digits);
    }
    query += " ORDER BY created_at DESC LIMIT 1;";

    const res = await queryWithRetry<SupabaseHiringRow>(query, params);
    if (res.rows && res.rows.length > 0) {
      return mapRowToApplication(res.rows[0]);
    }
    return null;
  } catch (err) {
    console.error("[Supabase] findExistingApplication error:", err);
  }

  const local = await getLocalApplications();
  return (
    local.find(
      (a) =>
        a.email.toLowerCase() === cleanEmail ||
        (digits.length >= 8 && a.whatsapp.replace(/\D/g, "") === digits)
    ) || null
  );
}

export async function insertApplication(app: HiringApplication): Promise<void> {
  const query = `
    INSERT INTO hiring_applications (
      id, full_name, email, whatsapp, university, major, academic_status,
      domicile, primary_role, primary_division, secondary_role, availability,
      start_date, cv_url, cv_file_name, portfolio_url, linkedin_url,
      experience_essay, motivation_essay, referral_source, commitment_agreed,
      status, admin_notes, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12,
      $13, $14, $15, $16, $17,
      $18, $19, $20, $21,
      $22, $23, $24, $25
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      whatsapp = EXCLUDED.whatsapp,
      university = EXCLUDED.university,
      major = EXCLUDED.major,
      academic_status = EXCLUDED.academic_status,
      domicile = EXCLUDED.domicile,
      primary_role = EXCLUDED.primary_role,
      primary_division = EXCLUDED.primary_division,
      secondary_role = EXCLUDED.secondary_role,
      availability = EXCLUDED.availability,
      start_date = EXCLUDED.start_date,
      cv_url = EXCLUDED.cv_url,
      cv_file_name = EXCLUDED.cv_file_name,
      portfolio_url = EXCLUDED.portfolio_url,
      linkedin_url = EXCLUDED.linkedin_url,
      experience_essay = EXCLUDED.experience_essay,
      motivation_essay = EXCLUDED.motivation_essay,
      referral_source = EXCLUDED.referral_source,
      commitment_agreed = EXCLUDED.commitment_agreed,
      status = EXCLUDED.status,
      admin_notes = EXCLUDED.admin_notes,
      updated_at = NOW();
  `;

  const values = [
    app.id,
    app.fullName,
    app.email,
    app.whatsapp,
    app.university,
    app.major,
    app.academicStatus,
    app.domicile,
    app.primaryRole,
    app.primaryDivision,
    app.secondaryRole || null,
    app.availability,
    app.startDate,
    app.cvUrl,
    app.cvFileName || null,
    app.portfolioUrl || null,
    app.linkedinUrl || null,
    app.experienceEssay,
    app.motivationEssay,
    app.referralSource || null,
    app.commitmentAgreed,
    app.status,
    app.adminNotes || null,
    app.createdAt,
    app.updatedAt,
  ];

  await queryWithRetry(query, values);
  console.log(`[Supabase] Application ${app.id} saved to Supabase.`);

  // Safe background fallback cache update
  saveLocalApplications([app]).catch(() => {});
}

export async function updateApplication(
  id: string,
  updates: { status?: ApplicationStatus; adminNotes?: string }
): Promise<HiringApplication | null> {
  try {
    const fields: string[] = [];
    const values: (string | ApplicationStatus)[] = [];
    let idx = 1;

    if (updates.status) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (typeof updates.adminNotes === "string") {
      fields.push(`admin_notes = $${idx++}`);
      values.push(updates.adminNotes);
    }
    fields.push("updated_at = NOW()");
    values.push(id);

    const query = `
      UPDATE hiring_applications
      SET ${fields.join(", ")}
      WHERE LOWER(id) = LOWER($${idx})
      RETURNING *;
    `;

    const res = await queryWithRetry<SupabaseHiringRow>(query, values);
    if (res.rows.length > 0) {
      const updated = mapRowToApplication(res.rows[0]);
      return updated;
    }
  } catch (err) {
    console.error("[Supabase Error] Failed to update application in Supabase:", err);
  }

  // Fallback to local
  const local = await getLocalApplications();
  const index = local.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;
  if (updates.status) local[index].status = updates.status;
  if (typeof updates.adminNotes === "string") local[index].adminNotes = updates.adminNotes;
  local[index].updatedAt = new Date().toISOString();
  await saveLocalApplications(local);
  return local[index];
}

export async function deleteApplication(id: string): Promise<boolean> {
  try {
    await queryWithRetry("DELETE FROM hiring_applications WHERE LOWER(id) = LOWER($1);", [id]);
  } catch (err) {
    console.error("[Supabase Error] Failed to delete application from Supabase:", err);
  }

  const local = await getLocalApplications();
  const filtered = local.filter((a) => a.id.toLowerCase() !== id.toLowerCase());
  await saveLocalApplications(filtered);
  return true;
}

export async function saveAllApplications(
  apps: HiringApplication[]
): Promise<void> {
  await saveLocalApplications(apps);
}

export function generateApplicationId(existingIds: Set<string>): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidate = `JITU-2026-${code}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  return `JITU-2026-${Date.now().toString(36).toUpperCase()}`;
}

export function resolveDivision(roleTitleOrId: string) {
  const found = HIRING_POSITIONS.find(
    (p) => p.id === roleTitleOrId || p.title === roleTitleOrId
  );
  return found?.division ?? "Technology";
}

export function resolvePositionTitle(roleTitleOrId: string) {
  const found = HIRING_POSITIONS.find(
    (p) => p.id === roleTitleOrId || p.title === roleTitleOrId
  );
  return found?.title ?? roleTitleOrId;
}
