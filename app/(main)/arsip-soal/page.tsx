import type { Metadata } from "next";
import SoalAsliSection from "@/components/soal-asli-section";
import ArsipSoalLandingView from "@/components/arsip-soal-landing-view";

export const metadata: Metadata = {
  title: "Arsip Soal Asli UTBK & SNBT 2010 - 2026 · Jitu",
  description:
    "Kumpulan 163 paket naskah soal asli yang benar-benar keluar di ujian UTBK/SNBT resmi dari tahun 2010 hingga 2026. Lengkap 7 subtes TPS & Literasi, timer latihan, dan naskah lengkap gratis.",
};

export const dynamic = "force-dynamic";

interface ArsipSoalPageProps {
  searchParams?: Promise<{ from?: string }>;
}

export default async function ArsipSoalPage({
  searchParams,
}: ArsipSoalPageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  const isFromLanding = resolved?.from === "landing";

  if (isFromLanding) {
    return <ArsipSoalLandingView />;
  }

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SoalAsliSection variant="dashboard" />
    </div>
  );
}
