import SoalAsliSection from "@/components/soal-asli-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arsip Soal Asli UTBK & SNBT 2010 - 2026 · Jitu",
  description:
    "Kumpulan 163 paket naskah soal asli yang benar-benar keluar di ujian UTBK/SNBT dari tahun 2010 hingga 2026, dikelompokkan per tahun dan subtes.",
};

export default function SoalAsliPage() {
  return (
    <div className="py-8">
      <SoalAsliSection />
    </div>
  );
}
