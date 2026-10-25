import { promises as fs } from "fs";
import path from "path";
import { HiringApplication, HIRING_POSITIONS } from "./hiring-types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "hiring-applications.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function getAllApplications(): Promise<HiringApplication[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAllApplications(
  apps: HiringApplication[]
): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
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

