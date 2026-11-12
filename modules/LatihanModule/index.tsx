"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  Flame,
  X,
  Lightbulb,
  Loader2,
  Crown,
  HelpCircle,
  History,
  Lock,
  SkipForward,
  FlaskConical,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  InteractiveSolutionDeck,
  renderMathContent,
} from "@/components/interactive-solution-deck";
import { PracticeHistoryTab } from "./PracticeHistoryTab";
import type {
  PracticeQuestionSummary,
  QuestionSolutionData,
} from "@/lib/practice-store";

const DAILY_FREE_LIMIT = 10;

const SUBTESTS = [
  { id: "ALL", label: "Semua Subtes" },
  { id: "PENALARAN_UMUM", label: "PU" },
  { id: "PENGETAHUAN_KUANTITATIF", label: "PK" },
  { id: "PENALARAN_MATEMATIKA", label: "PM" },
  { id: "PEMAHAMAN_BACAAN_MENULIS", label: "PBM" },
  { id: "PENGETAHUAN_PEMAHAMAN_UMUM", label: "PPU" },
  { id: "LITERASI_INDONESIA", label: "LBI" },
  { id: "LITERASI_INGGRIS", label: "LBE" },
];

const DIFFICULTIES = [
  { id: "ALL", label: "Semua Level" },
  { id: "EASY", label: "Mudah", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "MEDIUM", label: "Sedang", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "HARD", label: "Sulit", color: "text-rose-700 bg-rose-50 border-rose-200" },
];

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

const SANDBOX_TOKEN_STORAGE_KEY = "jitu_sandbox_preview_token";

interface QuestionAttempt {
  selectedOptionId: string | null;
  inputText?: string | null;
  isCorrect: boolean;
  correctOptionId: string | null;
  correctAnswerText?: string | null;
  solution: QuestionSolutionData | null;
  isRevealOnly?: boolean;
}

export interface LatihanModuleProps {
  forceSandboxMode?: boolean;
}

