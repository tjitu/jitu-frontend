import { NextRequest, NextResponse } from "next/server";
import campusCatalog from "@/data/catalog/ptn-programs.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const campusCode = request.nextUrl.searchParams.get("campusCode")?.trim();
  if (!campusCode) {
    return NextResponse.json({ message: "Kode kampus wajib diisi." }, { status: 400 });
  }

  const campus = campusCatalog.find((entry) => entry.campusCode === campusCode);
  if (!campus) {
    return NextResponse.json({ message: "Data program studi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(
    { programs: campus.programs },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
