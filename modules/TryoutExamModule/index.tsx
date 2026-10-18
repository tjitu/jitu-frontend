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
        correctAnswerText: s(q?.correctAnswerText),
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
      <div className="min-h-screen flex items-center justify-center bg-blue-50 flex-col gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT SOAL...
        </div>
      </div>
    );
  }

  if (error || !examData || !currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-6">
        <div className="bg-white border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <h3 className="font-display text-xl font-bold text-slate-900">
            Data gagal dimuat
          </h3>
          <p className="text-sm text-slate-600">
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
        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 border border-slate-200">
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
              className={`py-1 font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer ${
                reviewFilter === f.id
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
            "bg-white border-slate-200 text-slate-700 hover:border-slate-400";

          if (isReviewMode) {
            if (!isAnswered) {
              cellClass = "bg-white border-slate-200 text-slate-400";
            } else if (isQuestionCorrect(q)) {
              cellClass = "bg-emerald-600 border-emerald-600 text-white font-semibold";
            } else {
              cellClass = "bg-rose-600 border-rose-600 text-white font-semibold";
            }
          } else {
            if (isMarked) {
              cellClass = "bg-amber-100 border-amber-300 text-amber-950 font-bold";
            } else if (isAnswered) {
              cellClass = "bg-blue-600 border-blue-600 text-white font-semibold";
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
              className={`w-[42px] h-[42px] border font-mono text-sm font-medium flex items-center justify-center transition-colors cursor-pointer shadow-xs ${cellClass} ${
                isCurrent ? "ring-2 ring-blue-600 ring-offset-1" : ""
              } ${!visibleInFilter ? "opacity-25" : ""}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend at bottom of panel */}
      {!isReviewMode ? (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-600 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 border border-blue-600 shrink-0" />
            <span>Dijawab ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 shrink-0" />
            <span>Ragu ({raguCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-white border border-slate-300 shrink-0" />
            <span>Kosong ({unansweredCount})</span>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-600 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-600 border border-emerald-600 shrink-0" />
            <span>Benar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-600 border border-rose-600 shrink-0" />
            <span>Salah</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-white border border-slate-300 shrink-0" />
            <span>Kosong</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 flex flex-col">
      {/* Sticky Top Bar (56px, blue-800 background, white text) */}
      <header className="sticky top-0 z-30 h-14 bg-blue-800 text-white border-b-2 border-blue-900 px-3 sm:px-6">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between gap-2">
          {/* Left: Subtest name + Font size toggle */}
          <div className="flex items-center gap-2.5 min-w-0">
            {isReviewMode && (
              <button
                type="button"
                onClick={handleBackNavigation}
                className="h-8 px-2.5 border border-blue-400 bg-blue-900 hover:bg-blue-700 text-white font-mono text-xs inline-flex items-center gap-1 shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kembali</span>
              </button>
            )}
            <div className="truncate">
              <span className="font-display font-bold text-sm sm:text-base text-white truncate">
                {examData.subtestName}
              </span>
              <span className="hidden md:inline font-mono text-xs text-blue-200 ml-2">
                · Subtes {subtestIndex + 1}/{totalSubtestsCount}
              </span>
            </div>
            <div className="hidden sm:block ml-2">
              <FontSizeControl
                variant="dark"
                fontSize={fontSize}
                onIncrease={() => setFontSize((p) => Math.min(26, p + 2))}
                onDecrease={() => setFontSize((p) => Math.max(13, p - 2))}
              />
            </div>
          </div>

          {/* Center: Countdown timer in DM Mono (28px, white; turns signal #FACC15 under 5 minutes — never blinks) */}
          {!isReviewMode ? (
            <div
              className={`font-mono text-xl sm:text-[28px] font-medium tracking-wider leading-none ${
                isUnderFiveMin ? "text-signal" : "text-white"
              }`}
            >
              {formatTime(timeRemainingSec)}
            </div>
          ) : (
            <div className="font-mono text-xs uppercase tracking-[0.08em] bg-signal text-blue-900 px-2.5 py-1 border border-blue-900 font-medium">
              MODE PEMBAHASAN
            </div>
          )}

          {/* Right: "Kumpulkan" button (ghost white border; opens confirmation modal) or Review subtest switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {!isReviewMode ? (
              <button
                type="button"
                disabled={isSaving || isSubmittingFinish}
                onClick={() => setShowFinishConfirm(true)}
                className="h-9 px-3.5 border-[1.5px] border-white bg-transparent hover:bg-blue-700 text-white font-sans font-bold text-xs sm:text-sm transition-colors disabled:opacity-50"
              >
                Kumpulkan
              </button>
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
                  <SelectTrigger className="h-9 bg-blue-900 text-white border-blue-400 text-xs">
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

      {/* Offline Banner (writing.md Section 7) */}
      {!isOnline && (
        <div className="bg-amber-50 border-b-2 border-warn text-warn px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            Koneksi putus. Jawaban tetap tersimpan di perangkat ini dan dikirim
            otomatis saat online.
          </span>
        </div>
      )}

      {/* Main Body (max 960px exam container + 260px navigator on desktop) */}
      <div className="flex-1 w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-6 pb-24">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Column: Question + Options (flex-1, max 720px) */}
          <div className="w-full lg:flex-1 lg:max-w-[720px] bg-white border border-slate-200/90 shadow-xs p-5 sm:p-8">
            {/* Question Number Badge + Mobile Font Size Control */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] font-medium">
                  SOAL {currentQuestionIndex + 1} / {totalQuestions}
                </span>
                {isCurrentRagu && !isReviewMode && (
                  <span className="bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 font-mono text-xs uppercase tracking-[0.06em] font-medium">
                    RAGU-RAGU
                  </span>
                )}
              </div>
              <div className="sm:hidden">
                <FontSizeControl
                  variant="light"
                  fontSize={fontSize}
                  onIncrease={() => setFontSize((p) => Math.min(26, p + 2))}
                  onDecrease={() => setFontSize((p) => Math.max(13, p - 2))}
                />
              </div>
            </div>

            <div ref={questionContainerRef}>
              {/* Question Passage / Text Box */}
              <div className="mb-6 bg-slate-50/70 border border-slate-200/90 p-4 sm:p-5 overflow-x-auto max-h-[420px] overflow-y-auto">
                <div
                  className="prose max-w-[68ch] text-slate-900 whitespace-pre-wrap leading-[1.65]"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion.questionText,
                  }}
                />
              </div>

              {/* Options A–E */}
              <div className="space-y-2.5 mb-6">
                {currentQuestion.options.map((opt, idx) => {
                  const userAnswerId = answers[currentQuestion.id];
                  const isSelected = userAnswerId === opt.id;
                  const isCorrectKey =
                    currentQuestion.correctAnswerId === opt.id;
                  const letter = String.fromCharCode(65 + idx);

                  let rowClass =
                    "bg-white border border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 text-slate-900 shadow-xs";
                  let badgeClass =
                    "bg-slate-100 border border-slate-200 text-slate-700";

                  if (isReviewMode) {
                    if (isCorrectKey) {
                      rowClass =
                        "bg-emerald-50/70 border border-emerald-500 text-emerald-950 font-semibold shadow-xs";
                      badgeClass =
                        "bg-emerald-600 border-emerald-600 text-white";
                    } else if (isSelected && !isCorrectKey) {
                      rowClass =
                        "bg-red-50/70 border border-red-500 text-red-950 shadow-xs";
                      badgeClass =
                        "bg-red-600 border-red-600 text-white";
                    } else {
                      rowClass =
                        "bg-white border border-slate-200 text-slate-500 opacity-60";
                    }
                  } else if (isSelected) {
                    rowClass =
                      "bg-blue-50/80 border border-blue-600 text-blue-950 font-medium ring-1 ring-blue-600/30 shadow-xs";
                    badgeClass = "bg-blue-600 border-blue-600 text-white";
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAnswerSelect(opt.id)}
                      disabled={isReviewMode}
                      className={`w-full min-h-[56px] px-4 py-3 text-left flex items-center gap-3.5 transition-colors ${rowClass}`}
                    >
                      <span
                        className={`w-8 h-8 shrink-0 font-mono text-sm font-medium flex items-center justify-center ${badgeClass}`}
                      >
                        {letter}
                      </span>
                      <div
                        className="flex-1 option-text leading-[1.55]"
                        style={{ fontSize: `${fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: opt.text }}
                      />
                      {isReviewMode && isCorrectKey && (
                        <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                      )}
                      {isReviewMode && isSelected && !isCorrectKey && (
                        <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Short-answer / Fill-in Question */}
                {currentQuestion.options.length === 0 && (
                  <div className="space-y-3">
                    <label className="block font-mono text-xs uppercase tracking-[0.08em] text-slate-700">
                      JAWABAN ISIAN SINGKAT
                    </label>
                    <input
                      className={`w-full h-12 px-3.5 bg-white border font-mono text-base outline-none transition-colors ${
                        isReviewMode
                          ? isQuestionCorrect(currentQuestion)
                            ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium"
                            : "border-red-500 bg-red-50/70 text-red-950"
                          : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      }`}
                      placeholder="Ketik jawaban singkat..."
                      style={{ fontSize: `${fontSize}px` }}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      disabled={isReviewMode}
                    />
                    {isReviewMode && currentQuestion.correctAnswerText && (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-400 font-mono text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>
                          KUNCI JAWABAN: {currentQuestion.correctAnswerText}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Solution Box in Review Mode */}
              {isReviewMode && currentQuestion.solution && (
                <div className="mt-6 p-5 sm:p-6 bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-blue-700 font-medium pb-3 mb-3 border-b border-slate-200">
                    <BookOpen className="w-4 h-4" />
                    PEMBAHASAN LANGKAH DEMI LANGKAH
                  </div>
                  <div
                    className="prose prose-sm max-w-[68ch] text-slate-800 leading-[1.65]"
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
          <aside className="hidden lg:block w-[260px] shrink-0 bg-white border border-slate-200 shadow-xs p-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="font-mono text-xs uppercase tracking-[0.08em] font-medium text-slate-900">
                NOMOR SOAL
              </span>
              <span className="font-mono text-xs text-slate-500">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            {renderNumberGrid(false)}
          </aside>
        </div>
      </div>

      {/* Mobile Number Grid Bottom Sheet */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white border-t border-slate-200 shadow-xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="font-mono text-xs uppercase tracking-[0.08em] font-medium text-slate-900">
                DAFTAR NOMOR SOAL ({answeredCount}/{totalQuestions})
              </span>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="w-8 h-8 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderNumberGrid(true)}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar (64px, white, 1px top border slate-200) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-3 sm:px-6 shadow-sm">
        <div className="max-w-[1040px] mx-auto h-full flex items-center justify-between gap-2">
          {/* Left: "← Sebelumnya" (secondary) */}
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

          {/* Center: "Tandai ragu" toggle + Save status ("Tersimpan" / "Menyimpan…") + Mobile "Nomor" trigger */}
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
                className={`h-9 px-3 border font-sans font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors ${
                  isCurrentRagu
                    ? "bg-amber-100 border-amber-300 text-amber-900"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Tandai ragu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className="lg:hidden h-9 px-3 border border-slate-300 bg-slate-50 text-slate-800 font-mono text-xs font-medium inline-flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Nomor</span>
            </button>

            {!isReviewMode && (
              <span className="hidden md:inline-block font-mono text-xs text-slate-500">
                {isSaving ? "Menyimpan…" : "Tersimpan"}
              </span>
            )}
          </div>

          {/* Right: "Berikutnya →" (blue-600 solid) */}
          <Button
            variant="default"
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

      {/* Confirmation Modal on "Kumpulkan" (writing.md Section 5.6) */}
      <Dialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-slate-900">
              Kumpulkan sekarang?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 pt-1">
              Masih ada{" "}
              <span className="font-mono font-medium text-slate-900">
                {unansweredCount}
              </span>{" "}
              soal kosong dan{" "}
              <span className="font-mono font-medium text-amber-700">
                {raguCount}
              </span>{" "}
              soal ragu-ragu.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 bg-slate-50 border border-slate-200 p-4 grid grid-cols-3 gap-2 text-center font-mono">
            <div>
              <div className="text-[11px] text-slate-500 uppercase">
                DIJAWAB
              </div>
              <div className="text-xl font-medium text-slate-900">
                {answeredCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase">KOSONG</div>
              <div className="text-xl font-medium text-slate-900">
                {unansweredCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase">RAGU</div>
              <div className="text-xl font-medium text-amber-600">
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
              Kembali ke soal
            </Button>
            <Button
              variant="default"
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
