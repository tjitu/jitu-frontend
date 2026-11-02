"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
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
} from "lucide-react";
import { toast } from "sonner";
import {
  InteractiveSolutionDeck,
  renderMathContent,
} from "@/components/interactive-solution-deck";
import type {
  PracticeQuestionSummary,
  QuestionSolutionData,
} from "@/lib/practice-store";

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

  // Slide-over sidebar drawer state
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  // Load questions from API
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
        // Requirement: 1st view must directly be the question!
        if (data.questions.length > 0) {
          setActiveQuestionId((prev) => {
            const exists = data.questions.some((q: PracticeQuestionSummary) => q.id === prev);
            return exists ? prev : data.questions[0].id;
          });
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
      }
      // Close sidebar by default when switching questions unless already open
      setIsSolutionOpen(false);
    }
  }, [activeQuestionId]);

  // Lock body scroll when slide-over sidebar is open
  useEffect(() => {
    if (isSolutionOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSolutionOpen]);

  // Keyboard listener: Escape closes the sidebar; A-E picks options when sidebar is closed
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "Escape") {
        if (isSolutionOpen) {
          setIsSolutionOpen(false);
        }
        return;
      }

      // If sidebar is closed and question is unanswered, allow picking options via A-E
      if (!isSolutionOpen && activeQuestion && !currentAttempt) {
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

  // Switch to another question
  const handleSelectQuestion = (qId: string) => {
    setActiveQuestionId(qId);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      const nextQ = questions[activeQuestionIndex + 1];
      setActiveQuestionId(nextQ.id);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      const prevQ = questions[activeQuestionIndex - 1];
      setActiveQuestionId(prevQ.id);
    }
  };

  // Submit answer for evaluation -> auto opens the slide-over sidebar!
  const handleSubmitAnswer = async () => {
    if (!activeQuestion || !selectedOptionId) {
      toast.info("Pilih salah satu opsi jawaban terlebih dahulu");
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

        // Requirement: "baru pas habis jawab bisa lihat pembahasan, jadi kayak bisa muncul dari sidebar"
        setIsSolutionOpen(true);

        if (data.isCorrect) {
          toast.success("Jawaban kamu benar! 🎉 Pembahasan interaktif terbuka.");
        } else {
          toast.error("Jawaban belum tepat. Simak langkah solusi di sidebar.");
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

        setIsSolutionOpen(true);
        toast.info("Pembahasan interaktif terbuka di sidebar.");
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

  // Calculate overall answered count
  const answeredCount = useMemo(() => {
    return Object.keys(attempts).length;
  }, [attempts]);

  // Find user's selected option object & correct option object for recap
  const selectedOptionObj = activeQuestion?.options.find(
    (o) => o.id === (currentAttempt?.selectedOptionId || selectedOptionId)
  );
  const correctOptionObj = activeQuestion?.options.find(
    (o) => o.id === currentAttempt?.correctOptionId
  );

  return (
    <div className="min-h-screen bg-bg pb-24 text-text selection:bg-blue-100 selection:text-blue-900">
      {/* ============================================================
          TOP HEADER & SUBTEST FILTER STRIP
          ============================================================ */}
      <div className="bg-surface border-b border-border shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-blue-600" />
                  Mode Latihan Interaktif
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Interactive Deck
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight m-0">
                Latihan Soal SNBT & UTBK
              </h1>
            </div>

            {/* Subtest Quick Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

      {/* ============================================================
          MAIN ARENA CONTAINER (1ST VIEW: QUESTION DIRECTLY)
          ============================================================ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
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
                QUESTION NAVIGATOR STRIP (Numbers 1, 2, 3...)
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

              {/* Prev / Next Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                <span className="text-xs font-medium text-text-muted sm:hidden">
                  {activeQuestionIndex + 1} / {questions.length}
                </span>

                <div className="flex items-center gap-1.5">
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
                PRIMARY QUESTION CARD (CLEAN & CENTERED)
                ------------------------------------------------------------ */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
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

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    <Layers className="h-3.5 w-3.5" /> {activeQuestion.stepsCount} Slides
                  </span>
                  {activeQuestion.hasTrick && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-800 bg-yellow-50 px-2.5 py-0.5 rounded-md border border-yellow-200">
                      <Zap className="h-3.5 w-3.5 text-yellow-600 fill-yellow-500" /> Trik Jitu
                    </span>
                  )}
                </div>
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

              {/* Stimulus / Narration Box (if available) */}
              {activeQuestion.narration && (
                <div className="rounded-xl bg-blue-50/50 border border-blue-200/80 p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide mb-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Wacana / Stimulus Soal
                  </div>
                  <div
                    className="text-sm sm:text-[15px] text-blue-950 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: renderMathContent(activeQuestion.narration, {
                        animatedHighlights: false,
                      }),
                    }}
                  />
                </div>
              )}

              {/* Main Question Content */}
              <div className="text-base sm:text-lg font-semibold text-text leading-relaxed">
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
                  BOTTOM ACTION TOOLBAR & PERSISTENT RE-OPEN BUTTON
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
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* User-requested: "baru pas habis jawab bisa lihat pembahasan, jadi kayak bisa muncul dari sidebar, habis itu bisa di close lagi" */}
                    <button
                      type="button"
                      onClick={() => setIsSolutionOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer"
                    >
                      <Lightbulb className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      Buka Pembahasan Interaktif ({activeQuestion.stepsCount} Slide)
                    </button>

                    <button
                      type="button"
                      onClick={handleResetAttempt}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text hover:bg-surface-muted transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Coba Lagi
                    </button>

                    {activeQuestionIndex < questions.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/40 bg-blue-50/60 hover:bg-blue-50 text-primary text-xs font-bold transition-colors cursor-pointer"
                      >
                        Soal Berikutnya <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
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
            </div>
          </div>
        ) : null}
      </main>

      {/* ============================================================
          SLIDE-OVER SIDEBAR (DRAWER) FOR INTERACTIVE SOLUTION DECK
          Appears smoothly from the right, dismissible via X, overlay, or ESC
          ============================================================ */}
      {/* 1. Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${
          isSolutionOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSolutionOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Slide-Over Panel Container */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] md:w-[680px] lg:w-[740px] bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSolutionOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Pembahasan Interaktif"
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-surface flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                currentAttempt?.isCorrect
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : currentAttempt?.isRevealOnly
                  ? "bg-blue-50 border-blue-200 text-primary"
                  : "bg-rose-50 border-rose-200 text-rose-600"
              }`}
            >
              {currentAttempt?.isCorrect ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : currentAttempt?.isRevealOnly ? (
                <Lightbulb className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-text m-0">
                  {currentAttempt?.isCorrect
                    ? "Jawaban Benar! 🎉"
                    : currentAttempt?.isRevealOnly
                    ? "Pembahasan Mandiri"
                    : "Jawaban Kurang Tepat"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Slide Deck
                </span>
              </div>
              <p className="text-xs text-text-muted m-0 mt-0.5">
                Soal {activeQuestionIndex + 1} · {activeQuestion?.subtest.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Close Button X (with Escape tooltip) */}
          <button
            type="button"
            onClick={() => setIsSolutionOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text hover:bg-surface-muted hover:border-text-muted transition-colors cursor-pointer group"
            title="Tutup Pembahasan (Esc)"
            aria-label="Tutup Pembahasan"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Answer Choice Recap Card */}
          {currentAttempt && !currentAttempt.isRevealOnly && (
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                currentAttempt.isCorrect
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : "bg-rose-50/80 border-rose-200 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Pilihan Kamu:</span>
                <span className="font-mono">
                  {selectedOptionObj
                    ? `Opsi (${OPTION_LETTERS[activeQuestion?.options.indexOf(selectedOptionObj) ?? 0]})`
                    : "-"}
                </span>
              </div>
              {!currentAttempt.isCorrect && correctOptionObj && (
                <div className="flex items-center justify-between font-bold text-emerald-800 pt-1 border-t border-rose-200">
                  <span>Kunci Jawaban Benar:</span>
                  <span className="font-mono">
                    Opsi ({OPTION_LETTERS[activeQuestion?.options.indexOf(correctOptionObj) ?? 0]})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mount the InteractiveSolutionDeck Component */}
          {currentAttempt?.solution ? (
            <InteractiveSolutionDeck solution={currentAttempt.solution} />
          ) : (
            <div className="p-8 text-center text-xs text-text-muted border border-border rounded-2xl bg-surface-muted">
              Memuat pembahasan interaktif...
            </div>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsSolutionOpen(false)}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Tutup Pembahasan
          </button>

          {activeQuestionIndex < questions.length - 1 && (
            <button
              type="button"
              onClick={() => {
                handleNextQuestion();
                setIsSolutionOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
            >
              Lanjut ke Soal Berikutnya <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

export default LatihanModule;
