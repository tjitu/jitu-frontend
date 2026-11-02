"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Filter,
  Check,
  ChevronRight,
  Zap,
  Flame,
  Award,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  InteractiveSolutionDeck,
  renderMathContent,
} from "@/components/interactive-solution-deck";
import type { PracticeQuestionSummary, QuestionSolutionData } from "@/lib/practice-store";

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

export function LatihanModule() {
  const [questions, setQuestions] = useState<PracticeQuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtest, setSelectedSubtest] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Practice session state
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [evaluatedResult, setEvaluatedResult] = useState<{
    isCorrect: boolean;
    correctOptionId: string | null;
    solution: QuestionSolutionData | null;
  } | null>(null);

  // Load questions from API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSubtest !== "ALL") params.set("subtest", selectedSubtest);
      if (selectedDifficulty !== "ALL") params.set("difficulty", selectedDifficulty);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/practice?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        toast.error("Gagal memuat bank latihan soal");
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
      toast.error("Terjadi kesalahan jaringan saat mengambil soal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubtest, selectedDifficulty]);

  // Current active question
  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestionId) return -1;
    return questions.findIndex((q) => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  const activeQuestion = activeQuestionIndex !== -1 ? questions[activeQuestionIndex] : null;

  // Handle selecting a question to practice
  const handleStartQuestion = (qId: string) => {
    setActiveQuestionId(qId);
    setSelectedOptionId(null);
    setEvaluatedResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit answer for evaluation
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
        setEvaluatedResult({
          isCorrect: data.isCorrect,
          correctOptionId: data.correctOptionId,
          solution: data.solution,
        });

        if (data.isCorrect) {
          toast.success("Jawaban kamu benar! 🎉 Pembahasan interaktif terbuka di sidebar.");
        } else {
          toast.error("Jawaban belum tepat. Simak langkah solusi di sidebar samping.");
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

  // Reveal solution directly for self-study mode
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
        setEvaluatedResult({
          isCorrect: false,
          correctOptionId: data.correctOptionId,
          solution: data.solution,
        });
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
    setSelectedOptionId(null);
    setEvaluatedResult(null);
  };

  // Navigate next / prev question in arena
  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      const nextQ = questions[activeQuestionIndex + 1];
      handleStartQuestion(nextQ.id);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      const prevQ = questions[activeQuestionIndex - 1];
      handleStartQuestion(prevQ.id);
    }
  };

  // Keyboard shortcut listener for option picking in arena
  useEffect(() => {
    if (!activeQuestion || evaluatedResult) return;

    const handleKey = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      const optionIndex = ["A", "B", "C", "D", "E"].indexOf(key);
      if (optionIndex !== -1 && activeQuestion.options[optionIndex]) {
        setSelectedOptionId(activeQuestion.options[optionIndex].id);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeQuestion, evaluatedResult]);

  return (
    <div className="min-h-screen bg-bg pb-20">
      {/* Top Banner / Hero */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-blue-600" />
                  Bank Latihan Mandiri
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Interactive Deck Ready
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight m-0">
                Latihan Soal SNBT & UTBK
              </h1>
              <p className="text-sm text-text-muted mt-1.5 max-w-2xl">
                Asah pemahaman konsep per subtes dengan pembahasan langkah-demi-langkah, trik jitu cepat, dan visualisasi rumus interaktif.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-surface-muted border border-border rounded-xl p-3 sm:px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted">Total Soal Siap Latihan</div>
                <div className="text-lg font-bold text-text leading-none mt-0.5">
                  {questions.length} <span className="text-xs font-normal text-text-muted">Soal Ber-Deck</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtest Horizontal Filter Scroll */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SUBTESTS.map((sub) => {
              const isActive = selectedSubtest === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubtest(sub.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-muted text-text hover:bg-border/60 hover:text-text"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={
          activeQuestion
            ? "max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6"
            : "max-w-[1120px] mx-auto px-4 sm:px-6 pt-6"
        }
      >
        {activeQuestion ? (
          /* ============================================================
             ARENA LATIHAN INTERAKTIF (TWO-COLUMN SIDEBAR VIEW)
             ============================================================ */
          <div className="space-y-6">
            {/* Arena Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveQuestionId(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text hover:text-primary transition-colors cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-surface-muted"
                >
                  <ArrowLeft className="h-4 w-4" /> Daftar Soal
                </button>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <span className="text-xs font-mono font-medium text-text-muted">
                  Soal {activeQuestionIndex + 1} dari {questions.length}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {activeQuestion.subtest.replace(/_/g, " ")}
                </span>
              </div>

              {/* Prev / Next Question Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={activeQuestionIndex === 0}
                  className="p-1.5 rounded-md border border-border text-text hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Soal Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={activeQuestionIndex >= questions.length - 1}
                  className="p-1.5 rounded-md border border-border text-text hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  Soal Selanjutnya <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Responsive 2-Column Split: Soal (Left) + Pembahasan Sidebar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Soal & Options (Col 1-7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                  {/* Question Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          DIFFICULTIES.find((d) => d.id === activeQuestion.difficulty)?.color ||
                          "text-gray-700 bg-gray-50 border-gray-200"
                        }`}
                      >
                        {activeQuestion.difficulty}
                      </span>
                      {activeQuestion.topicTitle && (
                        <span className="text-xs text-text-muted">
                          {activeQuestion.topicTitle}
                          {activeQuestion.subtopicTitle ? ` › ${activeQuestion.subtopicTitle}` : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                      <span className="inline-flex items-center gap-1 text-primary bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-semibold">
                        <Layers className="h-3 w-3" /> {activeQuestion.stepsCount} Langkah Solusi
                      </span>
                      {activeQuestion.hasTrick && (
                        <span className="inline-flex items-center gap-1 text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200 font-semibold">
                          <Zap className="h-3 w-3 text-yellow-600 fill-yellow-500" /> Trik Jitu
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stimulus / Narration Box (if available) */}
                  {activeQuestion.narration && (
                    <div className="rounded-xl bg-blue-50/50 border border-blue-200/70 p-4 sm:p-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Wacana / Stimulus Soal
                      </div>
                      <div
                        className="text-sm sm:text-[15px] text-blue-950 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: renderMathContent(activeQuestion.narration, {
                            animatedHighlights: false,
                          }),
                        }}
                      />
                    </div>
                  )}

                  {/* Main Question Prompt */}
                  <div className="text-base sm:text-lg font-semibold text-text leading-relaxed">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMathContent(activeQuestion.content, {
                          animatedHighlights: false,
                        }),
                      }}
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Pilih salah satu jawaban: (Bisa tekan tombol A - E di keyboard)
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {activeQuestion.options.map((opt, idx) => {
                        const letter = OPTION_LETTERS[idx] || String.fromCharCode(65 + idx);
                        const isSelected = selectedOptionId === opt.id;
                        const isEvaluated = Boolean(evaluatedResult);
                        const isCorrectAnswer =
                          isEvaluated && evaluatedResult?.correctOptionId === opt.id;
                        const isSelectedWrong =
                          isEvaluated && isSelected && !evaluatedResult?.isCorrect;

                        let optionBorderClass =
                          "border-border bg-surface hover:border-blue-300 hover:bg-blue-50/20";
                        let badgeClass = "bg-surface-muted text-text border-border";

                        if (isEvaluated) {
                          if (isCorrectAnswer) {
                            optionBorderClass =
                              "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500";
                            badgeClass = "bg-emerald-600 text-white border-emerald-600";
                          } else if (isSelectedWrong) {
                            optionBorderClass =
                              "border-rose-400 bg-rose-50/80 ring-1 ring-rose-400";
                            badgeClass = "bg-rose-600 text-white border-rose-600";
                          } else {
                            optionBorderClass = "border-border/60 bg-surface/50 opacity-60";
                          }
                        } else if (isSelected) {
                          optionBorderClass =
                            "border-primary bg-blue-50/70 ring-2 ring-primary/20";
                          badgeClass = "bg-primary text-on-primary border-primary";
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
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                            {isEvaluated && isSelectedWrong && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                                <XCircle className="w-4 h-4" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    {!evaluatedResult ? (
                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={!selectedOptionId || submitting}
                          onClick={handleSubmitAnswer}
                          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {submitting ? (
                            <>Memeriksa...</>
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
                        <button
                          type="button"
                          onClick={handleResetAttempt}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-bold text-text hover:bg-surface-muted transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Coba Lagi
                        </button>

                        {activeQuestionIndex < questions.length - 1 && (
                          <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
                          >
                            Lanjut ke Soal Berikutnya <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Score Status Pill */}
                    {evaluatedResult && (
                      <div
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                          evaluatedResult.isCorrect
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : "bg-rose-50 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {evaluatedResult.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Jawaban Benar (+{activeQuestion.points} Poin)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            Jawaban Belum Tepat · Cek Pembahasan di Sidebar
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Pembahasan Sidebar (Col 8-12) */}
              <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
                {evaluatedResult?.solution ? (
                  <InteractiveSolutionDeck solution={evaluatedResult.solution} />
                ) : (
                  <PembahasanSidebarTeaser
                    question={activeQuestion}
                    onReveal={handleRevealSolution}
                    loading={submitting}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================
             QUESTION LIST / BROWSER VIEW
             ============================================================ */
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Cari kata kunci materi, soal, rumus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-surface-muted border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Difficulty selector pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs font-medium text-text-muted mr-1 hidden sm:inline">
                  Tingkat:
                </span>
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      selectedDifficulty === diff.id
                        ? "bg-text text-bg font-semibold"
                        : "bg-surface-muted text-text-muted hover:text-text"
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-surface border border-border animate-pulse p-6"
                  />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-16 bg-surface border border-border rounded-2xl p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-3">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-text mb-1">
                  Belum ada soal untuk kategori ini
                </h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
                  Coba ubah filter subtes atau tingkat kesulitan untuk menemukan soal latihan lainnya.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubtest("ALL");
                    setSelectedDifficulty("ALL");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => handleStartQuestion(q.id)}
                    className="group bg-surface border border-border hover:border-blue-400 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          {q.subtest.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            DIFFICULTIES.find((d) => d.id === q.difficulty)?.color ||
                            "text-gray-700 bg-gray-50 border-gray-200"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      {/* Topic Path */}
                      {q.topicTitle && (
                        <p className="text-[12px] font-medium text-text-muted m-0 line-clamp-1">
                          {q.topicTitle} {q.subtopicTitle ? `› ${q.subtopicTitle}` : ""}
                        </p>
                      )}

                      {/* Prompt Excerpt */}
                      <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-3 m-0 leading-relaxed">
                        {q.content}
                      </p>
                    </div>

                    {/* Bottom Deck Features & CTA */}
                    <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          <Layers className="w-3 h-3" /> {q.stepsCount} Slides
                        </span>
                        {q.hasTrick && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Zap className="w-3 h-3 text-amber-600 fill-amber-500" /> Trik
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                        Kerjakan <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PembahasanSidebarTeaser({
  question,
  onReveal,
  loading,
}: {
  question: PracticeQuestionSummary;
  onReveal: () => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3 pb-3.5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-primary">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text m-0">Sidebar Pembahasan</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Interactive Deck
            </span>
          </div>
          <p className="text-[11px] text-text-muted m-0 mt-0.5">
            Langkah bertahap & highlight konsep otomatis
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            {question.stepsCount} Langkah Solusi
          </span>
          {question.hasTrick && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-yellow-600 fill-yellow-500" />
              Trik Jitu Cepat
            </span>
          )}
          {question.hasFormula && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-muted border border-border text-text text-xs font-semibold">
              📐 Rumus Kunci
            </span>
          )}
        </div>

        <p className="text-xs sm:text-[13px] text-text-body leading-relaxed m-0">
          Pembahasan disajikan secara bertahap di sidebar ini. Saat kamu berpindah langkah, variabel kunci, rumus, dan pembuktian akan <strong>di-highlight dengan animasi</strong> agar fokus ke konsep intinya.
        </p>

        {/* Sneak peek roadmap */}
        <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border space-y-2">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Alur Pembahasan Deck:
          </div>
          <div className="space-y-2 text-xs text-text-body">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">1</span>
              <span>Identifikasi Variabel & Pemahaman Soal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">2</span>
              <span>Substitusi Rumus, Kalkulasi, & Trik Jitu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">3</span>
              <span>Verifikasi Kesimpulan & Kunci Jawaban</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border space-y-2.5">
        <p className="text-[11px] text-text-muted m-0">
          Pilih salah satu jawaban di samping lalu klik <strong>Periksa Jawaban</strong>, atau langsung buka pembahasan di sidebar:
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={onReveal}
          className="w-full py-2.5 px-4 rounded-xl border border-primary/40 bg-blue-50/60 hover:bg-blue-50 text-primary text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {loading ? (
            "Membuka Pembahasan..."
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Buka Pembahasan Langsung
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default LatihanModule;

