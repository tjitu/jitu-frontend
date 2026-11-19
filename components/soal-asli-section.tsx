"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnswerFormatGuide } from "@/components/answer-format-guide";
import { splitQuestionGuidance } from "@/lib/question-guidance";
import { renderMathContent } from "@/components/interactive-solution-deck";
import {
  SoalAsliPackage,
  SoalAsliPackageDetail,
  SoalAsliQuestion,
  YearGroupedPackages,
  SUBTEST_META,
  getSubtestMeta,
} from "@/lib/soal-asli-types";
import { getSubtestInfo } from "@/modules/TryoutDetailModule/components/SubtestIcons";
import { PixelBookIcon } from "@/components/ui/pixel-book-icon";

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

interface SoalAsliSectionProps {
  variant?: "landing" | "dashboard" | "page";
}

// Module-level client caches so switching between pages or reopening a package modal is instant (0ms)
let clientPackagesCache: SoalAsliPackage[] | null = null;
let clientGroupedCache: YearGroupedPackages[] | null = null;
const clientDetailCache = new Map<string, SoalAsliPackageDetail>();

export default function SoalAsliSection({ variant = "landing" }: SoalAsliSectionProps) {
  const isDashboard = variant === "dashboard";
  const isPage = variant === "page";

  const [packages, setPackages] = useState<SoalAsliPackage[]>(clientPackagesCache ?? []);
  const [groupedYears, setGroupedYears] = useState<YearGroupedPackages[]>(clientGroupedCache ?? []);
  const [loading, setLoading] = useState(!clientPackagesCache);
  const [selectedYear, setSelectedYear] = useState<number | "ALL">("ALL");
  const [selectedSubtest, setSelectedSubtest] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Year accordion state
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
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");
  const viewerRef = useRef<HTMLElement>(null);

  // Local state for selected answers in Arsip Soal (read-only view with client-only answer marking)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.sessionStorage.getItem("jitu_arsip_soal_answers");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => {
      const next = {
        ...prev,
        [questionId]: prev[questionId] === optionId ? "" : optionId,
      };
      try {
        window.sessionStorage.setItem("jitu_arsip_soal_answers", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    if (viewerRef.current) {
      viewerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Fetch packages list on load (skipped if already cached in memory)
  useEffect(() => {
    if (clientPackagesCache && clientGroupedCache) {
      setLoading(false);
      return;
    }
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/soal-asli");
        if (res.ok) {
          const data = await res.json();
          if (active && data.success) {
            const pkgs = data.packages || [];
            const grps = data.grouped || [];
            clientPackagesCache = pkgs;
            clientGroupedCache = grps;
            setPackages(pkgs);
            setGroupedYears(grps);
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
    setCurrentQuestionIndex(0);

    const cachedDetail = clientDetailCache.get(pkg.id);
    if (cachedDetail) {
      setActiveDetail(cachedDetail);
      setLoadingDetail(false);
      return;
    }

    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/soal-asli/${pkg.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.package) {
          clientDetailCache.set(pkg.id, data.package);
          setActiveDetail(data.package);
        }
      }
    } catch (err) {
      console.error("Failed to load package detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const isYearExpanded = useCallback(
    (year: number) => {
      if (searchQuery.trim().length > 0) return true;
      if (selectedYear !== "ALL") {
        return expandedYears[year] ?? true;
      }
      return !!expandedYears[year];
    },
    [searchQuery, selectedYear, expandedYears]
  );

  const toggleYearExpanded = (year: number) => {
    setExpandedYears((prev) => {
      const current = isYearExpanded(year);
      return {
        ...prev,
        [year]: !current,
      };
    });
  };

  const allCollapsed = useMemo(() => {
    return filteredYears.every((yg) => !isYearExpanded(yg.year));
  }, [filteredYears, isYearExpanded]);

  const toggleAllYears = () => {
    if (allCollapsed) {
      const next: Record<number, boolean> = {};
      filteredYears.forEach((yg) => {
        next[yg.year] = true;
      });
      setExpandedYears(next);
    } else {
      const next: Record<number, boolean> = {};
      filteredYears.forEach((yg) => {
        next[yg.year] = false;
      });
      setExpandedYears(next);
    }
  };

  const currentQuestion: SoalAsliQuestion | null =
    activeDetail && activeDetail.questions && activeDetail.questions.length > 0
      ? activeDetail.questions[currentQuestionIndex]
      : null;

  const { question, guidance } = splitQuestionGuidance(currentQuestion?.content ?? "");

  // -------------------------------------------------------------------------
  // RENDER: LANDING PAGE VARIANT
  // -------------------------------------------------------------------------
  if (!isDashboard) {
    const pageContent = (
      <>
        <div className={isPage ? "space-y-10" : "relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10"}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Arsip Naskah Resmi UTBK</span>
            </div>
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold tracking-tight text-text leading-tight">
              Arsip Soal Asli UTBK/SNBT{" "}
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

          {/* Vertical Section By Year ("dibarisin ke bawah aja") */}
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
                          const info = getSubtestInfo(pkg.subtest || pkg.subtestName);
                          const SubIcon = info.IconComponent;

                          return (
                            <div
                              key={pkg.id}
                              className="p-4 sm:px-6 sm:py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/50 transition-colors duration-[120ms]"
                            >
                              {/* Left Info */}
                              <div className="flex items-start sm:items-center gap-3.5">
                                <span className="text-[12px] font-mono font-bold text-text-muted w-6 text-right shrink-0 hidden sm:inline-block">
                                  #{idx + 1}
                                </span>

                                <div className="size-9 flex items-center justify-center text-primary shrink-0">
                                  <SubIcon size={22} className="stroke-[2.2]" />
                                </div>

                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-[15px] sm:text-[16px] font-bold text-text hover:text-primary transition-colors">
                                      {info.name} ({info.code})
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

                              {/* Right Action Button (Landing style: Yellow button) */}
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

        {/* Landing Page Preview Modal */}
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
                    <DialogDescription className="sr-only">
                      {`Pratinjau naskah soal asli UTBK ${activePackageModal.year} untuk subtes ${activePackageModal.subtest}`}
                    </DialogDescription>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {loadingDetail && (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
                      <Loader2 className="w-7 h-7 animate-spin text-primary" />
                      <p className="text-[13px]">Memuat naskah soal dan pilihan jawaban...</p>
                    </div>
                  )}

                  {!loadingDetail && activeDetail && currentQuestion && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border overflow-x-auto">
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          {activeDetail.questions.map((q, idx) => {
                            const isCurrent = idx === currentQuestionIndex;
                            const hasAnswered = Boolean(selectedAnswers[q.id]);
                            return (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-8 h-8 rounded-md text-[12px] font-bold shrink-0 transition-colors cursor-pointer ${
                                  isCurrent
                                    ? "bg-primary text-white shadow-xs"
                                    : hasAnswered
                                    ? "bg-blue-100 text-blue-900 border border-blue-300 font-semibold"
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
                          className="text-[16px] font-medium leading-relaxed text-text whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: renderMathContent(question),
                          }}
                        />
                        <AnswerFormatGuide text={guidance} />
                      </div>

                      {currentQuestion.options && currentQuestion.options.length > 0 ? (
                        <div className="space-y-2.5 pt-2">
                          <div className="text-[12px] font-bold uppercase tracking-wider text-text-muted">
                            Pilihan Jawaban
                          </div>
                          <div className="space-y-2">
                            {currentQuestion.options.map((opt) => {
                              const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all duration-150 cursor-pointer ${
                                    isSelected
                                      ? "border-primary bg-blue-50/70 ring-2 ring-primary/20 shadow-xs"
                                      : "border-border bg-surface hover:border-primary/40 hover:bg-surface-muted/50"
                                  }`}
                                >
                                  <span
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 border transition-colors ${
                                      isSelected
                                        ? "border-primary bg-primary text-on-primary shadow-xs"
                                        : "border-border bg-surface-muted text-text-body"
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
                            !activeDetail?.questions ||
                            currentQuestionIndex >= activeDetail.questions.length - 1
                          }
                          onClick={() =>
                            setCurrentQuestionIndex((prev) =>
                              activeDetail ? Math.min(activeDetail.questions.length - 1, prev + 1) : prev
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
      </>
    );

    if (isPage) {
      return <div className="space-y-10">{pageContent}</div>;
    }

    return (
      <section
        id="soal-asli"
        className="py-16 lg:py-24 bg-white border-b border-border relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
        />
        {pageContent}
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: DASHBOARD VARIANT (STUDENT WORKBENCH & PRACTICE CONSOLE)
  // -------------------------------------------------------------------------
  return (
    <div className={activePackageModal ? "w-full" : "space-y-8"}>
      {!activePackageModal && (
        <>
      {/* 1. Dashboard Student Header & Stats Bar */}
      <div className="hidden space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-label text-text-muted flex items-center gap-2">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">Bank Soal Asli UTBK</span>
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-text">
              Bank Naskah Asli UTBK / SNBT
            </h1>
            <p className="text-[14px] sm:text-[15px] text-text-body mt-1">
              Lembar latihan naskah resmi 2010 – 2026. Lengkap dengan lembar jawab
              digital dan navigasi butir soal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-md border border-border bg-surface text-text text-[13px] font-semibold hover:bg-surface-muted transition-colors inline-flex items-center gap-1.5"
            >
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>

        {/* Summary Numbers Row (Matching DashboardModule style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-border bg-surface divide-y sm:divide-y-0 sm:divide-x divide-border shadow-xs">
          <div className="px-5 py-4">
            <div className="text-label text-text-muted">Total Paket</div>
            <div className="font-mono font-bold text-[22px] text-text tabular-nums">
              {packages.length || 163}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">Semua tahun ujian</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-label text-text-muted">Total Soal</div>
            <div className="font-mono font-bold text-[22px] text-primary tabular-nums">
              3.766
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">Tersimpan di database</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-label text-text-muted">Subtes Lengkap</div>
            <div className="font-mono font-bold text-[22px] text-emerald-700 tabular-nums">
              7 Subtes
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">PU, PK, PM, LBI, LBE, PPU, PBM</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-label text-text-muted">Status Mode</div>
            <div className="font-mono font-bold text-[22px] text-amber-600 tabular-nums">
              Workbench
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">Lembar Jawab Digital</div>
          </div>
        </div>
      </div>

      {/* 2. Compact App Filter Toolbar */}
      <div className="hidden bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Subtest segment */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {SUBTEST_OPTIONS.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubtest(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors ${
                  selectedSubtest === sub.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface-muted text-text-body hover:text-text hover:bg-ink-100"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari naskah atau tanggal ujian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface-muted text-[13px] text-text placeholder:text-text-muted focus:bg-surface focus:outline-none focus:border-primary transition-colors"
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

        {/* Year Pills Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border overflow-x-auto no-scrollbar">
          <span className="text-[12px] font-bold text-text-muted shrink-0 mr-1">Tahun:</span>
          <button
            type="button"
            onClick={() => setSelectedYear("ALL")}
            className={`px-2.5 py-1 rounded-md text-[12px] font-bold shrink-0 transition-colors ${
              selectedYear === "ALL"
                ? "bg-ink-900 text-white"
                : "bg-surface border border-border text-text-body hover:bg-surface-muted"
            }`}
          >
            Semua
          </button>
          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(
            (yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-bold shrink-0 transition-colors ${
                  selectedYear === yr
                    ? "bg-ink-900 text-white"
                    : "bg-surface border border-border text-text-body hover:bg-surface-muted"
                }`}
              >
                {yr}
              </button>
            )
          )}
        </div>
      </div>

      {/* 3. High-Density Workbench List per Year ("dibarisin ke bawah aja") */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-muted bg-surface rounded-xl border border-border">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-[14px] font-medium">Memuat workbench soal asli...</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Quick collapse/expand summary bar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-medium text-text-muted">
              Menampilkan {filteredYears.length} tahun ujian ({filteredYears.reduce((acc, y) => acc + y.packages.length, 0)} paket)
            </span>
            <button
              type="button"
              onClick={toggleAllYears}
              className="text-[12px] font-semibold text-primary hover:underline cursor-pointer"
            >
              {allCollapsed ? "Buka Semua" : "Tutup Semua"}
            </button>
          </div>

          {filteredYears.map((yg) => {
            const isExpanded = isYearExpanded(yg.year);
            return (
              <div
                key={yg.year}
                id={`tahun-${yg.year}`}
                className="bg-white rounded-xl border border-border shadow-xs overflow-hidden transition-all"
              >
                {/* Year Header - Collapsible like the user screenshot */}
                <div
                  onClick={() => toggleYearExpanded(yg.year)}
                  className={`px-4 py-3.5 sm:px-5 sm:py-4 bg-white flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-muted/60 transition-colors select-none ${
                    isExpanded ? "border-b border-border bg-surface-muted/20" : ""
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className="size-8 flex items-center justify-center shrink-0 pt-0.5 sm:pt-0">
                      <PixelBookIcon size={24} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[15px] sm:text-[16px] font-bold text-text">
                        UTBK {yg.year}
                      </h2>
                      <div className="text-[12px] text-text-muted flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>{yg.packages.length} Paket</span>
                        <span>·</span>
                        <span>{yg.totalQuestions} Butir Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-text-muted shrink-0 self-center">
                    <span className="text-[12px] font-medium hidden sm:inline text-text-muted">
                      {isExpanded ? "Tutup" : "Buka"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-text" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text" />
                    )}
                  </div>
                </div>

                {/* Workbench Rows ("dibarisin ke bawah aja") */}
                {isExpanded && (
                  <div className="divide-y divide-border bg-white">
                    {yg.packages.map((pkg, idx) => {
                      const subInfo = getSubtestInfo(pkg.subtest || pkg.subtestName);
                      const SubIcon = subInfo.IconComponent;

                      return (
                        <div
                          key={pkg.id}
                          className="px-4 py-3 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-muted/50 transition-colors"
                        >
                          {/* Left Column: Number, Pure Icon, Title, Date */}
                          <div className="flex items-start sm:items-center gap-3.5">
                            <span className="font-mono text-[12px] font-bold text-text-muted w-7 text-right shrink-0 hidden sm:inline-block">
                              #{idx + 1}
                            </span>

                            {/* Pure Icon: identical to hasil tryout SubtestListCard */}
                            <div className="size-9 flex items-center justify-center text-primary shrink-0">
                              <SubIcon size={22} className="stroke-[2.2]" />
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <h3 className="text-[14px] sm:text-[15px] font-semibold text-text">
                                  {subInfo.name}
                                </h3>
                                <span className="text-[12px] text-text-muted">
                                  {pkg.dateLabel}
                                </span>
                              </div>
                              <div className="text-[12px] text-text-muted flex flex-wrap items-center gap-2">
                                <span>{pkg.questionCount} soal</span>
                                <span>·</span>
                                <span>{pkg.durationMinutes} menit</span>
                                <span>·</span>
                                <span className="font-medium text-emerald-700">Naskah asli</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Action: Lihat Soal Button */}
                          <div className="flex items-center self-end md:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenPackage(pkg)}
                              className="min-h-[36px] px-4 rounded-md bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black text-[13px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
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

        </>
      )}

      {/* 4. Full-page Archive Viewer */}
      {activePackageModal && (
        <section
          ref={viewerRef}
          aria-label={`Arsip Soal ${activePackageModal.title}`}
          className="w-full rounded-2xl border border-border bg-white text-text shadow-xs"
        >
          {/* Viewer Header: Back, Pure Icon, Title */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-border bg-surface-muted/70 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActivePackageModal(null);
                  setActiveDetail(null);
                }}
                className="shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-text-muted transition-colors hover:bg-surface hover:text-text cursor-pointer"
                aria-label="Kembali ke arsip soal"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>

              {/* Pure Subtest Icon without bg or border */}
              {(() => {
                const activeSubInfo = getSubtestInfo(activePackageModal.subtest);
                const ActiveSubIcon = activeSubInfo.IconComponent;
                return (
                  <div className="size-7 flex items-center justify-center text-primary shrink-0">
                    <ActiveSubIcon size={20} className="stroke-[2.2]" />
                  </div>
                );
              })()}

              <h2 className="text-[14px] sm:text-[15px] font-bold text-text truncate">
                {activePackageModal.title}
              </h2>
            </div>

            {/* Right side: Total questions count */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-text-muted hidden sm:inline">
                {activeDetail?.questions?.length || activePackageModal.questionCount} Soal
              </span>
            </div>
          </div>

          {/* Main Content (No scroll inside card - flows naturally) */}
          <div className="p-4 sm:p-6 lg:p-8">
            {loadingDetail && (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[14px]">Memuat naskah soal...</p>
              </div>
            )}

            {!loadingDetail && activeDetail && currentQuestion && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Pane: Reading Passage / Narration (If question has one) */}
                {currentQuestion.narration && (
                  <div className="lg:col-span-6 space-y-3 bg-surface-muted/50 p-5 sm:p-6 rounded-xl border border-border">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>Wacana / Teks Bacaan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setFontSize("normal")}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                            fontSize === "normal"
                              ? "bg-primary text-white"
                              : "text-text-muted hover:text-text"
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontSize("large")}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                            fontSize === "large"
                              ? "bg-primary text-white"
                              : "text-text-muted hover:text-text"
                          }`}
                        >
                          A+
                        </button>
                      </div>
                    </div>

                    <div
                      className={`leading-relaxed whitespace-pre-line text-text font-serif ${
                        fontSize === "large" ? "text-[16px] leading-[1.8]" : "text-[14px] leading-[1.7]"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: renderMathContent(currentQuestion.narration || ""),
                      }}
                    />
                  </div>
                )}

                {/* Right Pane: Question Content and Read-only Options */}
                <div
                  className={`${
                    currentQuestion.narration ? "lg:col-span-6" : "lg:col-span-12 max-w-3xl mx-auto"
                  } space-y-6`}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-primary text-white text-[13px] font-bold flex items-center justify-center">
                        {currentQuestionIndex + 1}
                      </span>
                      <span className="text-[13px] font-semibold text-text-muted">
                        Soal Nomor #{currentQuestion.number}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div
                    className="text-[15px] sm:text-[16px] font-medium leading-relaxed text-text space-y-2 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: renderMathContent(question),
                    }}
                  />
                  <AnswerFormatGuide text={guidance} />

                  {/* Options List (Selectable without backend processing) */}
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      <div className="text-[12px] text-text-muted font-bold uppercase tracking-wider">
                        Pilihan Jawaban
                      </div>

                      <div className="space-y-2.5">
                        {currentQuestion.options.map((opt) => {
                          const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                              className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-blue-50/70 ring-2 ring-primary/20 shadow-xs"
                                  : "border-border bg-surface hover:border-primary/40 hover:bg-surface-muted/50"
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 border transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary text-on-primary shadow-xs"
                                    : "border-border bg-surface-muted text-text-body"
                                }`}
                              >
                                {opt.label}
                              </span>
                              <div
                                className="text-[14px] sm:text-[15px] text-text pt-1 leading-snug"
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
                    <div className="p-4 sm:p-5 rounded-xl bg-surface-muted border border-border space-y-1.5">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-text-muted">
                        Tipe Isian Singkat
                      </div>
                      <p className="text-[13px] text-text-muted">
                        Format soal ini adalah isian singkat. Jawaban berupa bilangan atau angka.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-border bg-surface-muted/50 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Previous / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                className="min-h-[36px] px-3.5 rounded-md border border-border bg-surface text-text text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                disabled={
                  !activeDetail?.questions ||
                  currentQuestionIndex >= activeDetail.questions.length - 1
                }
                onClick={() =>
                  goToQuestion(
                    activeDetail
                      ? Math.min(activeDetail.questions.length - 1, currentQuestionIndex + 1)
                      : currentQuestionIndex
                  )
                }
                className="min-h-[36px] px-3.5 rounded-md bg-primary text-white text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal Question Number Palette */}
            {activeDetail && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-[500px] no-scrollbar py-1">
                {activeDetail.questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const hasAnswered = Boolean(selectedAnswers[q.id]);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goToQuestion(idx)}
                      className={`w-7 h-7 rounded-md text-[11px] shrink-0 border flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-white font-bold border-primary shadow-2xs"
                          : hasAnswered
                          ? "bg-blue-100 text-blue-900 border-blue-300 font-bold"
                          : "bg-surface border-border text-text-body hover:bg-surface-muted"
                      }`}
                      title={`Nomor ${idx + 1}${hasAnswered ? " (Sudah Dijawab)" : ""}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
