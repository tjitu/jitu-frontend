"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  Flame,
  X,
  Lightbulb,
  Shuffle,
  Crown,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InteractiveSolutionDeck,
  renderMathContent,
} from "@/components/interactive-solution-deck";
import type {
  PracticeQuestionSummary,
  QuestionSolutionData,
} from "@/lib/practice-store";

const DAILY_FREE_LIMIT = 10;

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SUBTESTS = [
  { id: "ALL", label: "Semua Subtes" },
  { id: "PENALARAN_MATEMATIKA", label: "Penalaran Matematika" },
  { id: "PENGETAHUAN_KUANTITATIF", label: "Pengetahuan Kuantitatif" },
  { id: "PENALARAN_UMUM", label: "Penalaran Umum" },
  { id: "LITERASI_INDONESIA", label: "Literasi B. Indonesia" },
  { id: "LITERASI_INGGRIS", label: "Literasi B. Inggris" },
  { id: "PEMAHAMAN_BACAAN", label: "Pemahaman Bacaan & Menulis" },
];

const DIFFICULTIES = [
  { id: "ALL", label: "Semua Level" },
  { id: "EASY", label: "Mudah", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "MEDIUM", label: "Sedang", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "HARD", label: "Sulit", color: "text-rose-700 bg-rose-50 border-rose-200" },
];

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

interface QuestionAttempt {
  selectedOptionId: string | null;
  isCorrect: boolean;
  correctOptionId: string | null;
  solution: QuestionSolutionData | null;
  isRevealOnly?: boolean;
}

