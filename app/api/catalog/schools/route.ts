import { NextRequest, NextResponse } from "next/server";
import schools from "@/data/catalog/schools.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SchoolRecord = (typeof schools)[number];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID")
    .trim();
}

const indexedSchools = (schools as SchoolRecord[]).map((school) => ({
  school,
  searchText: normalize(
    `${school.name} ${school.npsn} ${school.form} ${school.district} ${school.subdistrict}`,
  ),
  normalizedName: normalize(school.name),
}));

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
  const query = normalize(rawQuery).slice(0, 100);

  if (query.length < 2) {
    return NextResponse.json({ schools: [] });
  }

  const matches: Array<{ school: SchoolRecord; score: number }> = [];
  for (const entry of indexedSchools) {
    if (!entry.searchText.includes(query)) continue;

    const score =
      entry.school.npsn === query
        ? 0
        : entry.school.npsn.startsWith(query)
          ? 1
          : entry.normalizedName.startsWith(query)
            ? 2
            : entry.normalizedName.includes(query)
              ? 3
              : 4;
    matches.push({ school: entry.school, score });
  }

  matches.sort((left, right) => left.score - right.score || left.school.name.localeCompare(right.school.name, "id"));

  return NextResponse.json(
    {
      schools: matches.slice(0, 24).map(({ school }) => school),
    },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}
