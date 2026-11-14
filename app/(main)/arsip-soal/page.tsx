import type { Metadata } from "next";
import ArsipSoalClient from "./client";

export const metadata: Metadata = {
  title: "Arsip Soal Asli UTBK & SNBT 2010 - 2026 · Jitu",
  description:
    "Kumpulan 163 paket naskah soal asli yang benar-benar keluar di ujian UTBK/SNBT resmi dari tahun 2010 hingga 2026. Lengkap 7 subtes TPS & Literasi, timer latihan, dan naskah lengkap.",
};

export const dynamic = "force-dynamic";

export default function ArsipSoalPage() {
  return <ArsipSoalClient />;
}
