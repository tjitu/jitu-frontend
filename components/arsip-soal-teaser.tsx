import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Clock, FileText } from "lucide-react";

export default function ArsipSoalTeaserSection() {
  const featuredPackages = [
    {
      subtest: "PK",
      subtestName: "Pengetahuan Kuantitatif",
      year: 2026,
      dateLabel: "Hari 1, 21 April 2026",
      questionCount: 44,
      durationMinutes: 30,
      badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      subtest: "PM",
      subtestName: "Penalaran Matematika",
      year: 2026,
      dateLabel: "Hari 1, 21 April 2026",
      questionCount: 30,
      durationMinutes: 30,
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      subtest: "LBI",
      subtestName: "Literasi B. Indonesia",
      year: 2026,
      dateLabel: "Hari 1, 21 April 2026",
      questionCount: 6,
      durationMinutes: 30,
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      subtest: "PU",
      subtestName: "Penalaran Umum",
      year: 2025,
      dateLabel: "4 Juni 2025",
      questionCount: 31,
      durationMinutes: 30,
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    },
  ];

  return (
    <section id="arsip-soal" className="py-16 lg:py-24 bg-white border-b border-border relative overflow-hidden">
      {/* Speckled background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Naskah Ujian Resmi UTBK</span>
            </div>
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold tracking-tight text-text leading-tight">
              Arsip Soal Asli UTBK/SNBT{" "}
              <span className="hashtag-select-badge bg-[#FFD13B] text-black font-black px-2.5 py-0.5 rounded-xs inline-block">
                #BukanPrediksi
              </span>
            </h2>
            <p className="text-[15px] sm:text-[16px] text-text-body leading-relaxed">
              Arsip resmi <strong>163 paket naskah asli</strong> dari <strong>2010 hingga 2026</strong>.
              Soal yang benar-benar keluar di ujian UTBK/SNBT, bukan soal rekonstruksi atau prediksi.
              Tersedia lengkap 7 subtes TPS & Literasi untuk melatih pola naskah sesungguhnya.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 bg-surface-muted border border-border rounded-xl px-5 py-3 self-start md:self-auto shadow-2xs">
            <div className="text-center">
              <div className="text-[22px] font-bold text-primary tabular-nums">163</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Paket Soal
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-[22px] font-bold text-text tabular-nums">3.766+</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Nomor Soal
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-[22px] font-bold text-amber-600 tabular-nums">17 Thn</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                2010 - 2026
              </div>
            </div>
          </div>
        </div>

        {/* 4 Featured Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPackages.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-surface hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.badgeClass}`}>
                    {item.subtest}
                  </span>
                  <span className="text-[12px] font-bold text-text-muted">UTBK {item.year}</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text leading-snug">
                    {item.subtestName}
                  </h3>
                  <p className="text-[12px] text-text-muted mt-1">{item.dateLabel}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[12px] text-text-muted">
                <span>
                  {item.questionCount} soal · {item.durationMinutes} mnt
                </span>
                <Link
                  href="/arsip-soal"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Buka Soal →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Big CTA Banner Linking to /arsip-soal */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-yellow-300 text-[12px] font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Halaman Khusus Arsip Soal</span>
            </div>
            <h3 className="text-[20px] sm:text-[22px] font-bold tracking-tight">
              Ingin membaca & berlatih dengan 163 paket naskah asli lainnya?
            </h3>
            <p className="text-[14px] text-blue-100 max-w-xl leading-relaxed">
              Kunjungi halaman Arsip Soal untuk melihat kumpulan soal per tahun (2010 – 2026), filter berdasarkan subtes, membaca gratis seluruh naskah lengkap, atau mulai simulasi timer 30 menit.
            </p>
          </div>

          <Link
            href="/arsip-soal"
            className="shrink-0 min-h-[46px] px-6 py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-ink-900 font-bold text-[14px] inline-flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>Jelajahi Arsip Soal</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