export function LatihanModule() {
  const [questions, setQuestions] = useState<PracticeQuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtest, setSelectedSubtest] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");

  // Active question ID
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Per-question attempts map so state is preserved when switching questions
  const [attempts, setAttempts] = useState<Record<string, QuestionAttempt>>({});

  // Current selection for the active question (pending submission)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Inline solution card toggle (appears setara dengan card soal)
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  // 1-second random question loading animation
  const [isShufflingQuestion, setIsShufflingQuestion] = useState(false);

  // Daily Limit for Free Account
  const [dailyAnsweredCount, setDailyAnsweredCount] = useState(0);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isDailyLimitModalOpen, setIsDailyLimitModalOpen] = useState(false);
  const [showProgressTooltip, setShowProgressTooltip] = useState(false);

  // Check premium status & initialize daily attempt count from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasPass =
        localStorage.getItem("jitu_ptn_premium_pass") === "true" ||
        localStorage.getItem("jitu_is_premium") === "true";
      setIsPremiumUser(hasPass);

      const todayKey = getTodayDateKey();
      const stored = localStorage.getItem(`jitu_daily_practice_${todayKey}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setDailyAnsweredCount(parsed.length);
          } else if (typeof parsed === "number") {
            setDailyAnsweredCount(parsed);
          }
        } catch {
          // ignore error
        }
      }
    }
  }, []);

  // Load questions from API (Randomized via SQL ORDER BY RANDOM())
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSubtest !== "ALL") params.set("subtest", selectedSubtest);
      if (selectedDifficulty !== "ALL") params.set("difficulty", selectedDifficulty);

      const res = await fetch(`/api/practice?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        if (data.questions.length > 0) {
          setActiveQuestionId(data.questions[0].id);
        } else {
          setActiveQuestionId(null);
        }
      } else {
        toast.error("Gagal memuat bank latihan soal");
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
      toast.error("Terjadi kesalahan jaringan saat mengambil soal");
    } finally {
      setLoading(false);
    }
  }, [selectedSubtest, selectedDifficulty]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Current active question
  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestionId) return -1;
    return questions.findIndex((q) => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  const activeQuestion = activeQuestionIndex !== -1 ? questions[activeQuestionIndex] : null;

  // Active question's evaluated attempt (if any)
  const currentAttempt = activeQuestion ? attempts[activeQuestion.id] || null : null;

  // Keep pending selectedOptionId synced when switching questions
  useEffect(() => {
    if (activeQuestion) {
      const existing = attempts[activeQuestion.id];
      if (existing) {
        setSelectedOptionId(existing.selectedOptionId);
      } else {
        setSelectedOptionId(null);
        setIsSolutionOpen(false);
      }
    }
  }, [activeQuestionId]);

  // Keyboard shortcut listener: A-E picks options when question is unanswered
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "Escape" && isSolutionOpen) {
        setIsSolutionOpen(false);
        return;
      }

      if (activeQuestion && !currentAttempt) {
        const key = e.key.toUpperCase();
        const optionIndex = OPTION_LETTERS.indexOf(key);
        if (optionIndex !== -1 && activeQuestion.options[optionIndex]) {
          setSelectedOptionId(activeQuestion.options[optionIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isSolutionOpen, activeQuestion, currentAttempt]);

  // Switch to another question with 1-second loading animation
  const handleSelectQuestion = (qId: string) => {
    if (qId === activeQuestionId) return;
    setIsShufflingQuestion(true);
    setIsSolutionOpen(false);
    setTimeout(() => {
      setActiveQuestionId(qId);
      setIsShufflingQuestion(false);
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      const nextQ = questions[activeQuestionIndex + 1];
      setIsShufflingQuestion(true);
      setIsSolutionOpen(false);
      setTimeout(() => {
        setActiveQuestionId(nextQ.id);
        setIsShufflingQuestion(false);
      }, 1000);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      const prevQ = questions[activeQuestionIndex - 1];
      setIsShufflingQuestion(true);
      setIsSolutionOpen(false);
      setTimeout(() => {
        setActiveQuestionId(prevQ.id);
        setIsShufflingQuestion(false);
      }, 1000);
    }
  };

  // Pick a random question with 1-second loading animation
  const handleRandomQuestion = () => {
    if (questions.length <= 1) return;
    const remaining = questions.filter((q) => q.id !== activeQuestionId);
    const randomQ = remaining[Math.floor(Math.random() * remaining.length)];
    if (!randomQ) return;

    setIsShufflingQuestion(true);
    setIsSolutionOpen(false);
    setTimeout(() => {
      setActiveQuestionId(randomQ.id);
      setIsShufflingQuestion(false);
    }, 1000);
  };

  // Record daily practice count in localStorage
  const recordDailyAttempt = useCallback((qId: string) => {
    if (isPremiumUser) return;
    try {
      const todayKey = getTodayDateKey();
      const stored = localStorage.getItem(`jitu_daily_practice_${todayKey}`);
      let answeredIds: string[] = [];
      if (stored) {
        try {
          answeredIds = JSON.parse(stored);
          if (!Array.isArray(answeredIds)) answeredIds = [];
        } catch {
          answeredIds = [];
        }
      }

      if (!answeredIds.includes(qId)) {
        answeredIds.push(qId);
        localStorage.setItem(`jitu_daily_practice_${todayKey}`, JSON.stringify(answeredIds));
        const count = answeredIds.length;
        setDailyAnsweredCount(count);

        if (count >= DAILY_FREE_LIMIT) {
          setTimeout(() => {
            setIsDailyLimitModalOpen(true);
          }, 1200);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [isPremiumUser]);

  // Submit answer for evaluation -> checks daily limit and opens side-by-side solution card!
  const handleSubmitAnswer = async () => {
    if (!activeQuestion || !selectedOptionId) {
      toast.info("Pilih salah satu opsi jawaban terlebih dahulu");
      return;
    }

    // Free account daily limit check
    if (!isPremiumUser && dailyAnsweredCount >= DAILY_FREE_LIMIT && !attempts[activeQuestion.id]) {
      setIsDailyLimitModalOpen(true);
      toast.error("Batas kuota 10 soal harian tercapai! Beralih ke PTN Premium Pass.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          selectedOptionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newAttempt: QuestionAttempt = {
          selectedOptionId,
          isCorrect: data.isCorrect,
          correctOptionId: data.correctOptionId,
          solution: data.solution,
          isRevealOnly: false,
        };

        setAttempts((prev) => ({
          ...prev,
          [activeQuestion.id]: newAttempt,
        }));

        // Record attempt toward daily free limit
        recordDailyAttempt(activeQuestion.id);

        // Open solution card beside the question card
        setIsSolutionOpen(true);

        if (data.isCorrect) {
          toast.success("Jawaban kamu benar! 🎉 Pembahasan terbuka di samping.");
        } else {
          toast.error("Jawaban belum tepat. Cek pembahasan di kartu samping.");
        }
      } else {
        toast.error(data.message || "Gagal memeriksa jawaban");
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      toast.error("Terjadi kesalahan saat memeriksa jawaban");
    } finally {
      setSubmitting(false);
    }
  };

  // Direct reveal solution for self-study mode
  const handleRevealSolution = async () => {
    if (!activeQuestion) return;

    if (!isPremiumUser && dailyAnsweredCount >= DAILY_FREE_LIMIT && !attempts[activeQuestion.id]) {
      setIsDailyLimitModalOpen(true);
      toast.error("Batas kuota 10 soal harian tercapai! Beralih ke PTN Premium Pass.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          revealOnly: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.solution) {
        const newAttempt: QuestionAttempt = {
          selectedOptionId: null,
          isCorrect: false,
          correctOptionId: data.correctOptionId,
          solution: data.solution,
          isRevealOnly: true,
        };

        setAttempts((prev) => ({
          ...prev,
          [activeQuestion.id]: newAttempt,
        }));

        recordDailyAttempt(activeQuestion.id);
        setIsSolutionOpen(true);
        toast.info("Pembahasan interaktif terbuka di kartu samping.");
      } else {
        toast.error(data.message || "Gagal membuka pembahasan");
      }
    } catch (err) {
      console.error("Reveal solution error:", err);
      toast.error("Terjadi kesalahan saat memuat pembahasan");
    } finally {
      setSubmitting(false);
    }
  };
  // Reset current question attempt
  const handleResetAttempt = () => {
    if (!activeQuestion) return;
    setAttempts((prev) => {
      const next = { ...prev };
      delete next[activeQuestion.id];
      return next;
    });
    setSelectedOptionId(null);
    setIsSolutionOpen(false);
  };

  // Find user's selected option object & correct option object for recap
  const selectedOptionObj = activeQuestion?.options.find(
    (o) => o.id === (currentAttempt?.selectedOptionId || selectedOptionId)
  );
  const correctOptionObj = activeQuestion?.options.find(
    (o) => o.id === currentAttempt?.correctOptionId
  );

  // Check if side-by-side solution card should be rendered
  const showSolutionCard = Boolean(isSolutionOpen && currentAttempt?.solution);

  return (
    <div className="min-h-screen bg-bg pb-24 text-text selection:bg-blue-100 selection:text-blue-900">
      {/* ============================================================
          TOP HEADER: SUBTEST FILTER & DAILY LIMIT PROGRESSIVE BAR
          ============================================================ */}
      <div className="bg-surface border-b border-border shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-blue-600" />
                  Mode Latihan Interaktif
                </span>
                {isPremiumUser && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 border border-amber-300 text-xs font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    PTN Premium Pass
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight m-0">
                Latihan Soal SNBT & UTBK
              </h1>
            </div>

            {/* Right Group: Progressive Bar & Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Daily Limit Progressive Bar for Free Account */}
              {!isPremiumUser ? (
                <div
                  className="relative group cursor-pointer"
                  onClick={() => {
                    if (dailyAnsweredCount >= DAILY_FREE_LIMIT) {
                      setIsDailyLimitModalOpen(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-surface-muted/60 border border-border hover:border-primary/50 transition-colors shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text whitespace-nowrap">
                      <Zap
                        className={`w-3.5 h-3.5 ${
                          dailyAnsweredCount >= DAILY_FREE_LIMIT
                            ? "text-rose-500 fill-rose-500"
                            : "text-amber-500 fill-amber-500"
                        }`}
                      />
                      <span>Kuota:</span>
                      <span className="font-mono text-primary font-black">
                        {dailyAnsweredCount}/{DAILY_FREE_LIMIT}
                      </span>
                    </div>

                    {/* Progressive Bar */}
                    <div className="w-20 sm:w-28 h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          dailyAnsweredCount >= DAILY_FREE_LIMIT
                            ? "bg-rose-500"
                            : dailyAnsweredCount >= 7
                            ? "bg-amber-500"
                            : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (dailyAnsweredCount / DAILY_FREE_LIMIT) * 100
                          )}%`,
                        }}
                      />
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        dailyAnsweredCount >= DAILY_FREE_LIMIT
                          ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                          : "bg-blue-100/70 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {dailyAnsweredCount >= DAILY_FREE_LIMIT
                        ? "Habis"
                        : "Akun Free"}
                    </span>
                  </div>

                  {/* Hover Info Tooltip (direct to PTN Premium Pass) */}
                  <div className="absolute right-0 top-full mt-2 z-50 w-80 p-4 rounded-2xl bg-surface border border-border shadow-xl text-left transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text">
                          Batas 10 Soal Harian (Akun Free)
                        </h4>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          Kamu sudah mengerjakan{" "}
                          <strong>
                            {dailyAnsweredCount} dari {DAILY_FREE_LIMIT} soal
                          </strong>{" "}
                          hari ini. Kuota direset otomatis tiap tengah malam.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 text-[11px] text-blue-950 space-y-1 mb-3">
                      <div className="font-bold flex items-center gap-1 text-blue-900">
                        <span>Mau latihan ribuan soal tanpa batas?</span>
                      </div>
                      <p className="text-blue-800/90 leading-relaxed">
                        Upgrade ke <strong>PTN Premium Pass</strong> untuk latihan
                        unlimited, bebas buka pembahasan, dan analisis skor IRT.
                      </p>
                    </div>

                    <Link
                      href="/shop?highlight=premium-pass"
                      className="w-full py-2 px-3 rounded-lg bg-[#FFD13B] hover:bg-[#ffc81f] text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Buka Akses PTN Premium Pass</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Akses Unlimited Aktif</span>
                </div>
              )}

              {/* Subtest Quick Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {SUBTESTS.slice(0, 4).map((sub) => {
                  const isActive = selectedSubtest === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubtest(sub.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                        isActive
                          ? "bg-primary text-on-primary shadow-xs"
                          : "bg-surface-muted text-text hover:bg-border/60"
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN ARENA CONTAINER (QUESTION-FIRST, EXPANDABLE SIDE-BY-SIDE)
          User Request: question : solution = 1 : 2 when solution is open
          ============================================================ */}
      <main
        className={`mx-auto px-4 sm:px-6 pt-6 transition-all duration-300 ${
          showSolutionCard ? "max-w-[1580px]" : "max-w-4xl"
        }`}
      >
        {loading ? (
          <div className="space-y-4">
            <div className="h-14 rounded-2xl bg-surface border border-border animate-pulse" />
            <div className="h-96 rounded-2xl bg-surface border border-border animate-pulse p-8" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-3">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-text mb-1">
              Belum ada soal untuk kategori ini
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
              Coba ganti filter subtes untuk menemukan soal latihan lainnya.
            </p>
            <button
              type="button"
              onClick={() => setSelectedSubtest("ALL")}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Tampilkan Semua Subtes
            </button>
          </div>
        ) : activeQuestion ? (
          <div className="space-y-5">
            {/* ------------------------------------------------------------
                QUESTION NAVIGATOR STRIP (Numbers 1, 2, 3... & Acak Soal)
                ------------------------------------------------------------ */}
            <div className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-xs font-semibold text-text-muted mr-1 whitespace-nowrap">
                  Navigasi Soal:
                </span>
                {questions.map((q, idx) => {
                  const isActive = q.id === activeQuestion.id;
                  const attempt = attempts[q.id];
                  const isAnswered = Boolean(attempt);
                  const isCorrect = attempt?.isCorrect;

                  let badgeStyles =
                    "bg-surface-muted text-text-body border-border hover:border-blue-400";

                  if (isActive) {
                    badgeStyles =
                      "bg-primary text-on-primary border-primary ring-2 ring-primary/30 shadow-xs font-bold";
                  } else if (isAnswered) {
                    if (isCorrect) {
                      badgeStyles =
                        "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold";
                    } else {
                      badgeStyles =
                        "bg-rose-50 text-rose-700 border-rose-300 font-bold";
                    }
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSelectQuestion(q.id)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs transition-all cursor-pointer ${badgeStyles}`}
                      title={`Soal ${idx + 1} (${q.subtest.replace(/_/g, " ")})`}
                    >
                      {isAnswered && !isActive ? (
                        isCorrect ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        )
                      ) : (
                        idx + 1
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next & Acak Soal Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                <span className="text-xs font-medium text-text-muted sm:hidden">
                  {activeQuestionIndex + 1} / {questions.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRandomQuestion}
                    className="px-3 py-1.5 rounded-lg border border-primary/30 bg-blue-50/70 hover:bg-blue-100/70 text-xs font-bold text-primary transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Acak dan ganti soal secara random"
                  >
                    <Shuffle className="h-3.5 w-3.5" /> Acak Soal
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIndex === 0}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={activeQuestionIndex >= questions.length - 1}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------
                CARDS GRID: CARD SOAL (KIRI) + CARD PEMBAHASAN (KANAN)
                User Request: "bukan sidebar sebagai new window gini, tapi lebih ke card yang setara dengan card soal"
                ------------------------------------------------------------ */}
            <div
              className={`grid gap-6 items-start transition-all duration-300 ${
                showSolutionCard
                  ? "grid-cols-1 lg:grid-cols-12"
                  : "grid-cols-1"
              }`}
            >
              {/* ============================================================
                  KIRI: CARD SOAL (1/3 LEBAR - QUESTION : SOLUTION = 1 : 2)
                  ============================================================ */}
              <div
                className={`bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 ${
                  showSolutionCard ? "lg:col-span-4 lg:sticky lg:top-6" : "w-full"
                }`}
              >
                {/* 1-Second Loading Animation for Random Questions */}
                {isShufflingQuestion ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shadow-inner">
                        <Shuffle className="w-8 h-8 animate-spin [animation-duration:1s]" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center animate-ping">
                        ✦
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-bold text-text flex items-center justify-center gap-2">
                        <span>Mengacak Soal Latihan...</span>
                      </div>
                      <p className="text-xs text-text-muted max-w-xs mx-auto">
                        Memilih soal UTBK SNBT terbaik untuk latihanmu
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-[pulse_0.8s_ease-in-out_infinite] w-full" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Question Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Soal {activeQuestionIndex + 1} · {activeQuestion.subtest.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            DIFFICULTIES.find((d) => d.id === activeQuestion.difficulty)?.color ||
                            "text-gray-700 bg-gray-50 border-gray-200"
                          }`}
                        >
                          {activeQuestion.difficulty}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleRandomQuestion}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
                        title="Acak soal lain"
                      >
                        <Shuffle className="w-3.5 h-3.5" /> Acak Soal
                      </button>
                    </div>

                    {/* Topic / Subtopic Breadcrumb */}
                    {activeQuestion.topicTitle && (
                      <div className="text-xs font-medium text-text-muted">
                        Topik: <span className="text-text font-semibold">{activeQuestion.topicTitle}</span>
                        {activeQuestion.subtopicTitle && (
                          <span> › {activeQuestion.subtopicTitle}</span>
                        )}
                      </div>
                    )}

                    {/* ============================================================
                        UNIFIED QUESTION CONTENT (Wacana/Stimulus + Pertanyaan)
                        User Request: "gaperlu di kasih tau kalo itu wacana/stimulus soal, textnya samain stylenya kayak pertanyaan"
                        ============================================================ */}
                    <div className="space-y-4 text-base sm:text-lg font-semibold text-text leading-relaxed">
                      {activeQuestion.narration && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderMathContent(activeQuestion.narration, {
                              animatedHighlights: false,
                            }),
                          }}
                        />
                      )}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMathContent(activeQuestion.content, {
                            animatedHighlights: false,
                          }),
                        }}
                      />
                    </div>

                    {/* Options List A - E */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
                        <span>PILIH SALAH SATU JAWABAN:</span>
                        <span className="hidden sm:inline font-mono">Bisa tekan A - E di keyboard</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {activeQuestion.options.map((opt, idx) => {
                          const letter = OPTION_LETTERS[idx] || String.fromCharCode(65 + idx);
                          const isSelected = (currentAttempt?.selectedOptionId || selectedOptionId) === opt.id;
                          const isEvaluated = Boolean(currentAttempt);
                          const isCorrectAnswer =
                            isEvaluated && currentAttempt?.correctOptionId === opt.id;
                          const isSelectedWrong =
                            isEvaluated && isSelected && !currentAttempt?.isCorrect;

                          let optionBorderClass =
                            "border-border bg-surface hover:border-blue-400 hover:bg-blue-50/30";
                          let badgeClass = "bg-surface-muted text-text border-border";

                          if (isEvaluated) {
                            if (isCorrectAnswer) {
                              optionBorderClass =
                                "border-emerald-500 bg-emerald-50/90 ring-1 ring-emerald-500";
                              badgeClass = "bg-emerald-600 text-white border-emerald-600";
                            } else if (isSelectedWrong) {
                              optionBorderClass =
                                "border-rose-400 bg-rose-50/90 ring-1 ring-rose-400";
                              badgeClass = "bg-rose-600 text-white border-rose-600";
                            } else {
                              optionBorderClass = "border-border/60 bg-surface/50 opacity-60";
                            }
                          } else if (isSelected) {
                            optionBorderClass =
                              "border-primary bg-blue-50/70 ring-2 ring-primary/20";
                            badgeClass = "bg-primary text-on-primary border-primary font-bold";
                          }

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={isEvaluated}
                              onClick={() => setSelectedOptionId(opt.id)}
                              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${optionBorderClass}`}
                            >
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${badgeClass}`}
                              >
                                {letter}
                              </span>

                              <div className="flex-1 pt-0.5 text-sm sm:text-base text-text">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: renderMathContent(opt.content, {
                                      animatedHighlights: false,
                                    }),
                                  }}
                                />
                              </div>

                              {/* State Checkmark / Cross icon */}
                              {isEvaluated && isCorrectAnswer && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                                  <CheckCircle2 className="w-4 h-4" />
                                </span>
                              )}
                              {isEvaluated && isSelectedWrong && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 shrink-0">
                                  <XCircle className="w-4 h-4" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ------------------------------------------------------------
                        BOTTOM ACTION TOOLBAR OF CARD SOAL
                        ------------------------------------------------------------ */}
                    <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                      {!currentAttempt ? (
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                          <button
                            type="button"
                            disabled={!selectedOptionId || submitting}
                            onClick={handleSubmitAnswer}
                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {submitting ? (
                              <>Memeriksa Jawaban...</>
                            ) : (
                              <>
                                <Check className="w-4 h-4" /> Periksa Jawaban
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={submitting}
                            onClick={handleRevealSolution}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Buka Pembahasan Langsung
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                          {/* If Card Pembahasan is closed, show button to re-open it */}
                          {!showSolutionCard && (
                            <button
                              type="button"
                              onClick={() => setIsSolutionOpen(true)}
                              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer"
                            >
                              <Lightbulb className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                              Buka Pembahasan Interaktif ({activeQuestion.stepsCount} Slide)
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleResetAttempt}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text hover:bg-surface-muted transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Coba Lagi
                          </button>

                          <button
                            type="button"
                            onClick={handleRandomQuestion}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/40 bg-blue-50/60 hover:bg-blue-50 text-primary text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Shuffle className="w-3.5 h-3.5" /> Soal Acak Lainnya
                          </button>
                        </div>
                      )}

                      {/* Score Status Pill */}
                      {currentAttempt && (
                        <div
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                            currentAttempt.isCorrect
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : currentAttempt.isRevealOnly
                              ? "bg-blue-50 text-blue-800 border border-blue-300"
                              : "bg-rose-50 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {currentAttempt.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Jawaban Benar (+{activeQuestion.points} Poin)
                            </>
                          ) : currentAttempt.isRevealOnly ? (
                            <>
                              <Sparkles className="w-4 h-4 text-primary" />
                              Mode Pembahasan Mandiri
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              Jawaban Belum Tepat
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ============================================================
                  KANAN: CARD PEMBAHASAN (2/3 LEBAR - QUESTION : SOLUTION = 1 : 2)
                  ============================================================ */}
              {isSolutionOpen && currentAttempt && currentAttempt.solution && (
                <div className="lg:col-span-8 animate-in fade-in duration-200">
                  <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
                    <InteractiveSolutionDeck
                      solution={currentAttempt.solution}
                      onClose={() => setIsSolutionOpen(false)}
                      className="border-0 shadow-none rounded-none"
                    />

                    {/* Card Pembahasan Bottom Controls */}
                    <div className="p-4 sm:p-5 border-t border-border bg-surface flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsSolutionOpen(false)}
                        className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors cursor-pointer"
                      >
                        Tutup Pembahasan
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleRandomQuestion();
                          setIsSolutionOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
                      >
                        <Shuffle className="w-3.5 h-3.5" /> Lanjut ke Soal Acak Berikutnya <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* ------------------------------------------------------------
          POPUP MODAL: PTN PREMIUM PASS (When Daily Limit 10 Reached)
          ------------------------------------------------------------ */}
      <Dialog open={isDailyLimitModalOpen} onOpenChange={setIsDailyLimitModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-0 rounded-3xl bg-gradient-to-b from-[#0F2356] via-[#143485] to-[#0D1D45] text-white shadow-2xl">
          <div className="relative p-6 sm:p-8 space-y-6">
            {/* Ambient Background Shimmer & Glows */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-yellow-400/15 blur-3xl pointer-events-none"
            />

            {/* Header with Golden Ticket & Badge */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-14 sm:w-20 sm:h-16 relative shrink-0 select-none animate-ticket-float">
                <Image
                  src="/icons/golden-pass-ticket.png"
                  alt="Tiket Golden Pass PTN Premium Pass"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD13B] text-black text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 fill-black" />
                  PTN Premium Pass
                </span>
                <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Limit 10 Soal Hari Ini Tercapai!
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-blue-200">
                  Kamu telah menyelesaikan kuota 10 soal latihan harian untuk akun Free.
                </DialogDescription>
              </div>
            </div>

            {/* Value Proposition Box */}
            <div className="rounded-2xl bg-white/[0.08] border border-white/15 p-4 sm:p-5 space-y-3 backdrop-blur-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                Buka Akses Tanpa Batas dengan Pass:
              </div>
              <div className="space-y-2.5 text-xs sm:text-[13px] text-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/25 text-yellow-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Latihan Soal Unlimited:</strong> Ribuan soal UTBK tanpa limit harian 10 soal</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/25 text-yellow-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Bebas Buka Pembahasan:</strong> Trik cepat, langkah detail, & rumus kunci tanpa token</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/25 text-yellow-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Analisis Skor IRT & Prediksi Kelulusan:</strong> Pantau target PTN impianmu</span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">Rp55.000</span>
                  <span className="text-xs text-blue-200">/bulan</span>
                </div>
                <p className="text-[11px] text-blue-300/80">Langganan fleksibel, batalkan kapan saja</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDailyLimitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Nanti Saja
                </button>
                <Link
                  href="/shop?highlight=premium-pass"
                  className="px-5 py-2.5 rounded-xl bg-[#FFD13B] hover:bg-[#ffc81f] text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Ambil Premium Pass</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LatihanModule;
