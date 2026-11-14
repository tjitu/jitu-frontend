import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const frontend = path.join(root, "new-repo", "jitu-frontend");
const catalogDir = path.join(frontend, "data", "catalog");
const sourceDir = path.join(root, "scripts", "exports");
const schoolSource = path.join(
  sourceDir,
  "sekolah-sma-smk",
  "sekolah_sma_smk_man_20261115-010038.json",
);
const campusDir = path.join(sourceDir, "ptn-top30-webometrics-july-2026");
const campusSource = path.join(campusDir, "kampus_top30.json");
const logoSourceDir = path.join(campusDir, "logos");
const logoTargetDir = path.join(frontend, "public", "logos", "ptn-top30");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const writeJson = async (file, data) =>
  writeFile(file, `${JSON.stringify(data)}\n`, "utf8");

await mkdir(catalogDir, { recursive: true });
await mkdir(logoTargetDir, { recursive: true });

const allowedSchoolForms = new Set(["SMA", "SMK", "MAN"]);
const schools = await readJson(schoolSource);
const compactSchools = [];
const schoolIds = new Set();
for (const school of schools) {
  const npsn = String(school.NPSN ?? "").trim();
  const name = String(school.Nama ?? "").trim();
  const form = String(school.Bentuk ?? "").trim().toUpperCase();
  if (!npsn || !name || !allowedSchoolForms.has(form) || schoolIds.has(npsn)) continue;
  schoolIds.add(npsn);
  compactSchools.push({
    npsn,
    name,
    form,
    district: String(school.Kabupaten ?? "").trim(),
    subdistrict: String(school.Kecamatan ?? "").trim(),
  });
}

const campuses = await readJson(campusSource);
const compactCampuses = [];
const universities = [];
const idByCampusCode = {
  "001002": "ui",
  "001001": "ugm",
  "001004": "unair",
  "001034": "upi",
  "001019": "ub",
  "001007": "unpad",
  "001008": "undip",
  "001027": "uns",
  "002001": "itb",
  "002003": "ipb",
  "001033": "um",
  "001005": "unhas",
  "001038": "uny",
  "001032": "unp",
  "001026": "unila",
  "001041": "unnes",
  "001037": "unj",
  "001039": "unesa",
  "001006": "unand",
  "001016": "unram",
  "001011": "usk",
  "001003": "usu",
  "001020": "unja",
  "002002": "its",
  "001036": "unm",
  "001010": "ulm",
  "001009": "unsri",
  "001025": "unej",
  "001013": "unud",
  "001017": "unri",
};

for (const campus of campuses) {
  const campusCode = String(campus.pddikti_code ?? "").trim();
  if (!campusCode) continue;
  const logoFile = path.basename(String(campus.logo_file ?? ""));
  const logo = logoFile ? `/logos/ptn-top30/${logoFile}` : "";
  const programs = (campus.program_studi_aktif ?? [])
    .filter((program) => String(program.program_status).toLowerCase() === "aktif")
    .map((program) => ({
      programCode: String(program.program_code ?? ""),
      name: String(program.program_name ?? "").trim(),
      degreeLevel: String(program.degree_level ?? "").trim(),
      accreditation: String(program.program_accreditation ?? "").trim(),
    }))
    .filter((program) => program.name);

  compactCampuses.push({ campusCode, programs });
  universities.push({
    id: idByCampusCode[campusCode] ?? campusCode.toLowerCase(),
    campusCode,
    name: String(campus.campus_name ?? campus.ranking_name ?? "").trim(),
    acronym: String(campus.abbreviation ?? "").trim() || "ITS",
    logo,
  });

  if (logoFile) {
    await copyFile(path.join(logoSourceDir, logoFile), path.join(logoTargetDir, logoFile));
  }
}

await Promise.all([
  writeJson(path.join(catalogDir, "schools.json"), compactSchools),
  writeJson(path.join(catalogDir, "ptn-programs.json"), compactCampuses),
  writeJson(path.join(catalogDir, "ptn-universities.json"), universities),
]);

console.log(
  `Prepared ${compactSchools.length.toLocaleString("id-ID")} schools, ` +
    `${universities.length} campuses, and ` +
    `${compactCampuses.reduce((total, campus) => total + campus.programs.length, 0).toLocaleString("id-ID")} active programs.`,
);
