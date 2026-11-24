import { NextRequest, NextResponse } from "next/server";
import { getSoalAsliPackageDetail } from "@/lib/soal-asli";
import { getAuthenticatedAppUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const appUser = await getAuthenticatedAppUser(req).catch(() => null);
    if (!appUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan masuk ke akun terlebih dahulu untuk mengakses Arsip Soal.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Package ID or slug is required" },
        { status: 400 }
      );
    }

    const packageDetail = await getSoalAsliPackageDetail(id);
    if (!packageDetail) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: packageDetail,
    });
  } catch (err: any) {
    console.error("Failed to get package detail:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load package detail" },
      { status: 500 }
    );
  }
}
