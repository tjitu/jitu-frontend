"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getSubtestInfo } from "@/modules/TryoutDetailModule/components/subtest-meta";
import { BACKEND_URL } from "@/lib/api";
import { getActiveTryoutSandboxToken, getTryoutDetail } from "@/lib/api/tryout";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
  Grid,
  WifiOff,
  X,
} from "lucide-react";
import { PracticeQuestionText } from "@/components/practice-question-text";
import { TryoutSolution } from "@/components/tryout-solution";
import { renderMathContent } from "@/lib/render-math-content";
import type { QuestionSolutionData } from "@/lib/practice-store";
import { splitQuestionGuidance } from "@/lib/question-guidance";
import { AnswerFormatGuide } from "@/components/answer-format-guide";
import { pendingBreakOrder } from "./break/pending-break";
import { FontSizeControl } from "./components/FontSizeControl";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UiOption = { id: string; text: string };
type UiQuestion = {
  id: string;
  questionText: string;
  narration?: string;
  imageUrl?: string;
  structuredSolution?: QuestionSolutionData | null;
  options: UiOption[];
  correctAnswerId?: string;
  correctAnswerText?: string;
  solution?: string;
  type?: string;
  userAnswer?: string;
};

type UiSubtestInfo = {
  id: string;
  name: string;
  order: number;
  durationMinutes: number;
  questionCount: number;
};

type UiExamData = {
  attemptId: string;
  tryoutTitle: string;
  subtestName: string;
  durationMinutes: number;
  questions: UiQuestion[];
  allSubtests: UiSubtestInfo[];
};

type AnswersMap = Record<string, string>;
type ReviewFilter = "ALL" | "WRONG" | "EMPTY" | "RAGU";

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

const SUBTEST_FLOW = ["PU", "PPU", "PBM", "PK", "LBI", "LBE", "PM"] as const;

const getSubtestIndex = (subtestParam: string) => {
  const n = Number(subtestParam);
  if (!Number.isNaN(n) && n >= 1) return n - 1;

  const upper = String(subtestParam).toUpperCase();
  const idx = (SUBTEST_FLOW as readonly string[]).indexOf(upper);
  return idx >= 0 ? idx : 0;
};

