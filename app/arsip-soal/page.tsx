import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen } from "lucide-react";
import SoalAsliSection from "@/components/soal-asli-section";

export const metadata: Metadata = {
  title: "Arsip Soal Asli UTBK & SNBT 2010 - 2026 · Jitu",
  description:
    "Kumpulan 163 paket naskah soal asli yang benar-benar keluar di ujian UTBK/SNBT resmi dari tahun 2010 hingga 2026. Lengkap 7 subtes TPS & Literasi, timer latihan, dan naskah lengkap gratis.",
};

export const dynamic = "force-dynamic";

export default function ArsipSoalPage() {
  return (
    <main className="min-h-screen bg-bg text-text selection:bg-yellow-300 selection:text-ink-900 relative">
      {/* Speckled Paper Texture Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[url('/white-speckled-paper.svg')] opacity-60 bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
      />

      {/* Blog-Style Sticky Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-5 sm:gap-6">
            <nav className="hidden sm:flex items-center gap-4 text-[13px] font-medium text-text-muted">
              <Link href="/blog" className="hover:text-text transition-colors">
                Blog & Panduan
              </Link>
              <Link href="/tryout" className="hover:text-text transition-colors">
                Tryout SNBT
              </Link>
              <Link href="/latihan" className="hover:text-text transition-colors">
                Latihan Harian
              </Link>
            </nav>

            <div className="h-5 w-px bg-border hidden sm:block" />

            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/blue-jitu-logo.png"
                alt="Logo Jitu"
                width={36}
                height={24}
                className="h-6 w-auto object-contain"
              />
              <span className="font-extrabold text-[20px] tracking-[-0.03em] text-text">
                jitu<span className="text-primary">.</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-24 space-y-10">
        <SoalAsliSection variant="page" />
      </div>
    </main>
  );
}