function LatihanModuleContent({ forceSandboxMode = false }: LatihanModuleProps) {
  const searchParams = useSearchParams();
  const isSandboxMode =
    forceSandboxMode || (searchParams.get("target") || "").toUpperCase() === "SANDBOX";
  const urlQuestionId = searchParams.get("questionId") || null;
  const urlToken = searchParams.get("token") || null;

  const [questions, setQuestions] = useState<PracticeQuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtest, setSelectedSubtest] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"PRACTICE" | "HISTORY">("PRACTICE");

  // Sandbox preview token & auth state
  const [sandboxToken, setSandboxToken] = useState<string | null>(null);
  const [sandboxTokenReady, setSandboxTokenReady] = useState(!isSandboxMode);
  const [sandboxAuthorized, setSandboxAuthorized] = useState(true);
  const autoRevealedIdRef = useRef<string | null>(null);

  // Firebase Auth sync
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Active question ID
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Per-question attempts map in current view before advancing
  const [attempts, setAttempts] = useState<Record<string, QuestionAttempt>>({});

  // Current selection for the active question (pending submission)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Inline solution card toggle (appears setara dengan card soal)
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  // 1-second question loading animation
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Daily Limit & Server Synced Context
  const [dailyAnsweredCount, setDailyAnsweredCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isDailyLimitModalOpen, setIsDailyLimitModalOpen] = useState(false);
  const [showProgressTooltip, setShowProgressTooltip] = useState(false);

  // Capture signed preview token from URL into sessionStorage and strip it from address bar
  useEffect(() => {
    if (!isSandboxMode) {
      setSandboxToken(null);
      setSandboxTokenReady(true);
      return;
    }

    if (typeof window === "undefined") return;

    if (urlToken) {
      window.sessionStorage.setItem(SANDBOX_TOKEN_STORAGE_KEY, urlToken);
      setSandboxToken(urlToken);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("token");
      window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    } else {
      const saved = window.sessionStorage.getItem(SANDBOX_TOKEN_STORAGE_KEY);
      setSandboxToken(saved || null);
    }
    setSandboxTokenReady(true);
  }, [isSandboxMode, urlToken]);

  // Sync Firebase auth session cleanly before loading user-specific question feed
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUid(user?.uid || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    if (isSandboxMode && sandboxToken) {
      headers["x-sandbox-token"] = sandboxToken;
    }
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token errors and fall back to sandbox/anonymous headers
    }
    return headers;
  }, [isSandboxMode, sandboxToken]);

  // Load questions from API (excluding already answered questions for this user in normal mode)
  const fetchQuestions = useCallback(async () => {
    if (!authReady || !sandboxTokenReady) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSubtest !== "ALL") params.set("subtest", selectedSubtest);
      if (selectedDifficulty !== "ALL") params.set("difficulty", selectedDifficulty);
      if (isSandboxMode && selectedBatch !== "ALL") params.set("batch", selectedBatch);
      if (isSandboxMode) {
        params.set("target", "SANDBOX");
        if (urlQuestionId) params.set("questionId", urlQuestionId);
      }

      const headers = await getAuthHeaders();
      const res = await fetch(`/api/practice?${params.toString()}`, { headers });
      const data = await res.json();
      if (typeof data.sandboxAuthorized === "boolean") {
        setSandboxAuthorized(data.sandboxAuthorized);
      } else {
        setSandboxAuthorized(true);
      }
      if (Array.isArray(data.availableBatches)) {
        setAvailableBatches(data.availableBatches);
      }

      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        const preferred =
          isSandboxMode && urlQuestionId
            ? data.questions.find((q: PracticeQuestionSummary) => q.id === urlQuestionId)
            : null;
        setActiveQuestionId(
          preferred ? preferred.id : data.questions.length > 0 ? data.questions[0].id : null
        );
        if (typeof data.isPremium === "boolean") setIsPremiumUser(data.isPremium);
        if (typeof data.dailyAnsweredCount === "number") setDailyAnsweredCount(data.dailyAnsweredCount);
        if (typeof data.totalAnswered === "number") setTotalAnswered(data.totalAnswered);
      } else {
        toast.error("Gagal memuat bank latihan soal");
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
      toast.error("Terjadi kesalahan jaringan saat mengambil soal");
    } finally {
      setLoading(false);
    }
  }, [
    authReady,
    sandboxTokenReady,
    authUid,
    selectedSubtest,
    selectedDifficulty,
    selectedBatch,
    isSandboxMode,
    urlQuestionId,
    getAuthHeaders,
  ]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  // Current active question
  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestionId) return -1;
    return questions.findIndex((q) => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  const activeQuestion = activeQuestionIndex !== -1 ? questions[activeQuestionIndex] : null;

  const isActiveShortAnswer = Boolean(
    activeQuestion &&
      (activeQuestion.type === "SHORT_ANSWER" ||
        activeQuestion.type === "ISIAN_SINGKAT" ||
        activeQuestion.options.length === 0)
  );

  // Active question's evaluated attempt (if any)
  const currentAttempt = activeQuestion ? attempts[activeQuestion.id] || null : null;

  // Keep pending selectedOptionId & shortAnswerInput synced when switching questions
  useEffect(() => {
    if (activeQuestion) {
      const existing = attempts[activeQuestion.id];
      if (existing) {
        setSelectedOptionId(existing.selectedOptionId);
        setShortAnswerInput(existing.inputText || "");
      } else {
        setSelectedOptionId(null);
        setShortAnswerInput("");
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

      if (activeQuestion && !currentAttempt && !isActiveShortAnswer) {
        const key = e.key.toUpperCase();
        const optionIndex = OPTION_LETTERS.indexOf(key);
        if (optionIndex !== -1 && activeQuestion.options[optionIndex]) {
          setSelectedOptionId(activeQuestion.options[optionIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isSolutionOpen, activeQuestion, currentAttempt, isActiveShortAnswer]);

  // Switch to another question
  const handleSelectQuestion = (qId: string) => {
    if (qId === activeQuestionId) return;
    if (!isSandboxMode && activeQuestion && attempts[activeQuestion.id]) {
      setQuestions((prev) => prev.filter((q) => q.id !== activeQuestion.id));
    }
    setIsSolutionOpen(Boolean(isSandboxMode && attempts[qId]?.solution));
    setActiveQuestionId(qId);
  };

  const handleNextQuestion = () => {
    if (!activeQuestion) return;
    setSelectedOptionId(null);
    setShortAnswerInput("");

    if (!isSandboxMode && attempts[activeQuestion.id]) {
      setIsSolutionOpen(false);
      const remaining = questions.filter((q) => q.id !== activeQuestion.id);
      setQuestions(remaining);
      if (remaining.length > 0) {
        const nextIdx = Math.min(activeQuestionIndex, remaining.length - 1);
        setActiveQuestionId(remaining[nextIdx].id);
      } else {
        setActiveQuestionId(null);
      }
      return;
    }

    if (activeQuestionIndex < questions.length - 1) {
      const nextQ = questions[activeQuestionIndex + 1];
      setIsSolutionOpen(Boolean(isSandboxMode && attempts[nextQ.id]?.solution));
      setActiveQuestionId(nextQ.id);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      const prevQ = questions[activeQuestionIndex - 1];
      setIsSolutionOpen(Boolean(isSandboxMode && attempts[prevQ.id]?.solution));
      setActiveQuestionId(prevQ.id);
    }
  };

  const handleResetSandboxAttempt = (questionId: string) => {
    setAttempts((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setSelectedOptionId(null);
    setShortAnswerInput("");
    setIsSolutionOpen(false);
  };

  const handleSkipQuestion = async () => {
    if (!activeQuestion || currentAttempt || skipping) return;
    if (questions.length <= 1) {
      toast.info("Ini satu-satunya soal yang tersisa di filter ini.");
      return;
    }

    const skippedId = activeQuestion.id;
    const rest = questions.filter((q) => q.id !== skippedId);
    const reordered = [...rest, { ...activeQuestion, isPreviouslySkipped: true }];
    setQuestions(reordered);
    setActiveQuestionId(reordered[0].id);
    setSelectedOptionId(null);
    setShortAnswerInput("");
    setIsSolutionOpen(false);
    toast.info("Soal dilewati & dipindahkan ke antrean belakang.");

    if (!isSandboxMode && authUid) {
      try {
        setSkipping(true);
        const headers = await getAuthHeaders();
        await fetch("/api/practice/skip", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ questionId: skippedId }),
        });
      } catch {
        // Queue already updated in UI; DB skip is best-effort
      } finally {
        setSkipping(false);
      }
    }
  };

  // Submit answer for evaluation -> enforces 10/day quota for free users and permanently records ANSWERED (non-destructive in Sandbox)
  const handleSubmitAnswer = async () => {
    if (!activeQuestion) return;
    if (!isActiveShortAnswer && !selectedOptionId) {
      toast.info("Pilih salah satu opsi jawaban terlebih dahulu");
      return;
    }
    if (isActiveShortAnswer && !shortAnswerInput.trim()) {
      toast.info("Tuliskan jawaban terlebih dahulu");
      return;
    }

    if (
      !isSandboxMode &&
      !isPremiumUser &&
      dailyAnsweredCount >= DAILY_FREE_LIMIT &&
      !attempts[activeQuestion.id]
    ) {
      setIsDailyLimitModalOpen(true);
      toast.error("Batas kuota 10 soal harian tercapai! Upgrade ke PTN Premium Pass untuk lanjut.");
      return;
    }

    try {
      setSubmitting(true);
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          selectedOptionId: isActiveShortAnswer ? null : selectedOptionId,
          inputText: isActiveShortAnswer ? shortAnswerInput.trim() : null,
          sandbox: isSandboxMode,
        }),
      });

      const data = await res.json();
      if (res.status === 401 || data.requiresAuth) {
        toast.error(data.error || "Silakan login ke akun terlebih dahulu untuk menjawab soal.");
        return;
      }
      if (!isSandboxMode && (res.status === 403 || data.limitReached)) {
        if (typeof data.dailyAnsweredCount === "number") {
          setDailyAnsweredCount(data.dailyAnsweredCount);
        }
        setIsDailyLimitModalOpen(true);
        toast.error("Kuota harian 10 soal akun gratis sudah habis hari ini.");
        return;
      }

      if (data.success) {
        const newAttempt: QuestionAttempt = {
          selectedOptionId: isActiveShortAnswer ? null : selectedOptionId,
          inputText: isActiveShortAnswer ? shortAnswerInput.trim() : null,
          isCorrect: data.isCorrect,
          correctOptionId: data.correctOptionId,
          correctAnswerText: data.correctAnswerText || null,
          solution: data.solution,
          isRevealOnly: false,
        };

        setAttempts((prev) => ({
          ...prev,
          [activeQuestion.id]: newAttempt,
        }));

        if (typeof data.dailyAnsweredCount === "number") setDailyAnsweredCount(data.dailyAnsweredCount);
        if (typeof data.totalAnswered === "number") setTotalAnswered(data.totalAnswered);
        if (typeof data.isPremium === "boolean") setIsPremiumUser(data.isPremium);

        setIsSolutionOpen(true);

        if (data.isCorrect) {
          toast.success("Jawaban kamu benar! 🎉 Pembahasan terbuka di samping.");
        } else {
          toast.error("Jawaban belum tepat. Cek pembahasan di kartu samping.");
        }
      } else {
        toast.error(data.error || data.message || "Gagal memeriksa jawaban");
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      toast.error("Terjadi kesalahan saat memeriksa jawaban");
    } finally {
      setSubmitting(false);
    }
  };

  // Direct reveal solution -> counts as answered in normal mode, non-destructive in Sandbox mode
  const handleRevealSolution = useCallback(
    async (targetQuestionArg?: PracticeQuestionSummary | null, silent = false) => {
      const targetQ = targetQuestionArg || activeQuestion;
      if (!targetQ) return;

      if (
        !isSandboxMode &&
        !isPremiumUser &&
        dailyAnsweredCount >= DAILY_FREE_LIMIT &&
        !attempts[targetQ.id]
      ) {
        setIsDailyLimitModalOpen(true);
        toast.error("Batas kuota 10 soal harian tercapai! Upgrade ke PTN Premium Pass.");
        return;
      }

      try {
        setSubmitting(true);
        const authHeaders = await getAuthHeaders();
        const res = await fetch("/api/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            questionId: targetQ.id,
            revealOnly: true,
            sandbox: isSandboxMode,
          }),
        });

        const data = await res.json();
        if (res.status === 401 || data.requiresAuth) {
          if (!silent) toast.error(data.error || "Silakan login terlebih dahulu untuk melihat pembahasan.");
          return;
        }
        if (!isSandboxMode && (res.status === 403 || data.limitReached)) {
          if (typeof data.dailyAnsweredCount === "number") {
            setDailyAnsweredCount(data.dailyAnsweredCount);
          }
          setIsDailyLimitModalOpen(true);
          return;
        }

        if (data.success) {
          const newAttempt: QuestionAttempt = {
            selectedOptionId: null,
            isCorrect: false,
            correctOptionId: data.correctOptionId,
            correctAnswerText: data.correctAnswerText || null,
            solution: data.solution,
            isRevealOnly: true,
          };

          setAttempts((prev) => ({
            ...prev,
            [targetQ.id]: newAttempt,
          }));

          if (typeof data.dailyAnsweredCount === "number") setDailyAnsweredCount(data.dailyAnsweredCount);
          if (typeof data.totalAnswered === "number") setTotalAnswered(data.totalAnswered);
          if (typeof data.isPremium === "boolean") setIsPremiumUser(data.isPremium);

          if (data.solution) {
            setIsSolutionOpen(true);
            if (!silent) toast.info("Pembahasan interaktif terbuka di kartu samping.");
          } else if (!silent) {
            toast.info("Kunci jawaban ditampilkan. Soal ini belum memiliki catatan pembahasan.");
          }
        } else if (!silent) {
          toast.error(data.error || data.message || "Gagal membuka pembahasan");
        }
      } catch (err) {
        console.error("Reveal solution error:", err);
        if (!silent) toast.error("Terjadi kesalahan saat memuat pembahasan");
      } finally {
        setSubmitting(false);
      }
    },
    [
      activeQuestion,
      isSandboxMode,
      isPremiumUser,
      dailyAnsweredCount,
      attempts,
      getAuthHeaders,
    ]
  );

  const handleApproveSandboxQuestion = async (targetQ: PracticeQuestionSummary | null) => {
    if (!isSandboxMode || !targetQ || approvingId) return;
    const wasSolutionOpen = isSolutionOpen;
    try {
      setApprovingId(targetQ.id);
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/practice/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ questionId: targetQ.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Gagal meng-ACC soal ke status Ready.");
        return;
      }

      toast.success("Soal berhasil di-ACC dan dipindahkan ke status Ready!");

      const idx = questions.findIndex((q) => q.id === targetQ.id);
      const remaining = questions.filter((q) => q.id !== targetQ.id);

      setAttempts((prev) => {
        const next = { ...prev };
        delete next[targetQ.id];
        return next;
      });
      setQuestions(remaining);
      setSelectedOptionId(null);
      setShortAnswerInput("");

      if (remaining.length > 0) {
        const nextQ = remaining[Math.min(Math.max(idx, 0), remaining.length - 1)];
        setActiveQuestionId(nextQ.id);
        if (wasSolutionOpen) {
          if (attempts[nextQ.id]?.solution) {
            setIsSolutionOpen(true);
          } else {
            void handleRevealSolution(nextQ, true);
          }
        }
      } else {
        setActiveQuestionId(null);
        setIsSolutionOpen(false);
      }
    } catch (err) {
      console.error("Approve sandbox question error:", err);
      toast.error("Terjadi kesalahan jaringan saat meng-ACC soal.");
    } finally {
      setApprovingId(null);
    }
  };

  // Auto-open Question + Pembahasan side-by-side when opening a targeted QC question in Sandbox mode
  useEffect(() => {
    if (!isSandboxMode || !sandboxAuthorized || !urlQuestionId || !activeQuestion) return;
    if (activeQuestion.id !== urlQuestionId) return;
    if (autoRevealedIdRef.current === activeQuestion.id) return;
    if (attempts[activeQuestion.id]) {
      autoRevealedIdRef.current = activeQuestion.id;
      if (attempts[activeQuestion.id].solution) setIsSolutionOpen(true);
      return;
    }

    autoRevealedIdRef.current = activeQuestion.id;
    void handleRevealSolution(activeQuestion, true);
  }, [
    isSandboxMode,
    sandboxAuthorized,
    urlQuestionId,
    activeQuestion,
    attempts,
    handleRevealSolution,
  ]);

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
              {isSandboxMode ? (
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-300 text-xs font-bold">
                    <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                    Sandbox QC
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-muted text-text-muted border border-border text-[11px] font-semibold">
                    Pratinjau Antrean QC · Non-destruktif
                  </span>
                </div>
              ) : isPremiumUser ? (
                <div className="mb-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 border border-amber-300 text-xs font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    PTN Premium Pass
                  </span>
                </div>
              ) : null}
              <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight m-0">
                {isSandboxMode
                  ? "Sandbox Preview · Soal & Pembahasan"
                  : "Latihan Soal SNBT & UTBK"}
              </h1>

              {/* Primary Mode Switcher: Kerjakan Soal vs Riwayat & Pembahasan (hidden in Sandbox mode) */}
              {!isSandboxMode && (
                <div className="mt-3 inline-flex items-center p-1 rounded-xl bg-surface-muted border border-border gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("PRACTICE")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "PRACTICE"
                        ? "bg-surface text-text shadow-2xs"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Kerjakan Soal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("HISTORY")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "HISTORY"
                        ? "bg-surface text-text shadow-2xs"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    {isPremiumUser ? (
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>Riwayat & Pembahasan</span>
                    {totalAnswered > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold">
                        {totalAnswered}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Group: Progressive Bar / Sandbox Pill & Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {isSandboxMode ? (
                sandboxAuthorized ? (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs whitespace-nowrap">
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    <span>{questions.length} Soal Antrean QC</span>
                  </div>
                ) : null
              ) : !isPremiumUser ? (
                <div
                  className="relative group cursor-pointer"
                  onClick={() => {
                    if (dailyAnsweredCount >= DAILY_FREE_LIMIT) {
                      setIsDailyLimitModalOpen(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 py-1">
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
                    <div className="w-20 sm:w-28 h-2 rounded-full bg-surface-muted border border-border/80 overflow-hidden">
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
                  </div>

                  {/* Hover Info Tooltip (direct to PTN Premium Pass) */}
                  <div className="absolute right-0 top-full mt-2 z-50 w-80 p-4 rounded-2xl bg-surface border border-border shadow-xl text-left transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text">
                          Batas 10 Soal Harian
                        </h4>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          Kamu sudah mengerjakan{" "}
                          <strong>
                            {dailyAnsweredCount} dari {DAILY_FREE_LIMIT} soal
                          </strong>{" "}
                          hari ini. Kuota direset otomatis tiap tengah malam WIB.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 text-[11px] text-blue-950 space-y-1 mb-3">
                      <div className="font-bold flex items-center gap-1 text-blue-900">
                        <span>Mau latihan ribuan soal tanpa batas?</span>
                      </div>
                      <p className="text-blue-800/90 leading-relaxed">
                        Upgrade ke <strong>PTN Premium Pass</strong> untuk latihan
                        unlimited, bebas buka riwayat pembahasan, dan analisis skor IRT.
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

              {/* Subtest & Sandbox Batch Quick Filter */}
              {viewMode === "PRACTICE" && (!isSandboxMode || sandboxAuthorized) && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {isSandboxMode && (
                    <select
                      aria-label="Filter Batch QC"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="h-8 px-2.5 rounded-full text-xs font-semibold bg-surface-muted text-text border border-border cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ALL">Semua Batch</option>
                      <option value="__NONE__">Tanpa Batch</option>
                      {availableBatches.map((batchName) => (
                        <option key={batchName} value={batchName}>
                          Batch: {batchName}
                        </option>
                      ))}
                    </select>
                  )}
                  {SUBTESTS.map((sub) => {
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
              )}
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
          !isSandboxMode && viewMode === "HISTORY"
            ? "max-w-5xl"
            : showSolutionCard
            ? "max-w-[1580px]"
            : "max-w-4xl"
        }`}
      >
        {!isSandboxMode && viewMode === "HISTORY" ? (
          <PracticeHistoryTab
            isPremium={isPremiumUser}
            totalAnswered={totalAnswered}
            isAuthenticated={Boolean(authUid)}
            getAuthHeaders={getAuthHeaders}
          />
        ) : loading ? (
          <div className="space-y-4">
            <div className="h-14 rounded-2xl bg-surface border border-border animate-pulse" />
            <div className="h-96 rounded-2xl bg-surface border border-border animate-pulse p-8" />
          </div>
        ) : isSandboxMode && !sandboxAuthorized ? (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl p-8 max-w-xl mx-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto mb-4">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-extrabold text-text mb-2">
              Akses Sandbox QC Diperlukan
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed mb-6">
              Halaman pratinjau Antrean QC hanya dapat dibuka melalui tombol{" "}
              <strong className="text-text">Buka di Sandbox</strong> dari Control Center,
              atau dengan login menggunakan akun Sandbox JITU resmi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors"
              >
                Login Akun Sandbox
              </Link>
              <button
                type="button"
                onClick={() => void fetchQuestions()}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-3">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-text mb-1">
              {isSandboxMode
                ? selectedSubtest !== "ALL" || selectedDifficulty !== "ALL" || selectedBatch !== "ALL"
                  ? "Belum ada soal QC untuk filter ini"
                  : "Belum ada soal di Antrean QC"
                : "Belum ada soal untuk kategori ini"}
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
              {isSandboxMode
                ? selectedSubtest !== "ALL" || selectedBatch !== "ALL"
                  ? "Coba ganti filter subtes atau batch untuk melihat soal Antrean QC lainnya."
                  : "Saat ini tidak ada soal berstatus QC_SANDBOX yang menunggu tinjauan."
                : "Coba ganti filter subtes untuk menemukan soal latihan lainnya."}
            </p>
            {(!isSandboxMode || selectedSubtest !== "ALL" || selectedBatch !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubtest("ALL");
                  setSelectedBatch("ALL");
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {isSandboxMode ? "Reset Filter QC" : "Tampilkan Semua Subtes"}
              </button>
            )}
          </div>
        ) : activeQuestion ? (
          <div className="space-y-5">
            {/* ------------------------------------------------------------
                QUESTION NAVIGATOR STRIP
                Premium / Sandbox: Navigasi Soal (1, 2, 3...) + Prev / Next
                Free: No navigasi soal (cuma ada Prev & Next)
                ------------------------------------------------------------ */}
            <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {isPremiumUser || isSandboxMode ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-muted">
                    Latihan Soal UTBK
                  </span>
                </div>
              )}

              {/* Prev / Next Navigation Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border ml-auto">
                <span className="text-xs font-medium text-text-muted sm:hidden">
                  {activeQuestionIndex + 1} / {questions.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIndex === 0}
                    className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={activeQuestionIndex >= questions.length - 1}
                    className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-text hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
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
              className={`grid transition-all duration-300 ${
                showSolutionCard
                  ? "grid-cols-1 lg:grid-cols-12 gap-5 items-start"
                  : "grid-cols-1 gap-6 items-start"
              }`}
            >
              {/* ============================================================
                  KIRI: CARD SOAL (5/12 LEBAR SAAT SPLIT - COMPACT & SEIMBANG)
                  ============================================================ */}
              <div
                className={`bg-surface border border-border rounded-2xl shadow-xs ${
                  showSolutionCard
                    ? "lg:col-span-5 p-5 flex flex-col gap-4"
                    : "w-full p-6 sm:p-7 space-y-6"
                }`}
              >
                {/* 1-Second Loading Animation when switching questions */}
                {isLoadingQuestion ? (
                  <div className="flex-1 py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shadow-inner">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-bold text-text flex items-center justify-center gap-2">
                        <span>Memuat Soal Latihan...</span>
                      </div>
                      <p className="text-xs text-text-muted max-w-xs mx-auto">
                        Menyiapkan soal UTBK SNBT terbaik untuk latihanmu
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-[pulse_0.8s_ease-in-out_infinite] w-full" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Question Metadata Header */}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-2.5 border-b border-border ${
                        showSolutionCard ? "pb-3" : "pb-4"
                      }`}
                    >
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
                        {isSandboxMode && activeQuestion.batch && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Batch: {activeQuestion.batch}
                          </span>
                        )}
                      </div>

                      {isSandboxMode && (
                        <button
                          type="button"
                          disabled={Boolean(approvingId)}
                          onClick={() => void handleApproveSandboxQuestion(activeQuestion)}
                          title="Lolos QC dan langsung ubah status soal ke READY"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ml-auto"
                        >
                          {approvingId === activeQuestion.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ACC ke Ready</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div
                      className={
                        showSolutionCard
                          ? "flex-1 flex flex-col space-y-3.5"
                          : "space-y-6"
                      }
                    >
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
                    <div
                      className={`font-semibold text-text leading-relaxed ${
                        showSolutionCard
                          ? "space-y-2.5 text-sm sm:text-[15px]"
                          : "space-y-4 text-base sm:text-lg"
                      }`}
                    >
                      {activeQuestion.narration && (
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: renderMathContent(activeQuestion.narration, {
                              animatedHighlights: false,
                            }),
                          }}
                        />
                      )}
                      <div
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: renderMathContent(activeQuestion.content, {
                            animatedHighlights: false,
                          }),
                        }}
                      />
                      {activeQuestion.imageUrl && (
                        <div className="pt-1">
                          <img
                            src={activeQuestion.imageUrl}
                            alt="Ilustrasi soal"
                            className="max-h-96 w-auto rounded-xl border border-border object-contain bg-surface"
                          />
                        </div>
                      )}
                    </div>

                    {/* Options List A - E or Short Answer Input */}
                    {isActiveShortAnswer ? (
                      <div className={showSolutionCard ? "space-y-2 pt-1" : "space-y-3 pt-2"}>
                        <div className="text-xs font-semibold text-text-muted">
                          <span>TULISKAN JAWABAN SINGKAT:</span>
                        </div>
                        <input
                          type="text"
                          disabled={Boolean(currentAttempt)}
                          value={currentAttempt?.inputText ?? shortAnswerInput}
                          onChange={(e) => setShortAnswerInput(e.target.value)}
                          placeholder="Masukkan jawaban akhir (misal: 42)"
                          className="w-full sm:max-w-xs px-4 py-3 rounded-xl border border-border bg-surface text-sm font-mono font-bold text-text focus:outline-none focus:border-primary disabled:opacity-75"
                        />
                        {currentAttempt && currentAttempt.correctAnswerText && (
                          <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl inline-block">
                            Kunci Jawaban Benar: <span className="font-mono font-bold">{currentAttempt.correctAnswerText}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={showSolutionCard ? "space-y-2 pt-1" : "space-y-3 pt-2"}>
                        <div className="text-xs font-semibold text-text-muted">
                          <span>PILIH SALAH SATU JAWABAN:</span>
                        </div>

                        <div className={`grid grid-cols-1 ${showSolutionCard ? "gap-1.5" : "gap-2.5"}`}>
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
                                className={`w-full text-left rounded-xl border transition-all duration-150 flex items-center cursor-pointer disabled:cursor-default ${
                                  showSolutionCard
                                    ? "px-3.5 py-2.5 gap-3"
                                    : "p-3.5 sm:p-4 gap-3.5 items-start"
                                } ${optionBorderClass}`}
                              >
                                <span
                                  className={`flex shrink-0 items-center justify-center rounded-lg border font-bold transition-colors ${
                                    showSolutionCard ? "h-6 w-6 text-[11px]" : "h-7 w-7 text-xs"
                                  } ${badgeClass}`}
                                >
                                  {letter}
                                </span>

                                <div
                                  className={`flex-1 text-text ${
                                    showSolutionCard ? "text-sm" : "pt-0.5 text-sm sm:text-base"
                                  }`}
                                >
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
                    )}
                    </div>

                    {/* ------------------------------------------------------------
                        BOTTOM ACTION TOOLBAR OF CARD SOAL
                        ------------------------------------------------------------ */}
                    <div
                      className={`border-t border-border flex flex-wrap items-center justify-between gap-2.5 ${
                        showSolutionCard ? "pt-3 mt-auto" : "pt-4"
                      }`}
                    >
                      {!currentAttempt ? (
                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                          <button
                            type="button"
                            disabled={
                              submitting ||
                              (isActiveShortAnswer ? !shortAnswerInput.trim() : !selectedOptionId)
                            }
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
                            onClick={() => void handleRevealSolution()}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Buka Pembahasan Langsung
                          </button>

                          <button
                            type="button"
                            disabled={submitting || skipping || questions.length <= 1}
                            onClick={() => void handleSkipQuestion()}
                            title="Lewati sementara soal ini untuk dikerjakan nanti"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <SkipForward className="w-3.5 h-3.5" /> Lewati (Skip)
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

                          {isSandboxMode && (
                            <button
                              type="button"
                              onClick={() => handleResetSandboxAttempt(activeQuestion.id)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold transition-colors cursor-pointer ${
                                showSolutionCard ? "px-3.5 py-2" : "px-4 py-2.5"
                              }`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Uji Jawab Ulang
                            </button>
                          )}

                          {(!isSandboxMode || activeQuestionIndex < questions.length - 1) && (
                            <button
                              type="button"
                              onClick={handleNextQuestion}
                              className={`inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-blue-50/60 hover:bg-blue-50 text-primary text-xs font-bold transition-colors cursor-pointer ${
                                showSolutionCard ? "px-3.5 py-2" : "px-4 py-2.5"
                              }`}
                            >
                              <span>
                                {isSandboxMode
                                  ? "Soal QC Berikutnya"
                                  : questions.length > 1
                                  ? "Soal Berikutnya"
                                  : "Selesaikan Soal Ini"}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Score Status Pill */}
                      {currentAttempt && !currentAttempt.isRevealOnly && (
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-xl text-xs font-bold ${
                            showSolutionCard ? "px-3 py-1.5" : "px-3.5 py-1.5"
                          } ${
                            currentAttempt.isCorrect
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : "bg-rose-50 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {currentAttempt.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Jawaban Benar (+{activeQuestion.points} Poin)
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
                  KANAN: CARD PEMBAHASAN (7/12 LEBAR - QUESTION : SOLUTION = 5 : 7)
                  ============================================================ */}
              {isSolutionOpen && currentAttempt && currentAttempt.solution && (
                <div className="lg:col-span-7 lg:sticky lg:top-20 animate-in fade-in duration-200">
                  <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
                    <InteractiveSolutionDeck
                      solution={currentAttempt.solution}
                      onClose={() => setIsSolutionOpen(false)}
                      className="border-0 shadow-none rounded-none"
                    />

                    {/* Card Pembahasan Bottom Controls */}
                    <div className="px-5 py-3.5 sm:py-4 border-t border-border bg-surface flex items-center justify-between gap-3">
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
                          handleNextQuestion();
                          setIsSolutionOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>
                          {questions.length > 1 ? "Lanjut ke Soal Berikutnya" : "Selesaikan Soal Ini"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
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

export function LatihanModule(props: LatihanModuleProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-4">
            <div className="h-20 rounded-2xl bg-surface border border-border animate-pulse" />
            <div className="h-96 rounded-2xl bg-surface border border-border animate-pulse" />
          </div>
        </div>
      }
    >
      <LatihanModuleContent {...props} />
    </Suspense>
  );
}

export default LatihanModule;
