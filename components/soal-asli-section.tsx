"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renderMathContent } from "@/components/interactive-solution-deck";
import {
  SoalAsliPackage,
  SoalAsliPackageDetail,
  SoalAsliQuestion,
  YearGroupedPackages,
  SUBTEST_META,
} from "@/lib/soal-asli-types";

const SUBTEST_OPTIONS = [
  { id: "ALL", label: "Semua Subtes" },
  { id: "PU", label: "Penalaran Umum (PU)" },
  { id: "PK", label: "Pengetahuan Kuantitatif (PK)" },
  { id: "PM", label: "Penalaran Matematika (PM)" },
  { id: "LBI", label: "Literasi B. Indonesia (LBI)" },
  { id: "LBE", label: "Literasi B. Inggris (LBE)" },
  { id: "PPU", label: "Pengetahuan & Pemahaman Umum (PPU)" },
  { id: "PBM", label: "Pemahaman Bacaan & Menulis (PBM)" },
];

export default function SoalAsliSection() {
  const [packages, setPackages] = useState<SoalAsliPackage[]>([]);
  const [groupedYears, setGroupedYears] = useState<YearGroupedPackages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | "ALL">("ALL");
  const [selectedSubtest, setSelectedSubtest] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Year accordion state: years that are expanded (default: 2026, 2025, 2024 open)
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({
    2026: true,
    2025: true,
    2024: true,
  });

  // Modal package viewer
  const [activePackageModal, setActivePackageModal] = useState<SoalAsliPackage | null>(null);
  const [activeDetail, setActiveDetail] = useState<SoalAsliPackageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Fetch packages list on load
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/soal-asli");
        if (res.ok) {
          const data = await res.json();
          if (active && data.success) {
            setPackages(data.packages || []);
            setGroupedYears(data.grouped || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch soal asli list:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Filter packages based on selected filters
  const filteredYears = useMemo(() => {
    return groupedYears
      .filter((yg) => {
        if (selectedYear !== "ALL" && yg.year !== selectedYear) return false;
        return true;
      })
      .map((yg) => {
        const filteredPackages = yg.packages.filter((pkg) => {
          if (selectedSubtest !== "ALL" && pkg.subtest !== selectedSubtest) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
              pkg.title.toLowerCase().includes(q) ||
              pkg.dateLabel.toLowerCase().includes(q) ||
              pkg.subtestName.toLowerCase().includes(q) ||
              pkg.subtest.toLowerCase().includes(q)
            );
          }
          return true;
        });

        return {
          ...yg,
          packages: filteredPackages,
        };
      })
      .filter((yg) => yg.packages.length > 0);
  }, [groupedYears, selectedYear, selectedSubtest, searchQuery]);

  // Handle open package detail modal
  const handleOpenPackage = async (pkg: SoalAsliPackage) => {
    setActivePackageModal(pkg);
    setLoadingDetail(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    try {
      const res = await fetch(`/api/soal-asli/${pkg.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.package) {
          setActiveDetail(data.package);
        }
      }
    } catch (err) {
      console.error("Failed to load package detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleYearExpanded = (year: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const currentQuestion: SoalAsliQuestion | null =
    activeDetail && activeDetail.questions && activeDetail.questions.length > 0
      ? activeDetail.questions[currentQuestionIndex]
      : null;

  return (
    <section
      id="soal-asli"
      className="py-16 lg:py-24 bg-white border-b border-border relative overflow-hidden"
    >
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
              <span>Arsip Naskah Resmi UTBK</span>
            </div>
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold tracking-tight text-text leading-tight">
              Soal Asli UTBK/SNBT{" "}
              <span className="hashtag-select-badge bg-[#FFD13B] text-black font-black px-2.5 py-0.5 rounded-xs inline-block">
                #BukanPrediksi
              </span>
            </h2>
            <p className="text-[15px] sm:text-[16px] text-text-body leading-relaxed">
              Arsip resmi <strong>163 paket soal</strong> dari <strong>2010 hingga 2026</strong>.
              Soal yang benar-benar diujikan di UTBK/SNBT, dikelompokkan rapi per tahun ujian dan
              siap kamu pelajari langsung secara gratis.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 bg-surface-muted border border-border rounded-xl px-5 py-3 self-start md:self-auto">
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

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Year quick tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedYear("ALL")}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                  selectedYear === "ALL"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface border border-border text-text-body hover:bg-surface-muted"
                }`}
              >
                Semua Tahun
              </button>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                    selectedYear === yr
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface border border-border text-text-body hover:bg-surface-muted"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Cari subtes atau tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Subtest Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[12px] font-bold text-text-muted mr-1.5 inline-flex items-center gap-1">
              <Filter className="w-3 h-3" /> Subtes:
            </span>
            {SUBTEST_OPTIONS.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubtest(sub.id)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-semibold transition-colors ${
                  selectedSubtest === sub.id
                    ? "bg-yellow-400 text-ink-900 font-bold shadow-xs"
                    : "bg-surface-muted text-text-body hover:text-text hover:bg-surface border border-transparent hover:border-border"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-[14px] font-medium">Memuat arsip soal asli dari database...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredYears.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-surface-muted/40 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-text-muted mx-auto" />
            <div className="text-[16px] font-bold text-text">Tidak ada paket yang sesuai</div>
            <p className="text-[14px] text-text-body max-w-md mx-auto">
              Tidak ditemukan paket soal untuk filter subtes atau pencarian tersebut. Coba ganti
              kata kunci atau pilih Semua Subtes.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSubtest("ALL");
                setSelectedYear("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary-hover"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Vertical Section By Year ("buat persection jadi tahun berapa dan paket berapa gitu, dibarisin ke bawah aja") */}
        {!loading && (
          <div className="space-y-10">
            {filteredYears.map((yg) => {
              const isExpanded = expandedYears[yg.year] ?? true;
              return (
                <div
                  key={yg.year}
                  id={`tahun-${yg.year}`}
                  className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden transition-all"
                >
                  {/* Year Section Header */}
                  <div
                    onClick={() => toggleYearExpanded(yg.year)}
                    className="px-5 py-4 sm:px-6 sm:py-4.5 bg-surface-muted/70 border-b border-border flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-muted transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-[18px]">
                        {String(yg.year).slice(-2)}
                      </div>
                      <div>
                        <h3 className="text-[18px] sm:text-[20px] font-bold text-text flex items-center gap-2">
                          <span>Soal Asli UTBK {yg.year}</span>
                          <span className="text-[12px] font-semibold text-primary bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            {yg.packages.length} Paket
                          </span>
                        </h3>
                        <p className="text-[12px] sm:text-[13px] text-text-muted">
                          Total {yg.totalQuestions} butir soal asli tahun {yg.year}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-text-muted">
                      <span className="text-[12px] font-medium hidden sm:inline">
                        {isExpanded ? "Tutup" : "Buka daftar paket"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text" />
                      )}
                    </div>
                  </div>

                  {/* Vertical Packages List ("dibarisin ke bawah aja") */}
                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {yg.packages.map((pkg, idx) => {
                        const meta =
                          SUBTEST_META[pkg.subtest] || {
                            label: pkg.subtestName,
                            code: pkg.subtest,
                            color: "text-text",
                            badgeBg: "bg-surface-muted text-text",
                            border: "border-border",
                          };

                        return (
                          <div
                            key={pkg.id}
                            className="p-4 sm:px-6 sm:py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors duration-[120ms]"
                          >
                            {/* Left Info */}
                            <div className="flex items-start sm:items-center gap-3.5">
                              {/* Order number */}
                              <span className="text-[12px] font-mono font-bold text-text-muted w-6 text-right shrink-0 hidden sm:inline-block">
                                #{idx + 1}
                              </span>

                              {/* Subtest Code Badge */}
                              <div
                                className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold text-[14px] shrink-0 border ${meta.badgeBg} ${meta.border}`}
                              >
                                {meta.code}
                              </div>

                              {/* Title & Subtest description */}
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-[15px] sm:text-[16px] font-bold text-text hover:text-primary transition-colors">
                                    {meta.label} ({meta.code})
                                  </h4>
                                  <span className="text-[12px] font-semibold text-text-body bg-surface-muted px-2 py-0.5 rounded border border-border">
                                    {pkg.dateLabel}
                                  </span>
                                </div>
                                <div className="text-[12px] text-text-muted flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                    <strong className="text-text font-semibold">
                                      {pkg.questionCount} Soal
                                    </strong>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {pkg.durationMinutes} menit
                                  </span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-medium">Naskah Asli</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Action Button */}
                            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenPackage(pkg)}
                                className="h-9 px-4 rounded-md bg-yellow-400 hover:bg-yellow-300 text-ink-900 font-bold text-[13px] inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                              >
                                <span>Lihat Soal</span>
                                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Package Viewer Dialog */}
      <Dialog
        open={Boolean(activePackageModal)}
        onOpenChange={(open) => {
          if (!open) {
            setActivePackageModal(null);
            setActiveDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-border bg-white text-text">
          {activePackageModal && (
            <div className="flex flex-col h-full">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-border bg-surface-muted/50 sticky top-0 z-20 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white">
                      UTBK {activePackageModal.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-400 text-ink-900">
                      {activePackageModal.subtest}
                    </span>
                    <span className="text-[12px] text-text-muted font-medium">
                      {activePackageModal.dateLabel}
                    </span>
                  </div>
                  <DialogTitle className="text-[18px] sm:text-[20px] font-bold text-text">
                    {activePackageModal.title}
                  </DialogTitle>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {loadingDetail && (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <p className="text-[13px]">Memuat naskah soal dan pilihan jawaban...</p>
                  </div>
                )}

                {!loadingDetail && activeDetail && currentQuestion && (
                  <div className="space-y-6">
                    {/* Question Number Pills Navigation */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border overflow-x-auto">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        {activeDetail.questions.map((q, idx) => {
                          const isCurrent = idx === currentQuestionIndex;
                          const isAnswered = Boolean(userAnswers[q.id]);
                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`w-8 h-8 rounded-md text-[12px] font-bold shrink-0 transition-colors ${
                                isCurrent
                                  ? "bg-primary text-white shadow-xs"
                                  : isAnswered
                                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                                  : "bg-surface-muted text-text-body hover:bg-surface border border-border"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[12px] font-semibold text-text-muted shrink-0">
                        Soal {currentQuestionIndex + 1} dari {activeDetail.questions.length}
                      </div>
                    </div>

                    {/* Reading Passage / Narration if present */}
                    {currentQuestion.narration && (
                      <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-text space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Wacana / Teks Bacaan</span>
                        </div>
                        <div
                          className="text-[14px] leading-relaxed whitespace-pre-line text-text-body font-serif"
                          dangerouslySetInnerHTML={{
                            __html: renderMathContent(currentQuestion.narration),
                          }}
                        />
                      </div>
                    )}

                    {/* Question Content */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center">
                          {currentQuestion.number}
                        </span>
                        <span className="text-[12px] font-semibold text-text-muted">
                          Poin: {currentQuestion.points}
                        </span>
                      </div>

                      <div
                        className="text-[16px] font-medium leading-relaxed text-text"
                        dangerouslySetInnerHTML={{
                          __html: renderMathContent(currentQuestion.content),
                        }}
                      />
                    </div>

                    {/* Multiple Choice Options or Fill-in-the-blank */}
                    {currentQuestion.options && currentQuestion.options.length > 0 ? (
                      <div className="space-y-2.5 pt-2">
                        <div className="text-[12px] font-bold uppercase tracking-wider text-text-muted">
                          Pilihan Jawaban
                        </div>
                        <div className="space-y-2">
                          {currentQuestion.options.map((opt) => {
                            const isSelected = userAnswers[currentQuestion.id] === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setUserAnswers((prev) => ({
                                    ...prev,
                                    [currentQuestion.id]: opt.id,
                                  }))
                                }
                                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                                  isSelected
                                    ? "bg-blue-50 border-primary shadow-2xs"
                                    : "bg-surface border-border hover:bg-surface-muted"
                                }`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 border ${
                                    isSelected
                                      ? "bg-primary text-white border-primary"
                                      : "bg-surface-muted text-text-body border-border"
                                  }`}
                                >
                                  {opt.label}
                                </span>
                                <div
                                  className="text-[14px] text-text pt-0.5 leading-snug"
                                  dangerouslySetInnerHTML={{
                                    __html: renderMathContent(opt.content),
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2">
                        <div className="text-[12px] font-bold uppercase tracking-wider text-text-muted">
                          Tipe Soal Isian Singkat
                        </div>
                        <p className="text-[13px] text-text-body">
                          Tuliskan jawaban akhir bilangan pada lembar pengerjaan.
                        </p>
                      </div>
                    )}

                    {/* Modal Footer Controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <button
                        type="button"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 rounded-md border border-border bg-surface text-text text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                      </button>

                      <button
                        type="button"
                        disabled={
                          !activeDetail.questions ||
                          currentQuestionIndex >= activeDetail.questions.length - 1
                        }
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(activeDetail.questions.length - 1, prev + 1)
                          )
                        }
                        className="px-4 py-2 rounded-md bg-primary text-white text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover"
                      >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
