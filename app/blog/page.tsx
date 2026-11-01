import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Calendar, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Panduan UTBK · Jitu",
  description:
    "Kumpulan panduan belajar, strategi tembus PTN impian, bedah sistem skor IRT, dan info resmi SNBT terbaru dari tim Jitu Edukasi.",
};

const ARTICLES = [
  {
    slug: "strategi-skor-irt-utbk-snbt",
    title: "Membedah Sistem Penilaian IRT UTBK-SNBT: Kenapa Jangan Kosongkan Jawaban?",
    excerpt:
      "Penjelasan matematis bagaimana pembobotan Item Response Theory (IRT) bekerja di SNBT, dan strategi alokasi waktu per subtes agar skormu maksimal.",
    category: "Strategi UTBK",
    readTime: "5 min baca",
    date: "28 Okt 2026",
    highlight: true,
  },
  {
    slug: "tips-tps-penalaran-umum",
    title: "Kuasai Silogisme & Logika Analitik di TPS Penalaran Umum Tanpa Menghafal Rumus",
    excerpt:
      "Trik mengurai premis majemuk, diagram venn logika himpunan, dan pola soal yang paling sering menjebak peserta di subtes PU.",
    category: "Materi TPS",
    readTime: "4 min baca",
    date: "24 Okt 2026",
  },
  {
    slug: "cara-bangun-rutinitas-tryout",
    title: "Metode Evaluasi Tryout Mingguan: Dari Analisis Error Log Sampai Subtes Lemah",
    excerpt:
      "Mengerjakan tryout saja tidak cukup kalau salahnya tidak dibedah. Ini cara mencatat error log yang bikin nilai kamu naik 50+ poin dalam sebulan.",
    category: "Metode Belajar",
    readTime: "6 min baca",
    date: "18 Okt 2026",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-bg text-text selection:bg-yellow-300 selection:text-ink-900 relative">
      {/* Background Texture */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[url('/white-speckled-paper.svg')] opacity-60 bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
      />

      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Kembali ke Beranda</span>
          </Link>
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
      </header>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-20 space-y-12">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Blog & Kabar Jitu</span>
          </div>
          <h1 className="text-[34px] sm:text-[44px] font-black text-text tracking-tight leading-[1.15]">
            Panduan, Analisis & Strategi Tembus PTN
          </h1>
          <p className="text-[16px] sm:text-[18px] text-text-body leading-relaxed">
            Artikel to-the-point seputar persiapan UTBK-SNBT, bedah materi TPS & Literasi, serta kabar pembaruan fitur platform Jitu.
          </p>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARTICLES.map((article) => (
            <article
              key={article.slug}
              className={`p-6 rounded-2xl bg-surface border transition-all duration-200 flex flex-col justify-between gap-6 ${
                article.highlight
                  ? "border-primary/80 shadow-xs hover:border-primary"
                  : "border-border hover:border-blue-300 shadow-xs"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <span className="text-primary">{article.category}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
                <h2 className="text-[18px] font-bold text-text leading-snug hover:text-primary transition-colors cursor-pointer">
                  {article.title}
                </h2>
                <p className="text-[13px] text-text-body leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-[12px] text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
                <span className="text-primary font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Baca <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-[18px] font-bold text-text">
              Mau langsung coba tryout gratis minggu ini?
            </h3>
            <p className="text-[14px] text-text-body">
              Kerjakan tryout SNBT berstandar IRT dan dapatkan analisis subtesmu secara instan.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-[14px] inline-flex items-center gap-2 hover:bg-primary-hover active:bg-primary-pressed transition-colors duration-[120ms]"
          >
            <span>Daftar Gratis</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>
      </div>
    </main>
  );
}

