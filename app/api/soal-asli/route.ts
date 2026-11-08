import { NextRequest, NextResponse } from "next/server";
import { getSoalAsliPackages, groupPackagesByYear } from "@/lib/soal-asli";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const subtestParam = searchParams.get("subtest") || undefined;
    const searchParam = searchParams.get("search") || undefined;

    const year = yearParam ? parseInt(yearParam, 10) : undefined;

    const packages = await getSoalAsliPackages({
      year,
      subtest: subtestParam,
      search: searchParam,
    });

    const grouped = groupPackagesByYear(packages);
    const totalQuestions = packages.reduce((sum, p) => sum + p.questionCount, 0);

    return NextResponse.json({
      success: true,
      totalPackages: packages.length,
      totalQuestions,
      grouped,
      packages,
    });
  } catch (err: any) {
    console.error("Failed to get soal asli packages:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load packages" },
      { status: 500 }
    );
  }
}
