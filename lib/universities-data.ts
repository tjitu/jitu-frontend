import scrapedUniversities from "@/data/catalog/ptn-universities.json";

export interface UniversityData {
  id: string;
  campusCode?: string;
  name: string;
  acronym: string;
  logo: string;
  /** Curated fallback list for PTNs outside the scraped catalog. */
  programs?: string[];
}

const LEGACY_UNIVERSITIES: UniversityData[] = [
  {
    id: "upnvj",
    name: "UPN Veteran Jakarta",
    acronym: "UPNVJ",
    logo: "/logos/upnvj.png",
    programs: [
      "Kedokteran", "Farmasi", "Informatika", "Sistem Informasi", "Sains Data",
      "Teknik Mesin", "Teknik Industri", "Teknik Elektro", "Ilmu Komunikasi",
      "Hubungan Internasional", "Manajemen", "Akuntansi", "Ekonomi Pembangunan",
      "Ekonomi Syariah", "Hukum", "Kesehatan Masyarakat", "Ilmu Gizi",
    ],
  },
  {
    id: "upnvy",
    name: "UPN Veteran Yogyakarta",
    acronym: "UPNVY",
    logo: "/logos/upnvy.png",
    programs: [
      "Teknik Perminyakan", "Teknik Pertambangan", "Teknik Geologi", "Teknik Geofisika",
      "Informatika", "Sistem Informasi", "Sistem Informasi Geografis", "Teknik Industri",
      "Teknik Kimia", "Teknik Lingkungan", "Manajemen", "Akuntansi",
      "Ekonomi Pembangunan", "Ilmu Komunikasi", "Hubungan Internasional",
      "Ilmu Administrasi Bisnis", "Agribisnis",
    ],
  },
];

export const UNIVERSITIES: UniversityData[] = [
  ...scrapedUniversities,
  ...LEGACY_UNIVERSITIES,
];

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("id-ID");
}

export function getUniversityById(id: string): UniversityData | undefined {
  if (!id) return undefined;
  const clean = normalize(id);
  return UNIVERSITIES.find(
    (university) =>
      university.id === clean ||
      normalize(university.acronym) === clean ||
      university.campusCode === clean,
  );
}

export function findUniversityByNameOrAcronym(
  text?: string | null,
): UniversityData | undefined {
  if (!text) return undefined;
  const clean = normalize(text);
  if (!clean) return undefined;

  return (
    UNIVERSITIES.find(
      (university) =>
        university.id === clean ||
        normalize(university.acronym) === clean ||
        normalize(university.name) === clean ||
        university.campusCode === clean,
    ) ||
    UNIVERSITIES.find(
      (university) =>
        clean.startsWith(`${normalize(university.acronym)} `) ||
        clean.startsWith(`${normalize(university.name)} `) ||
        clean.includes(normalize(university.acronym)) ||
        clean.includes(normalize(university.name)),
    )
  );
}
