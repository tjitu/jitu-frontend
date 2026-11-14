"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
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
  Play,
  Pause,
  RotateCcw,
  Flag,
  Check,
  Award,
  BarChart2,
  HelpCircle,
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
  getSubtestMeta,
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
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [savedCountsMap, setSavedCountsMap] = useState<Record<string, number>>({});

  // Dashboard exam mode specific state
  const [timerSeconds, setTimerSeconds] = useState<number>(30 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");
  const [showFinishSummary, setShowFinishSummary] = useState<boolean>(false);

  // Local progress storage key
  const getStorageKey = (pkgId: string) => `jitu_soal_asli_answers_${pkgId}`;

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

  // Pre-compute saved answer counts once when packages load (avoids 163 localStorage.getItem + JSON.parse calls per render)
  useEffect(() => {
    if (!isDashboard || packages.length === 0) return;
    const map: Record<string, number> = {};
    try {
      for (const pkg of packages) {
        const raw = localStorage.getItem(getStorageKey(pkg.id));
        if (raw) {
          const count = Object.keys(JSON.parse(raw)).length;
          if (count > 0) map[pkg.id] = count;
        }
      }
    } catch {}
    setSavedCountsMap(map);
  }, [isDashboard, packages]);

  // Timer countdown for dashboard practice mode
  useEffect(() => {
    if (!isDashboard || !activePackageModal || !isTimerRunning || showFinishSummary) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDashboard, activePackageModal, isTimerRunning, showFinishSummary]);

  // Keyboard shortcut listener for dashboard practice mode (A, B, C, D, E)
  useEffect(() => {
    if (!isDashboard || !activePackageModal || !activeDetail) return;
    const handleKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      const key = e.key.toUpperCase();
      const currentQ = activeDetail.questions[currentQuestionIndex];
      if (!currentQ || !currentQ.options || currentQ.options.length === 0) return;

      const optIndex = ["A", "B", "C", "D", "E"].indexOf(key);
      if (optIndex !== -1 && currentQ.options[optIndex]) {
        const pickedOpt = currentQ.options[optIndex];
        setUserAnswers((prev) => {
          const updated = { ...prev, [currentQ.id]: pickedOpt.id };
          const count = Object.keys(updated).length;
          setSavedCountsMap((m) => ({ ...m, [activePackageModal.id]: count }));
          try {
            localStorage.setItem(getStorageKey(activePackageModal.id), JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isDashboard, activePackageModal, activeDetail, currentQuestionIndex]);

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
    setShowFinishSummary(false);
    setTimerSeconds((pkg.durationMinutes || 30) * 60);
    setIsTimerRunning(true);

    // Load saved answers from localStorage if available
    try {
      const saved = localStorage.getItem(getStorageKey(pkg.id));
      if (saved) {
        setUserAnswers(JSON.parse(saved));
      } else {
        setUserAnswers({});
      }
    } catch {
      setUserAnswers({});
    }

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

  const getYearSubtestsSummary = (pkgs: SoalAsliPackage[]) => {
    const counts: Record<string, number> = {};
    for (const pkg of pkgs) {
      counts[pkg.subtest] = (counts[pkg.subtest] || 0) + 1;
    }
    return Object.entries(counts).map(([subtest, count]) => {
      const meta = getSubtestMeta(subtest);
      return {
        subtest,
        count,
        ...meta,
      };
    });
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionId };
      if (activePackageModal) {
        const count = Object.keys(updated).length;
        setSavedCountsMap((m) => ({ ...m, [activePackageModal.id]: count }));
        try {
          localStorage.setItem(getStorageKey(activePackageModal.id), JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const currentQuestion: SoalAsliQuestion | null =
    activeDetail && activeDetail.questions && activeDetail.questions.length > 0
      ? activeDetail.questions[currentQuestionIndex]
      : null;

  // Format timer minutes and seconds
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const answeredCount = activeDetail
    ? activeDetail.questions.filter((q) => userAnswers[q.id]).length
    : 0;

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
                                <span className="text-[12px] font-mono font-bold text-text-muted w-6 text-right shrink-0 hidden sm:inline-block">
                                  #{idx + 1}
                                </span>

                                <div
                                  className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold text-[14px] shrink-0 border ${meta.badgeBg} ${meta.border}`}
                                >
                                  {meta.code}
                                </div>

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
                            __html: renderMathContent(currentQuestion.content),
                          }}
                        />
                      </div>

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
                                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
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
    <div className="space-y-8">
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
              Lembar latihan naskah resmi 2010 – 2026. Lengkap dengan timer pengerjaan, lembar jawab
              digital, dan navigasi butir soal.
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
            <div className="text-[11px] text-text-muted mt-0.5">Timer & Lembar Jawab</div>
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
            const subtestsSummary = getYearSubtestsSummary(yg.packages);
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
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <span className="font-mono text-[16px] sm:text-[17px] font-bold text-primary shrink-0 pt-0.5 sm:pt-0">
                      {yg.year}
                    </span>
                    <div className="space-y-1.5 min-w-0">
                      <div>
                        <h2 className="text-[15px] sm:text-[16px] font-bold text-text">
                          UTBK {yg.year}
                        </h2>
                        <div className="text-[12px] text-text-muted flex flex-wrap items-center gap-1.5">
                          <span>📦 {yg.packages.length} Paket Ujian Resmi</span>
                          <span>·</span>
                          <span>📝 {yg.totalQuestions} Butir Soal</span>
                        </div>
                      </div>

                      {/* Package Subtests Emote / Icon representation badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {subtestsSummary.map((sub) => (
                          <span
                            key={sub.code}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${sub.badgeBg} ${sub.border}`}
                            title={`${sub.label}: ${sub.count} paket`}
                          >
                            <span className="text-[12px]">{sub.emoji}</span>
                            <span>{sub.code}</span>
                            {sub.count > 1 && (
                              <span className="text-[10px] opacity-75 font-mono">×{sub.count}</span>
                            )}
                          </span>
                        ))}
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
                      const meta = getSubtestMeta(pkg.subtest);
                      const savedAnswersCount = savedCountsMap[pkg.id] ?? 0;

                      return (
                        <div
                          key={pkg.id}
                          className="px-4 py-3 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-blue-50/20 transition-colors"
                        >
                          {/* Left Column: Number, Badge, Title, Date */}
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="font-mono text-[12px] font-bold text-text-muted w-7 text-right shrink-0 hidden sm:inline-block">
                              #{idx + 1}
                            </span>

                            <div
                              className={`h-8 px-2.5 rounded-md flex items-center justify-center gap-1.5 font-bold text-[12px] shrink-0 border ${meta.badgeBg} ${meta.border}`}
                            >
                              <span className="text-[13px]">{meta.emoji}</span>
                              <span>{meta.code}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <h3 className="text-[14px] font-semibold text-text">
                                  {meta.label}
                                </h3>
                                <span className="text-[12px] text-text-muted">
                                  {pkg.dateLabel}
                                </span>
                                {savedAnswersCount > 0 && (
                                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Tersimpan ({savedAnswersCount}/
                                    {pkg.questionCount})
                                  </span>
                                )}
                              </div>
                              <div className="text-[12px] text-text-muted flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1">
                                  <span>📝</span>
                                  <span>{pkg.questionCount} soal</span>
                                </span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1">
                                  <span>⏱️</span>
                                  <span>{pkg.durationMinutes} menit</span>
                                </span>
                                <span>·</span>
                                <span className="font-medium inline-flex items-center gap-1">
                                  <span>🎯</span>
                                  <span>Naskah asli</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Action: Dashboard Primary Study Button */}
                          <div className="flex items-center self-end md:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenPackage(pkg)}
                              className="min-h-[36px] px-3.5 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-pressed text-white text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{savedAnswersCount > 0 ? "Lanjutkan" : "Kerjakan"}</span>
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

      {/* 4. Fullscreen Workbench / Exam Console Dialog */}
      <Dialog
        open={Boolean(activePackageModal)}
        onOpenChange={(open) => {
          if (!open) {
            setActivePackageModal(null);
            setActiveDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden p-0 rounded-2xl border-border bg-surface text-text shadow-modal flex flex-col">
          <DialogTitle className="sr-only">
            {activePackageModal ? activePackageModal.title : "Workbench Simulasi Soal Asli"}
          </DialogTitle>
          {activePackageModal && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Exam Header: Title, Live Timer, Counter, and Actions */}
              <div className="px-6 py-3.5 border-b border-border bg-surface-muted/80 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary text-white">
                      UTBK {activePackageModal.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 inline-flex items-center gap-1">
                      <span>{getSubtestMeta(activePackageModal.subtest).emoji}</span>
                      <span>{activePackageModal.subtest}</span>
                    </span>
                  </div>
                  <div className="hidden sm:block text-[14px] font-bold text-text truncate max-w-[320px]">
                    {activePackageModal.title}
                  </div>
                </div>

                {/* Center Timer & Pause */}
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono font-bold text-[14px] tabular-nums ${
                      timerSeconds < 300
                        ? "bg-danger-soft border-danger text-danger-text animate-pulse"
                        : "bg-surface border-border text-text"
                    }`}
                  >
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{formatTimer(timerSeconds)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTimerRunning((v) => !v)}
                    title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                    className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Right controls: Answer count & Finish Button */}
                <div className="flex items-center gap-3">
                  <div className="text-[12px] font-medium text-text-muted hidden md:inline-block">
                    Terjawab:{" "}
                    <strong className="text-primary tabular-nums">
                      {answeredCount} / {activeDetail?.questions?.length || 0}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFinishSummary(true)}
                    className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </button>
                </div>
              </div>

              {/* Main Dual-Pane Workspace */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDetail && (
                  <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-muted">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-[14px]">Mempersiapkan lembar soal dan pilihan jawaban...</p>
                  </div>
                )}

                {!loadingDetail && activeDetail && currentQuestion && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Pane: Reading Passage / Narration (If question has one) */}
                    <div
                      className={`${
                        currentQuestion.narration ? "lg:col-span-6" : "hidden"
                      } space-y-3 bg-ink-25 dark:bg-surface-muted/40 p-5 rounded-xl border border-border sticky top-0 max-h-[70vh] overflow-y-auto`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <div className="text-[12px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Wacana / Teks Bacaan</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setFontSize("normal")}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
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
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
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

                    {/* Right Pane: Question, Formula, and Option Cards */}
                    <div
                      className={`${
                        currentQuestion.narration ? "lg:col-span-6" : "lg:col-span-12 max-w-3xl mx-auto"
                      } space-y-6`}
                    >
                      {/* Question Header & Flag Toggle */}
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-primary text-white text-[13px] font-bold flex items-center justify-center">
                            {currentQuestionIndex + 1}
                          </span>
                          <span className="text-[13px] font-semibold text-text-muted">
                            Nomor Asli: #{currentQuestion.number} · 1 Poin
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFlagQuestion(currentQuestion.id)}
                          className={`px-2.5 py-1 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
                            flaggedQuestions[currentQuestion.id]
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "text-text-muted hover:text-text hover:bg-surface-muted border border-border"
                          }`}
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>{flaggedQuestions[currentQuestion.id] ? "Ditandai" : "Tandai Ragu"}</span>
                        </button>
                      </div>

                      {/* Question Text */}
                      <div
                        className="text-[16px] sm:text-[17px] font-medium leading-relaxed text-text space-y-2 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: renderMathContent(currentQuestion.content),
                        }}
                      />

                      {/* Options List */}
                      {currentQuestion.options && currentQuestion.options.length > 0 ? (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between text-[12px] text-text-muted font-bold uppercase tracking-wider">
                            <span>Pilihan Jawaban</span>
                            <span className="normal-case font-normal text-[11px] hidden sm:inline">
                              (Dapat tekan tombol keyboard A-E)
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {currentQuestion.options.map((opt) => {
                              const isSelected = userAnswers[currentQuestion.id] === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-blue-50 border-primary shadow-xs ring-1 ring-primary"
                                      : "bg-surface border-border hover:bg-surface-muted hover:border-blue-200"
                                  }`}
                                >
                                  <span
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 border transition-colors ${
                                      isSelected
                                        ? "bg-primary text-white border-primary shadow-2xs"
                                        : "bg-surface-muted text-text-body border-border"
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
                        <div className="p-5 rounded-xl bg-surface-muted border border-border space-y-2">
                          <div className="text-[12px] font-bold uppercase tracking-wider text-text-muted">
                            Soal Isian Singkat
                          </div>
                          <p className="text-[14px] text-text-body">
                            Format soal ini adalah isian singkat. Tuliskan jawaban bilangan pada
                            catatan lembar kerjamu.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Examination Palette & Navigation Bar */}
              <div className="px-6 py-4 border-t border-border bg-surface-muted/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                {/* Previous / Next buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="min-h-[38px] px-4 rounded-md border border-border bg-surface text-text text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors"
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
                    className="min-h-[38px] px-4 rounded-md bg-primary text-white text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shadow-2xs"
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
                      const isAnswered = Boolean(userAnswers[q.id]);
                      const isFlagged = Boolean(flaggedQuestions[q.id]);

                      let badgeClass = "bg-surface border-border text-text-body hover:bg-surface-muted";
                      if (isCurrent) {
                        badgeClass = "ring-2 ring-primary ring-offset-1 bg-primary text-white font-bold";
                      } else if (isFlagged) {
                        badgeClass = "bg-amber-100 text-amber-900 border-amber-300 font-bold";
                      } else if (isAnswered) {
                        badgeClass = "bg-blue-600 text-white border-blue-600 font-bold";
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-7 h-7 rounded-md text-[11px] shrink-0 border flex items-center justify-center transition-all ${badgeClass}`}
                          title={`Nomor ${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Finish & Evaluation Summary Modal */}
      <Dialog open={showFinishSummary} onOpenChange={setShowFinishSummary}>
        <DialogContent className="max-w-md p-6 rounded-2xl border-border bg-surface text-text">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-text flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Ringkasan Sesi Latihan</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-[14px] text-text-body">
              Kamu telah mengerjakan paket <strong>{activePackageModal?.title}</strong>. Berikut
              status pengisian jawabanmu:
            </p>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-surface-muted border border-border text-center">
              <div>
                <div className="font-mono text-[20px] font-bold text-primary">
                  {answeredCount}
                </div>
                <div className="text-[11px] text-text-muted font-medium">Terjawab</div>
              </div>
              <div>
                <div className="font-mono text-[20px] font-bold text-amber-600">
                  {Object.values(flaggedQuestions).filter(Boolean).length}
                </div>
                <div className="text-[11px] text-text-muted font-medium">Ragu-ragu</div>
              </div>
              <div>
                <div className="font-mono text-[20px] font-bold text-text-muted">
                  {(activeDetail?.questions?.length || 0) - answeredCount}
                </div>
                <div className="text-[11px] text-text-muted font-medium">Belum Dijawab</div>
              </div>
            </div>

            <div className="text-[12px] text-text-muted bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800">
              Jawabanmu telah tersimpan di browser. Kamu dapat mengulang latihan atau meninjau
              jawaban kapan saja.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishSummary(false)}
                className="px-4 py-2 rounded-md border border-border bg-surface text-text text-[13px] font-semibold hover:bg-surface-muted"
              >
                Kembali ke Soal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFinishSummary(false);
                  setActivePackageModal(null);
                  setActiveDetail(null);
                }}
                className="px-4 py-2 rounded-md bg-primary text-white text-[13px] font-semibold hover:bg-primary-hover"
              >
                Tutup & Simpan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