export default function TryoutExamModule() {
  const router = useRouter();
  const params = useParams<{ id: string; subtestId: string }>();
  const searchParams = useSearchParams();

  const tryoutId = params?.id;
  const subtestId = params?.subtestId;

  const isReviewMode = searchParams.get("review") === "true";
  const attemptIdFromQuery = searchParams.get("attemptId");

  const { data: session } = useSession();

  const [attemptId, setAttemptId] = useState<string | null>(
    attemptIdFromQuery ? String(attemptIdFromQuery) : null,
  );

  const [examData, setExamData] = useState<UiExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setStartingAttempt] = useState(false);
  const [error, setError] = useState("");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncedAnswers, setLastSyncedAnswers] = useState<
    Record<string, string>
  >({});
  const [isSubmittingFinish, setIsSubmittingFinish] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("ALL");
  const [isOnline, setIsOnline] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const endTimeMsRef = useRef<number | null>(null);
  const finishingRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);

  const subtestIndex = useMemo(
    () => getSubtestIndex(String(subtestId)),
    [subtestId],
  );
  const currentSubtestOrder = subtestIndex + 1;

  const activeSubtests = useMemo(() => {
    const all = examData?.allSubtests ?? [];
    if (all.length === 0) return [];
    const populated = all.filter((s) => Number(s.questionCount ?? 0) > 0);
    return populated.length > 0 ? populated : all;
  }, [examData?.allSubtests]);

  const totalSubtestsCount = useMemo(() => {
    if (activeSubtests.length > 0) return activeSubtests.length;
    return SUBTEST_FLOW.length;
  }, [activeSubtests.length]);

  const nextSubtestObj = useMemo(() => {
    if (activeSubtests.length > 0) {
      return activeSubtests.find((s) => Number(s.order) > currentSubtestOrder) ?? null;
    }
    if (currentSubtestOrder < SUBTEST_FLOW.length) {
      return {
        id: String(currentSubtestOrder + 1),
        name: SUBTEST_FLOW[currentSubtestOrder] || `Subtes ${currentSubtestOrder + 1}`,
        order: currentSubtestOrder + 1,
        durationMinutes: 0,
        questionCount: 0,
      };
    }
    return null;
  }, [activeSubtests, currentSubtestOrder]);

  const hasNextSubtest = Boolean(nextSubtestObj);
  const nextSubtestParam = String(nextSubtestObj?.order ?? subtestIndex + 2);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const startAttempt = async (): Promise<string> => {
    if (!tryoutId) throw new Error("Tryout ID tidak ditemukan.");
    const userId = session?.user?.id;
    if (!userId) throw new Error("Sesi kamu habis. Masuk lagi untuk lanjut.");

    const sandboxToken = getActiveTryoutSandboxToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sandboxToken) headers["x-sandbox-token"] = sandboxToken;
    const res = await fetch(
      `${BACKEND_URL}/exam/${encodeURIComponent(tryoutId)}/start`,
      {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ userId }),
      },
    );

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Gagal memulai attempt.");
    }

    const data = await res.json();
    const id = data?.attemptId || data?.id;
    if (!id) throw new Error("Attempt ID tidak ditemukan.");
    return String(id);
  };

  const ensureAttempt = async (): Promise<string> => {
    if (attemptId) return attemptId;
    setStartingAttempt(true);
    try {
      const id = await startAttempt();
      setAttemptId(id);
      return id;
    } finally {
      setStartingAttempt(false);
    }
  };

  const mapQuestionsPayloadToUi = (
    raw: any,
    effectiveAttemptId: string,
  ): UiExamData => {
    const rawQuestions = Array.isArray(raw?.questions) ? raw.questions : [];

    const questions: UiQuestion[] = rawQuestions.map((q: any) => {
      const options = (q?.options || []).map((o: any) => ({
        id: s(o?.id),
        text: s(o?.text),
      }));

      const ua = q?.userAnswer;
      const valUserAnswer = ua?.questionItemId || ua?.inputText || "";

      return {
        id: s(q?.id),
        questionText: s(q?.questionText),
        narration: s(q?.narration),
        imageUrl: s(q?.imageUrl),
        structuredSolution: q?.structuredSolution,
        options,
        type: s(q?.type),
        solution: s(q?.solution),
        correctAnswerId: s(q?.correctAnswerId),
        correctAnswerText: s(q?.correctAnswerText || q?.correctAnswer || q?.correct_answer_short_answer),
        userAnswer: valUserAnswer,
      };
    });

    return {
      attemptId: effectiveAttemptId,
      tryoutTitle: s(raw?.tryoutTitle),
      subtestName: s(raw?.subtestName),
      durationMinutes: Number(raw?.durationMinutes || 0),
      questions,
      allSubtests: Array.isArray(raw?.allSubtests) ? raw.allSubtests : [],
    };
  };

  useEffect(() => {
    const load = async () => {
      if (!tryoutId || !subtestId) return;
      if (!isReviewMode && !attemptId && !attemptIdFromQuery) {
        router.replace(`/tryout/${encodeURIComponent(tryoutId)}`);
        return;
      }
      if (!isReviewMode && attemptId) {
        try {
          const pendingOrder = pendingBreakOrder(localStorage, attemptId, currentSubtestOrder);
          if (pendingOrder) {
            router.replace(`/tryout/${encodeURIComponent(tryoutId)}/break/${pendingOrder}?attemptId=${encodeURIComponent(attemptId)}`);
            return;
          }
        } catch {
          // Continue normally when browser storage is unavailable.
        }
      }

      try {
        setLoading(true);
        setError("");
        setTimeRemainingSec(null);
        endTimeMsRef.current = null;
        finishingRef.current = false;

        let effectiveAttemptId = attemptId || "";

        if (!isReviewMode) {
          effectiveAttemptId = await ensureAttempt();
        } else {
          effectiveAttemptId =
            effectiveAttemptId || (attemptIdFromQuery as string) || "";
        }

        const currentUserId = session?.user?.id || "";
        const sandboxToken = getActiveTryoutSandboxToken();
        const headers: Record<string, string> = {};
        if (sandboxToken) headers["x-sandbox-token"] = sandboxToken;

        const url = `${BACKEND_URL}/tryout/${encodeURIComponent(
          tryoutId,
        )}/exam/${encodeURIComponent(
          String(subtestId),
        )}?userId=${encodeURIComponent(
          currentUserId,
        )}&attemptId=${encodeURIComponent(effectiveAttemptId)}`;

        const res = await fetch(url, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 403 && !isReviewMode) {
            const detail = await getTryoutDetail(tryoutId);
            if (detail.isWaitingTransition && detail.resumeUrl) {
              router.replace(detail.resumeUrl);
              return;
            }
            if (detail.latestAttemptStatus === "FINISHED") {
              router.replace(`/tryout/${tryoutId}`);
              return;
            }
          }
          const payload = await res.json().catch(() => null);
          const message = payload?.message;
          throw new Error(
            typeof message === "string"
              ? message
              : "Data gagal dimuat. Muat ulang halaman.",
          );
        }

        const raw = await res.json();
        if (!isReviewMode && raw?.subtestExpired) {
          if (raw?.nextSubtestOrder) {
            router.replace(
              `/tryout/${tryoutId}/break/${raw.nextSubtestOrder}?attemptId=${encodeURIComponent(
                effectiveAttemptId,
              )}&expired=true`,
            );
          } else {
            await fetch(
              `${BACKEND_URL}/exam/${encodeURIComponent(effectiveAttemptId)}/finish`,
              { method: "POST", credentials: "include" },
            ).catch(() => undefined);
            router.replace(`/tryout/${tryoutId}`);
          }
          return;
        }

        const mapped = mapQuestionsPayloadToUi(raw, effectiveAttemptId);

        setExamData(mapped);
        setCurrentQuestionIndex(0);

        if (typeof window !== "undefined" && mapped.allSubtests.length > 0) {
          try {
            window.sessionStorage.setItem(
              `tryout_subtests_${tryoutId}`,
              JSON.stringify(mapped.allSubtests),
            );
          } catch {
            // ignore storage errors
          }
        }

        const initialAnswers: AnswersMap = {};
        mapped.questions.forEach((q) => {
          if (q.userAnswer) {
            initialAnswers[q.id] = q.userAnswer;
          }
        });
        setAnswers(initialAnswers);

        setLastSyncedAnswers(initialAnswers);
        setMarkedQuestions([]);
        setReviewFilter("ALL");

        if (!isReviewMode) {
          let remainingMs = (mapped.durationMinutes || 0) * 60_000;
          if (raw?.endTime && raw?.serverTime) {
            const diff =
              new Date(raw.endTime).getTime() -
              new Date(raw.serverTime).getTime();
            if (Number.isFinite(diff)) remainingMs = Math.max(0, diff);
          } else if (Number.isFinite(Number(raw?.remainingSeconds))) {
            remainingMs = Math.max(0, Number(raw.remainingSeconds) * 1000);
          }
          endTimeMsRef.current = Date.now() + remainingMs;
          setTimeRemainingSec(Math.ceil(remainingMs / 1000));
        } else {
          setTimeRemainingSec(null);
        }
      } catch (e: any) {
        setError(e?.message || "Gagal memuat lembar ujian.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    tryoutId,
    subtestId,
    isReviewMode,
    session?.user?.id,
    attemptId,
    attemptIdFromQuery,
    currentSubtestOrder,
    router,
  ]);

  const submitAnswerWithAttempt = async (
    attemptIdParam: string,
    questionId: string,
    value: string,
    isText: boolean,
  ) => {
    const payload: any = { questionId };
    if (isText) {
      payload.inputText = value;
      payload.answerId = null;
    } else {
      payload.answerId = value;
      payload.inputText = null;
    }

    const res = await fetch(
      `${BACKEND_URL}/exam/${encodeURIComponent(attemptIdParam)}/answer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) throw new Error("Gagal menyimpan jawaban");
  };

  const saveCurrentQuestionIfDirty = async () => {
    if (isReviewMode) return;
    if (!examData || !examData.questions[currentQuestionIndex]) return;

    const currentQ = examData.questions[currentQuestionIndex];
    const qid = currentQ.id;
    const chosen = answers[qid];

    if (!chosen) return;
    if (lastSyncedAnswers[qid] === chosen) return;

    setIsSaving(true);
    try {
      const effectiveAttemptId = await ensureAttempt();
      const isTextAnswer = currentQ.options.length === 0;
      await submitAnswerWithAttempt(
        effectiveAttemptId,
        qid,
        chosen,
        isTextAnswer,
      );
      setLastSyncedAnswers((prev) => ({ ...prev, [qid]: chosen }));
    } catch (e) {
      console.error("Auto-save failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const finishCurrentSubtest = async (isTimeout = false) => {
    if (isReviewMode) return;
    if (!examData || !attemptId) return;
    if (finishingRef.current) return;

    finishingRef.current = true;
    setIsSubmittingFinish(true);
    setShowFinishConfirm(false);

    if (isTimeout) {
      toast.error("Waktu subtes habis. Jawaban tersimpan otomatis.");
    }

    try {
      await saveCurrentQuestionIfDirty();

      if (hasNextSubtest && nextSubtestObj) {
        const query = new URLSearchParams({
          attemptId,
          prevSubtestName: examData.subtestName,
          nextSubtestName: nextSubtestObj.name || "",
          nextSubtestDuration: String(nextSubtestObj.durationMinutes || ""),
          nextSubtestQuestions: String(nextSubtestObj.questionCount || ""),
        });

        router.push(
          `/tryout/${tryoutId}/break/${nextSubtestParam}?${query.toString()}`,
        );
      } else {
        await fetch(
          `${BACKEND_URL}/exam/${encodeURIComponent(attemptId)}/finish`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        router.replace(`/tryout/${tryoutId}`);
      }
    } catch (e: any) {
      finishingRef.current = false;
      setError(e?.message || "Gagal mengumpulkan subtes.");
      setIsSubmittingFinish(false);
    }
  };

  // Sync authoritative timer deadline from authenticated endpoint (and on window resume).
  useEffect(() => {
    if (isReviewMode || !attemptId || !examData || loading) return;

    let cancelled = false;
    const syncTimerFromServer = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/exam/${encodeURIComponent(attemptId)}/timer/${currentSubtestOrder}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!res.ok || cancelled) return;
        const payload = await res.json();
        const status = payload?.status;

        if (status === "FINISHED") {
          router.replace(`/tryout/${tryoutId}`);
          return;
        }

        let remainingMs = Number(payload?.remainingSeconds) * 1000;
        if (payload?.endTime && payload?.serverTime) {
          const diff =
            new Date(payload.endTime).getTime() -
            new Date(payload.serverTime).getTime();
          if (Number.isFinite(diff)) remainingMs = Math.max(0, diff);
        }

        if (Number.isFinite(remainingMs)) {
          endTimeMsRef.current = Date.now() + Math.max(0, remainingMs);
          setTimeRemainingSec(Math.ceil(Math.max(0, remainingMs) / 1000));
        }

        if (status === "SUBTEST_FINISHED" && !finishingRef.current) {
          void finishCurrentSubtest(true);
        }
      } catch {
        // Keep local countdown deadline if transient network error occurs.
      }
    };

    const onVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        void syncTimerFromServer();
      }
    };

    void syncTimerFromServer();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }
    window.addEventListener("focus", onVisibility);

    return () => {
      cancelled = true;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      window.removeEventListener("focus", onVisibility);
    };
  }, [attemptId, isReviewMode, examData, loading, router, tryoutId, currentSubtestOrder]);

  // Live 500ms tick anchored to server-adjusted target timestamp so tab throttling never drifts.
  useEffect(() => {
    if (isReviewMode || !examData || loading) return;

    const tick = () => {
      if (endTimeMsRef.current === null) return;
      const remainingSec = Math.max(
        0,
        Math.ceil((endTimeMsRef.current - Date.now()) / 1000),
      );
      setTimeRemainingSec(remainingSec);
    };

    tick();
    const intervalId = window.setInterval(tick, 500);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isReviewMode, examData, loading]);

  useEffect(() => {
    if (isReviewMode || !examData || loading) return;
    if (
      timeRemainingSec !== null &&
      timeRemainingSec <= 0 &&
      !isSubmittingFinish &&
      !finishingRef.current
    ) {
      void finishCurrentSubtest(true);
    }
  }, [timeRemainingSec, isReviewMode, examData, loading, isSubmittingFinish]);

  const persistAnswerImmediate = async (
    qid: string,
    value: string,
    isText: boolean,
  ) => {
    if (isReviewMode || !value) return;
    setIsSaving(true);
    try {
      const effectiveAttemptId = await ensureAttempt();
      await submitAnswerWithAttempt(effectiveAttemptId, qid, value, isText);
      setLastSyncedAnswers((prev) => ({ ...prev, [qid]: value }));
    } catch (e) {
      console.error("Auto-save failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  const handleAnswerSelect = (value: string) => {
    if (isReviewMode) return;
    const currentQ = examData?.questions[currentQuestionIndex];
    if (!currentQ) return;
    const qid = currentQ.id;
    setAnswers((prev) => ({ ...prev, [qid]: value }));

    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    const isTextAnswer = currentQ.options.length === 0;
    if (!isTextAnswer) {
      void persistAnswerImmediate(qid, value, false);
    } else if (value.trim()) {
      autosaveTimerRef.current = window.setTimeout(() => {
        void persistAnswerImmediate(qid, value, true);
      }, 700);
    }
  };

  const handleNext = async () => {
    if (!examData) return;

    if (isReviewMode) {
      const isLastQuestion =
        currentQuestionIndex === examData.questions.length - 1;
      if (isLastQuestion) {
        if (hasNextSubtest) {
          router.push(
            `/tryout/${tryoutId}/exam/${nextSubtestParam}?attemptId=${attemptId}&review=true`,
          );
        } else {
          router.push(`/tryout/${tryoutId}`);
        }
      } else {
        setCurrentQuestionIndex((i) => i + 1);
      }
      return;
    }

    try {
      await saveCurrentQuestionIfDirty();
      const isLastQuestion =
        currentQuestionIndex === examData.questions.length - 1;
      if (isLastQuestion) {
        setShowFinishConfirm(true);
      } else {
        setCurrentQuestionIndex((i) => i + 1);
      }
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const handlePrevious = async () => {
    if (!isReviewMode) await saveCurrentQuestionIfDirty();
    setCurrentQuestionIndex((i) => Math.max(0, i - 1));
  };

  const handleBackNavigation = async () => {
    if (!isReviewMode) await saveCurrentQuestionIfDirty();
    router.replace(`/tryout/${tryoutId}`);
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--:--";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0",
    )}:${String(sec).padStart(2, "0")}`;
  };

  const currentQuestion = examData?.questions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg flex-col gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="text-label text-text-muted">
          Memuat soal...
        </div>
      </div>
    );
  }

  if (error || !examData || !currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-4 p-6">
        <div className="bg-surface rounded-lg border border-border p-8 max-w-md w-full text-center space-y-4">
          <h3 className="text-h3 text-text">
            Data gagal dimuat
          </h3>
          <p className="text-sm text-text-body">
            {error || "Soal tidak tersedia. Muat ulang halaman."}
          </p>
          <Button
            variant="outline"
            onClick={() => router.replace(`/tryout/${tryoutId}`)}
          >
            Kembali ke tryout
          </Button>
        </div>
      </div>
    );
  }

  const { question, guidance } = splitQuestionGuidance(currentQuestion.questionText);
  const totalQuestions = examData.questions.length;
  const subtest = getSubtestInfo(examData.subtestName, subtestIndex);
  const SubtestIcon = subtest.IconComponent;
  const answeredCount = examData.questions.filter((q) => {
    const val = answers[q.id];
    return val !== undefined && val !== "";
  }).length;
  const unansweredCount = totalQuestions - answeredCount;
  const raguCount = markedQuestions.length;
  const isCurrentRagu = markedQuestions.includes(currentQuestion.id);
  const isUnderFiveMin = (timeRemainingSec ?? 999) < 300;

  const isQuestionCorrect = (q: UiQuestion) => {
    const ua = answers[q.id];
    if (!ua) return false;
    if (q.correctAnswerId) return ua === q.correctAnswerId;
    if (q.correctAnswerText) {
      return (
        ua.toLowerCase().trim() === q.correctAnswerText.toLowerCase().trim()
      );
    }
    return false;
  };

  const matchesReviewFilter = (q: UiQuestion) => {
    if (!isReviewMode || reviewFilter === "ALL") return true;
    const ua = answers[q.id];
    const answered = ua !== undefined && ua !== "";
    if (reviewFilter === "EMPTY") return !answered;
    if (reviewFilter === "WRONG") return answered && !isQuestionCorrect(q);
    if (reviewFilter === "RAGU") return markedQuestions.includes(q.id);
    return true;
  };

  const renderNumberGrid = (closeOnSelect = false) => (
    <div className="space-y-4">
      {isReviewMode && (
        <div className="grid grid-cols-4 gap-1 rounded-md bg-surface-muted p-1 border border-border">
          {(
            [
              { id: "ALL", label: "Semua" },
              { id: "WRONG", label: "Salah" },
              { id: "EMPTY", label: "Kosong" },
              { id: "RAGU", label: "Ragu" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setReviewFilter(f.id)}
              className={`py-1 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer ${
                reviewFilter === f.id
                  ? "bg-surface text-text border border-border"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {examData.questions.map((q, index) => {
          const isCurrent = currentQuestionIndex === index;
          const userAnswer = answers[q.id];
          const isAnswered = userAnswer !== undefined && userAnswer !== "";
          const isMarked = markedQuestions.includes(q.id);
          const visibleInFilter = matchesReviewFilter(q);

          let cellClass =
            "bg-surface border-border text-text-body hover:border-ink-300";

          if (isReviewMode) {
            if (!isAnswered) {
              cellClass = "bg-surface border-border text-text-muted";
            } else if (isQuestionCorrect(q)) {
              cellClass = "bg-success border-success text-white font-semibold";
            } else {
              cellClass = "bg-danger border-danger text-white font-semibold";
            }
          } else {
            if (isMarked) {
              cellClass = "bg-yellow-300 border-yellow-400 text-ink-900 font-semibold";
            } else if (isAnswered) {
              cellClass = "bg-primary border-primary text-white font-semibold";
            }
          }

          return (
            <button
              key={q.id}
              type="button"
              disabled={isSaving || isSubmittingFinish}
              onClick={async () => {
                if (!isReviewMode) await saveCurrentQuestionIfDirty();
                setCurrentQuestionIndex(index);
                if (closeOnSelect) setMobileSheetOpen(false);
              }}
              className={`w-[42px] h-[42px] rounded-md border font-mono text-sm font-medium tabular-nums flex items-center justify-center transition-colors cursor-pointer ${cellClass} ${
                isCurrent ? "ring-2 ring-primary ring-offset-1" : ""
              } ${!visibleInFilter ? "opacity-25" : ""}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend at bottom of panel */}
      {!isReviewMode ? (
        <div className="pt-3 border-t border-ink-100 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-primary shrink-0" />
            <span className="whitespace-nowrap">Dijawab ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-yellow-300 shrink-0" />
            <span className="whitespace-nowrap">Ragu ({raguCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-surface border border-border shrink-0" />
            <span className="whitespace-nowrap">Kosong ({unansweredCount})</span>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-ink-100 grid grid-cols-3 gap-2 text-[11px] text-text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-success shrink-0" />
            <span>Benar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-danger shrink-0" />
            <span>Salah</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-surface border border-border shrink-0" />
            <span>Kosong</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text-body flex flex-col">
      {/* Sticky Top Bar (64px, white, 1px bottom border) */}
      <header className="sticky top-0 z-10 min-h-16 bg-surface text-text border-b border-border px-3 sm:px-6">
        <div className="max-w-[1200px] mx-auto min-h-16 flex flex-wrap items-center justify-between gap-2 py-2 sm:flex-nowrap">
          {/* Left: Subtest name + Font size toggle */}
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            {isReviewMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackNavigation}
                className="shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <SubtestIcon className="h-5 w-5 shrink-0 text-primary" size={20} />
              <span className="font-semibold text-sm sm:text-base text-text">
                {subtest.name} ({subtest.code})
              </span>
              <span className="hidden md:inline font-mono text-xs text-text-muted ml-2 tabular-nums">
                · Subtes {(activeSubtests.findIndex((s) => Number(s.order) === currentSubtestOrder) + 1) || (subtestIndex + 1)}/{totalSubtestsCount}
              </span>
            </div>
            <div className="hidden sm:block ml-2">
              <FontSizeControl
                fontSize={fontSize}
                onIncrease={() => setFontSize((p) => Math.min(26, p + 2))}
                onDecrease={() => setFontSize((p) => Math.max(13, p - 2))}
              />
            </div>
          </div>

          {/* Center: Countdown timer in JetBrains Mono */}
          {!isReviewMode ? (
            <div
              className={`font-mono text-lg sm:text-[22px] font-bold tracking-wider leading-none tabular-nums px-3 py-1.5 rounded-md ${
                isUnderFiveMin
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-surface-muted text-text"
              }`}
            >
              {formatTime(timeRemainingSec)}
            </div>
          ) : (
            <div className="h-6 px-2.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold inline-flex items-center">
              Mode pembahasan
            </div>
          )}

          {/* Right: "Kumpulkan" button or Review subtest switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {!isReviewMode ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isSaving || isSubmittingFinish}
                onClick={() => setShowFinishConfirm(true)}
              >
                Kumpulkan
              </Button>
            ) : (
              <div className="w-40 sm:w-52">
                <Select
                  onValueChange={(value) => {
                    router.push(
                      `/tryout/${tryoutId}/exam/${value}?attemptId=${attemptId}&review=true`,
                    );
                  }}
                  value={String(subtestIndex + 1)}
                >
                  <SelectTrigger size="sm" className="w-full text-xs">
                    <SelectValue placeholder="Pilih subtes" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {(examData?.allSubtests?.length
                      ? examData.allSubtests
                      : SUBTEST_FLOW.map((sName, i) => ({
                          name: sName,
                          order: i + 1,
                        }))
                    ).map((sub: any, idx) => (
                      <SelectItem
                        key={sub.id || idx}
                        value={String(idx + 1)}
                      >
                        0{idx + 1} · {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-700 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            Koneksi putus. Jawaban tetap tersimpan di perangkat ini dan dikirim
            otomatis saat online.
          </span>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-6 pb-24">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Column: Question + Options */}
          <div className="w-full lg:flex-1 lg:max-w-[720px] bg-surface rounded-lg border border-border p-5 sm:p-8">
            {/* Question Number Badge + Mobile Font Size Control */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <span className="h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 font-mono text-xs font-semibold tabular-nums inline-flex items-center">
                  Soal {currentQuestionIndex + 1} / {totalQuestions}
                </span>
                {isCurrentRagu && !isReviewMode && (
                  <span className="h-6 px-2.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold inline-flex items-center">
                    Ragu-ragu
                  </span>
                )}
              </div>
              <div className="sm:hidden">
                <FontSizeControl
                  fontSize={fontSize}
                  onIncrease={() => setFontSize((p) => Math.min(26, p + 2))}
                  onDecrease={() => setFontSize((p) => Math.max(13, p - 2))}
                />
              </div>
            </div>

            <div>
              {/* Question Passage / Text Box */}
              <div className="mb-6 space-y-4 text-base sm:text-lg">
                <div
                  className="text-text"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <PracticeQuestionText narration={currentQuestion.narration} question={question} />
                  {currentQuestion.imageUrl && <img src={currentQuestion.imageUrl} alt="Ilustrasi soal" className="mt-4 max-h-96 w-auto rounded-xl border border-border object-contain bg-surface" />}
                </div>
              </div>

              {guidance && currentQuestion.options.length > 0 && currentQuestion.type !== "ISIAN_SINGKAT" && (
                <AnswerFormatGuide text={guidance} />
              )}

              {/* Options A–E (Pilihan Ganda) */}
              {currentQuestion.type !== "ISIAN_SINGKAT" && currentQuestion.options.length > 0 && (
                <div className="space-y-2.5 mb-6">
                  <div className="text-xs font-semibold text-text-muted">PILIH SALAH SATU JAWABAN:</div>
                  {currentQuestion.options.map((opt, idx) => {
                    const userAnswerId = answers[currentQuestion.id];
                    const isSelected = userAnswerId === opt.id;
                    const isCorrectKey =
                      currentQuestion.correctAnswerId === opt.id;
                    const letter = String.fromCharCode(65 + idx);

                    let rowClass =
                      "border-border bg-surface hover:border-blue-400 hover:bg-blue-50/30";
                    let badgeClass =
                      "bg-surface-muted text-text border-border";

                    if (isReviewMode) {
                      if (isCorrectKey) {
                        rowClass =
                          "border-emerald-500 bg-emerald-50/90 ring-1 ring-emerald-500";
                        badgeClass =
                          "bg-emerald-600 text-white border-emerald-600";
                      } else if (isSelected && !isCorrectKey) {
                        rowClass =
                          "border-rose-400 bg-rose-50/90 ring-1 ring-rose-400";
                        badgeClass =
                          "bg-rose-600 text-white border-rose-600";
                      } else {
                        rowClass =
                          "border-border/60 bg-surface/50 opacity-60";
                      }
                    } else if (isSelected) {
                      rowClass =
                        "border-primary bg-blue-50/70 ring-2 ring-primary/20";
                      badgeClass = "bg-primary text-on-primary border-primary font-bold";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAnswerSelect(opt.id)}
                        disabled={isReviewMode}
                        className={`w-full text-left rounded-xl border transition-all duration-150 flex items-start cursor-pointer disabled:cursor-default p-3.5 sm:p-4 gap-3.5 ${rowClass}`}
                      >
                        <span
                          className={`flex shrink-0 items-center justify-center rounded-lg border font-bold transition-colors h-7 w-7 text-xs ${badgeClass}`}
                        >
                          {letter}
                        </span>
                        <div
                          className="flex-1 text-text pt-0.5 text-sm sm:text-base"
                          style={{ fontSize: `${fontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: renderMathContent(opt.text, { animatedHighlights: false }) }}
                        />
                        {isReviewMode && isCorrectKey && (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                        )}
                        {isReviewMode && isSelected && !isCorrectKey && (
                          <XCircle className="w-5 h-5 text-danger shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short-answer / Fill-in Question (Isian Singkat) */}
              {(currentQuestion.type === "ISIAN_SINGKAT" || currentQuestion.options.length === 0) && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <label htmlFor="exam-short-answer" className="block text-sm font-semibold text-text">
                      Jawaban Isian Singkat
                    </label>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 text-primary border border-blue-500/20">
                      Standar Resmi BPPP SNBT
                    </span>
                  </div>

                  {(!isReviewMode || guidance) && (
                    <AnswerFormatGuide id="exam-format-guide" text={guidance || "Masukkan bilangan bulat dari 0 sampai 9999 tanpa satuan atau tanda baca."} />
                  )}
                  <input
                    id="exam-short-answer"
                    aria-describedby={!isReviewMode || guidance ? "exam-format-guide" : undefined}
                    className={`w-full h-12 px-4 rounded-md bg-surface border font-mono text-lg outline-none transition-colors ${
                      isReviewMode
                        ? isQuestionCorrect(currentQuestion)
                          ? "border-success bg-success-soft text-success-text font-bold"
                          : "border-danger bg-danger-soft text-danger-text font-bold"
                        : "border-border focus:border-primary focus:ring-3 focus:ring-blue-200"
                    }`}
                    placeholder="Masukkan jawaban"
                    style={{ fontSize: `${fontSize + 2}px` }}
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    disabled={isReviewMode}
                  />

                  {isReviewMode && currentQuestion.correctAnswerText && (
                    <div className="p-3 rounded-md bg-success-soft border border-success/30 font-mono text-xs text-success-text flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                      <span>
                        Kunci jawaban resmi: <strong>{currentQuestion.correctAnswerText}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Solution Box in Review Mode */}
              {isReviewMode && (currentQuestion.structuredSolution || currentQuestion.solution) && (
                <div className="mt-6 p-5 sm:p-6 rounded-lg bg-surface-muted border border-border">
                  <div className="flex items-center gap-2 text-label text-primary pb-3 mb-3 border-b border-border">
                    <BookOpen className="w-4 h-4" />
                    <span>Pembahasan langkah demi langkah</span>
                  </div>
                  <div
                    className="prose prose-sm learning-content max-w-[65ch]"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <TryoutSolution solution={currentQuestion.structuredSolution} explanation={currentQuestion.solution} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 260px fixed Question Navigator on desktop */}
          <aside className="hidden lg:block w-[260px] shrink-0 bg-surface rounded-lg border border-border p-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-ink-100">
              <span className="text-label text-text">
                Nomor soal
              </span>
              <span className="font-mono text-xs text-text-muted tabular-nums">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            {renderNumberGrid(false)}
          </aside>
        </div>
      </div>

      {/* Mobile Number Grid Bottom Sheet */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-30 lg:hidden bg-[#121F47]/50 flex flex-col justify-end">
          <div className="bg-surface rounded-t-xl border-t border-border shadow-modal p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink-100">
              <span className="text-label text-text">
                Daftar nomor soal ({answeredCount}/{totalQuestions})
              </span>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderNumberGrid(true)}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 h-16 bg-surface border-t border-border px-3 sm:px-6">
        <div className="max-w-[1040px] mx-auto h-full flex items-center justify-between gap-2">
          {/* Left: "← Sebelumnya" */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={
              currentQuestionIndex === 0 || isSaving || isSubmittingFinish
            }
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          {/* Center: "Tandai ragu" toggle + Save status + Mobile "Nomor" trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isReviewMode && (
              <button
                type="button"
                disabled={isSaving || isSubmittingFinish}
                onClick={() => {
                  const qid = currentQuestion.id;
                  setMarkedQuestions((prev) =>
                    prev.includes(qid)
                      ? prev.filter((x) => x !== qid)
                      : [...prev, qid],
                  );
                }}
                className={`h-9 px-3 rounded-md border font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isCurrentRagu
                    ? "bg-yellow-300 border-yellow-400 text-ink-900"
                    : "bg-surface border-border text-text-body hover:bg-surface-muted"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Tandai ragu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className="lg:hidden h-9 px-3 rounded-md border border-border bg-surface-muted text-text text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-ink-100 transition-colors"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Nomor</span>
            </button>

            {!isReviewMode && (
              <span className="hidden md:inline-block text-xs text-text-muted">
                {isSaving ? "Menyimpan…" : "Tersimpan"}
              </span>
            )}
          </div>

          {/* Right: "Berikutnya →" */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            disabled={isSaving || isSubmittingFinish}
          >
            <span>
              {currentQuestionIndex === totalQuestions - 1
                ? isReviewMode
                  ? hasNextSubtest
                    ? "Subtes berikutnya"
                    : "Selesai bahas"
                  : "Kumpulkan"
                : "Berikutnya"}
            </span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </footer>

      {/* Confirmation Modal on "Kumpulkan" */}
      <Dialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>
              Kumpulkan sekarang?
            </DialogTitle>
            <DialogDescription>
              {answeredCount} dijawab, {raguCount} ragu, {unansweredCount} kosong.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 bg-surface-muted rounded-md border border-border p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-label text-text-muted">
                Dijawab
              </div>
              <div className="font-mono text-xl font-bold text-text tabular-nums">
                {answeredCount}
              </div>
            </div>
            <div>
              <div className="text-label text-text-muted">Kosong</div>
              <div className="font-mono text-xl font-bold text-text tabular-nums">
                {unansweredCount}
              </div>
            </div>
            <div>
              <div className="text-label text-text-muted">Ragu</div>
              <div className="font-mono text-xl font-bold text-yellow-700 tabular-nums">
                {raguCount}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFinishConfirm(false)}
              disabled={isSubmittingFinish}
            >
              Lanjut ngerjain
            </Button>
            <Button
              variant="primary"
              onClick={() => finishCurrentSubtest(false)}
              disabled={isSubmittingFinish}
            >
              {isSubmittingFinish ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengumpulkan...
                </>
              ) : (
                "Kumpulkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
