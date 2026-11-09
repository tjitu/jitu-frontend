"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/lib/api";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FontSizeControl } from "./components/FontSizeControl";
import renderMathInElement from "katex/contrib/auto-render";
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
  const questionContainerRef = useRef<HTMLDivElement>(null);

  const subtestIndex = useMemo(
    () => getSubtestIndex(String(subtestId)),
    [subtestId],
  );

  const totalSubtestsCount = useMemo(() => {
    if (examData?.allSubtests && examData.allSubtests.length > 0) {
      return examData.allSubtests.length;
    }
    return SUBTEST_FLOW.length;
  }, [examData?.allSubtests]);

  const hasNextSubtest = useMemo(() => {
    return subtestIndex < totalSubtestsCount - 1;
  }, [totalSubtestsCount, subtestIndex]);

  const nextSubtestParam = String(subtestIndex + 2);

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

    const res = await fetch(
      `${BACKEND_URL}/exam/${encodeURIComponent(tryoutId)}/start`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  useEffect(() => {
    if (questionContainerRef.current) {
      const contentElements =
        questionContainerRef.current.querySelectorAll(".prose, .option-text");
      contentElements.forEach((el) => {
        if (el.innerHTML.includes("&amp;")) {
          el.innerHTML = el.innerHTML.replace(/&amp;/g, "&");
        }
      });

      renderMathInElement(questionContainerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
        trust: true,
      });
    }
  }, [currentQuestionIndex, examData, fontSize]);

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

      try {
        setLoading(true);
        setError("");
        setTimeRemainingSec(null);

        let effectiveAttemptId = attemptId || "";

        if (!isReviewMode) {
          effectiveAttemptId = await ensureAttempt();
        } else {
          effectiveAttemptId =
            effectiveAttemptId || (attemptIdFromQuery as string) || "";
        }

        const currentUserId = session?.user?.id || "";

        const url = `${BACKEND_URL}/tryout/${encodeURIComponent(
          tryoutId,
        )}/exam/${encodeURIComponent(
          String(subtestId),
        )}?userId=${encodeURIComponent(
          currentUserId,
        )}&attemptId=${encodeURIComponent(effectiveAttemptId)}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 404 || res.status === 500) {
          router.replace(`/tryout/${tryoutId}`);
          return;
        }

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Data gagal dimuat. Muat ulang halaman.");
        }

        const raw = await res.json();
        const mapped = mapQuestionsPayloadToUi(raw, effectiveAttemptId);

        setExamData(mapped);
        setCurrentQuestionIndex(0);

        const initialAnswers: AnswersMap = {};
        mapped.questions.forEach((q) => {
          if (q.userAnswer) {
            initialAnswers[q.id] = q.userAnswer;
          }
        });
        setAnswers(initialAnswers);

        setLastSyncedAnswers({});
        setMarkedQuestions([]);
        setReviewFilter("ALL");
        setTimeRemainingSec(mapped.durationMinutes * 60);
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
    setIsSubmittingFinish(true);
    setShowFinishConfirm(false);

    if (isTimeout) {
      toast.error("Waktu subtes habis. Jawaban tersimpan otomatis.");
    }

    try {
      await saveCurrentQuestionIfDirty();

      if (hasNextSubtest) {
        const currentOrder = Number(subtestId);
        const nextSubtest = examData.allSubtests.find(
          (s) => s.order === currentOrder + 1,
        );

        const query = new URLSearchParams({
          attemptId,
          prevSubtestName: examData.subtestName,
          nextSubtestName: nextSubtest?.name || "",
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
      setError(e?.message || "Gagal mengumpulkan subtes.");
      setIsSubmittingFinish(false);
    }
  };

  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (isReviewMode || !attemptId) return;

    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    const es = new EventSource(
      `${BACKEND_URL}/exam/${encodeURIComponent(attemptId)}/stream/${
        subtestIndex + 1
      }`,
    );
    sseRef.current = es;

    es.onmessage = (evt) => {
      try {
        const raw =
          typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
        const remainingSeconds = Number(
          raw?.remainingSeconds ?? raw?.data?.remainingSeconds,
        );
        const status = raw?.status ?? raw?.data?.status;

        if (Number.isFinite(remainingSeconds)) {
          setTimeRemainingSec(remainingSeconds);
        }

        if (status === "SUBTEST_FINISHED") {
          es.close();
          sseRef.current = null;
          finishCurrentSubtest(true);
        }

        if (status === "FINISHED") {
          es.close();
          router.replace(`/tryout/${tryoutId}`);
        }
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [
    attemptId,
    isReviewMode,
    router,
    tryoutId,
    subtestId,
    subtestIndex,
    hasNextSubtest,
  ]);

  useEffect(() => {
    if (isReviewMode || !examData || loading) return;
    if ((timeRemainingSec ?? 999) <= 0 && !isSubmittingFinish) {
      finishCurrentSubtest(true);
    }
  }, [timeRemainingSec, isReviewMode, examData, loading, isSubmittingFinish]);

  const handleAnswerSelect = (value: string) => {
    if (isReviewMode) return;
    if (!examData?.questions[currentQuestionIndex]) return;
    const qid = examData.questions[currentQuestionIndex].id;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
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
    if (seconds === null) return "00:00:00";

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

  const totalQuestions = examData.questions.length;
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
        <div className="pt-3 border-t border-ink-100 grid grid-cols-3 gap-2 text-[11px] text-text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-primary shrink-0" />
            <span>Dijawab ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-yellow-300 shrink-0" />
            <span>Ragu ({raguCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-surface border border-border shrink-0" />
            <span>Kosong ({unansweredCount})</span>
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
      <header className="sticky top-0 z-10 h-16 bg-surface text-text border-b border-border px-3 sm:px-6">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between gap-2">
          {/* Left: Subtest name + Font size toggle */}
          <div className="flex items-center gap-2.5 min-w-0">
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
            <div className="truncate">
              <span className="font-semibold text-sm sm:text-base text-text truncate">
                {examData.subtestName}
              </span>
              <span className="hidden md:inline font-mono text-xs text-text-muted ml-2 tabular-nums">
                · Subtes {subtestIndex + 1}/{totalSubtestsCount}
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

            <div ref={questionContainerRef}>
              {/* Question Passage / Text Box */}
              <div className="mb-6 bg-surface-muted rounded-md border border-border p-4 sm:p-5 overflow-x-auto max-h-[420px] overflow-y-auto">
                <div
                  className="prose max-w-[65ch] text-text whitespace-pre-wrap leading-[1.65]"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion.questionText,
                  }}
                />
              </div>

              {/* Options A–E (Pilihan Ganda) */}
              {currentQuestion.type !== "ISIAN_SINGKAT" && currentQuestion.options.length > 0 && (
                <div className="space-y-2.5 mb-6">
                  {currentQuestion.options.map((opt, idx) => {
                    const userAnswerId = answers[currentQuestion.id];
                    const isSelected = userAnswerId === opt.id;
                    const isCorrectKey =
                      currentQuestion.correctAnswerId === opt.id;
                    const letter = String.fromCharCode(65 + idx);

                    let rowClass =
                      "bg-surface border border-border hover:bg-surface-muted hover:border-ink-300 text-text";
                    let badgeClass =
                      "bg-surface-muted border border-border text-text-body";

                    if (isReviewMode) {
                      if (isCorrectKey) {
                        rowClass =
                          "bg-success-soft border border-success text-success-text font-semibold";
                        badgeClass =
                          "bg-success border-success text-white";
                      } else if (isSelected && !isCorrectKey) {
                        rowClass =
                          "bg-danger-soft border border-danger text-danger-text";
                        badgeClass =
                          "bg-danger border-danger text-white";
                      } else {
                        rowClass =
                          "bg-surface border border-border text-text-muted opacity-60";
                      }
                    } else if (isSelected) {
                      rowClass =
                        "bg-blue-50 border border-primary text-text font-medium ring-1 ring-primary/30";
                      badgeClass = "bg-primary border-primary text-white";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAnswerSelect(opt.id)}
                        disabled={isReviewMode}
                        className={`w-full min-h-[56px] px-4 py-3 rounded-md text-left flex items-center gap-3.5 transition-colors duration-[120ms] cursor-pointer ${rowClass}`}
                      >
                        <span
                          className={`w-8 h-8 rounded-sm shrink-0 font-mono text-sm font-semibold flex items-center justify-center ${badgeClass}`}
                        >
                          {letter}
                        </span>
                        <div
                          className="flex-1 option-text leading-[1.55]"
                          style={{ fontSize: `${fontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: opt.text }}
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
                    <label className="block text-sm font-semibold text-text">
                      Jawaban Isian Singkat
                    </label>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 text-primary border border-blue-500/20">
                      Standar Resmi BPPP SNBT
                    </span>
                  </div>

                  {!isReviewMode && (
                    <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-text leading-relaxed flex items-start gap-2.5">
                      <span className="text-primary font-bold text-sm leading-none shrink-0 mt-0.5">ℹ️</span>
                      <div>
                        <strong className="text-primary font-semibold block mb-0.5">Petunjuk Format Menjawab:</strong>
                        Tuliskan jawaban akhir hanya dalam bentuk <strong>bilangan bulat (0-9999)</strong>. Jangan menyertakan satuan (seperti <em>cm, kg, jam</em>), koma, desimal, atau teks penjelasan. Jawaban tidak terpengaruh oleh spasi ekstra.
                      </div>
                    </div>
                  )}

                  <input
                    className={`w-full h-12 px-4 rounded-md bg-surface border font-mono text-lg outline-none transition-colors ${
                      isReviewMode
                        ? isQuestionCorrect(currentQuestion)
                          ? "border-success bg-success-soft text-success-text font-bold"
                          : "border-danger bg-danger-soft text-danger-text font-bold"
                        : "border-border focus:border-primary focus:ring-3 focus:ring-blue-200"
                    }`}
                    placeholder="Masukkan angka jawaban akhir (contoh: 42)..."
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
              {isReviewMode && currentQuestion.solution && (
                <div className="mt-6 p-5 sm:p-6 rounded-lg bg-surface-muted border border-border">
                  <div className="flex items-center gap-2 text-label text-primary pb-3 mb-3 border-b border-border">
                    <BookOpen className="w-4 h-4" />
                    <span>Pembahasan langkah demi langkah</span>
                  </div>
                  <div
                    className="prose prose-sm max-w-[65ch] text-text-body leading-[1.65]"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentQuestion.solution}
                    </ReactMarkdown>
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
