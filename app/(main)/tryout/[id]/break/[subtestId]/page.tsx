"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/lib/api";
import { getTryoutDetail } from "@/lib/api/tryout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2, Clock } from "lucide-react";

type SubtestProgressItem = {
  name: string;
  abbr: string;
  order: number;
  questions: number;
  duration: number;
};

const DEFAULT_SUBTESTS: SubtestProgressItem[] = [
  { name: "Penalaran Umum", abbr: "PU", order: 1, questions: 30, duration: 30 },
  {
    name: "Pengetahuan & Pemahaman Umum",
    abbr: "PPU",
    order: 2,
    questions: 20,
    duration: 15,
  },
  {
    name: "Pemahaman Bacaan & Menulis",
    abbr: "PBM",
    order: 3,
    questions: 20,
    duration: 25,
  },
  {
    name: "Pengetahuan Kuantitatif",
    abbr: "PK",
    order: 4,
    questions: 20,
    duration: 20,
  },
  {
    name: "Literasi Bahasa Indonesia",
    abbr: "LBI",
    order: 5,
    questions: 30,
    duration: 43,
  },
  {
    name: "Literasi Bahasa Inggris",
    abbr: "LBE",
    order: 6,
    questions: 20,
    duration: 20,
  },
  {
    name: "Penalaran Matematika",
    abbr: "PM",
    order: 7,
    questions: 20,
    duration: 42,
  },
];

const SUBTEST_LABELS: Record<string, { name: string; abbr: string }> = {
  PU: { name: "Penalaran Umum", abbr: "PU" },
  PPU: { name: "Pengetahuan & Pemahaman Umum", abbr: "PPU" },
  PBM: { name: "Pemahaman Bacaan & Menulis", abbr: "PBM" },
  PK: { name: "Pengetahuan Kuantitatif", abbr: "PK" },
  LBI: { name: "Literasi Bahasa Indonesia", abbr: "LBI" },
  LBE: { name: "Literasi Bahasa Inggris", abbr: "LBE" },
  PM: { name: "Penalaran Matematika", abbr: "PM" },
};

const BREAK_DURATION_SEC = 60; // Jeda wajib/opsional antar subtes: 1 menit (dapat di-skip kapan saja)

function formatBreakClock(totalSeconds: number | null): string {
  const safe = Math.max(0, totalSeconds ?? BREAK_DURATION_SEC);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function BreakPage() {
  const router = useRouter();
  const params = useParams<{ id: string; subtestId: string }>();
  const searchParams = useSearchParams();

  const tryoutId = params?.id;
  const nextSubtestId = params?.subtestId;
  const attemptId = searchParams.get("attemptId");
  const prevSubtestName = searchParams.get("prevSubtestName") || "Subtes";
  const nextSubtestName =
    searchParams.get("nextSubtestName") || "Subtes Berikutnya";
  const nextDurationFromQuery = Number(searchParams.get("nextSubtestDuration") || 0);
  const nextQuestionsFromQuery = Number(searchParams.get("nextSubtestQuestions") || 0);

  const [breakTimeRemainingSec, setBreakTimeRemainingSec] = useState<
    number | null
  >(BREAK_DURATION_SEC);
  const [subtestsList, setSubtestsList] =
    useState<SubtestProgressItem[]>(DEFAULT_SUBTESTS);
  const [isProceeding, setIsProceeding] = useState(false);
  const [proceedError, setProceedError] = useState("");
  const proceedingRef = useRef(false);

  const currentOrder = Math.max(1, Number(nextSubtestId) - 1);
  const nextOrder = Number(nextSubtestId);
  const storageKey = `break_started_at_${attemptId}_${nextSubtestId}`;

  useEffect(() => {
    if (!tryoutId) return;

    // 1. Apply cached subtest list from TryoutExamModule if present
    try {
      const cachedRaw = window.sessionStorage.getItem(
        `tryout_subtests_${tryoutId}`,
      );
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubtestsList(
            parsed.map((s: any) => {
              const code = String(s.name || "").toUpperCase();
              const label = SUBTEST_LABELS[code];
              return {
                name: label?.name || s.name || `Subtes ${s.order}`,
                abbr: label?.abbr || code || `S${s.order}`,
                order: Number(s.order),
                questions: Number(s.questionCount ?? 0),
                duration: Number(s.durationMinutes ?? 0),
              };
            }),
          );
        }
      }
    } catch {
      // Ignore invalid cached payload
    }

    // 2. Refresh live durations & question counts from backend
    let active = true;
    getTryoutDetail(tryoutId)
      .then((detail) => {
        if (!active || !Array.isArray(detail.categories) || detail.categories.length === 0) {
          return;
        }
        setSubtestsList(
          detail.categories.map((cat) => {
            const code = String(cat.name || "").toUpperCase();
            const label = SUBTEST_LABELS[code];
            return {
              name: label?.name || cat.name,
              abbr: label?.abbr || code,
              order: Number(cat.id),
              questions: Number(cat.questionCount ?? 0),
              duration: Number(cat.duration ?? 0),
            };
          }),
        );
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [tryoutId]);

  const nextSubtestMeta = subtestsList.find((s) => s.order === nextOrder);
  const displayNextDuration =
    nextSubtestMeta?.duration || nextDurationFromQuery || 0;
  const displayNextQuestions =
    nextSubtestMeta?.questions || nextQuestionsFromQuery || 0;
  const visibleSubtests = subtestsList.some((s) => s.questions > 0)
    ? subtestsList.filter((s) => s.questions > 0)
    : subtestsList;

  const handleProceedToNext = useCallback(async () => {
    if (proceedingRef.current) return;
    proceedingRef.current = true;
    setIsProceeding(true);
    setProceedError("");

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }

      const res = await fetch(
        `${BACKEND_URL}/exam/${encodeURIComponent(attemptId || "")}/start-subtest`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ subtestOrder: Number(nextSubtestId) }),
        },
      );

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Gagal memulai subtes berikutnya.");
      }

      router.push(
        `/tryout/${tryoutId}/exam/${nextSubtestId}?attemptId=${encodeURIComponent(
          attemptId || "",
        )}`,
      );
    } catch (err: any) {
      proceedingRef.current = false;
      setIsProceeding(false);
      setProceedError(
        err?.message || "Gagal memulai subtes. Klik tombol di bawah untuk mencoba lagi.",
      );
    }
  }, [router, tryoutId, nextSubtestId, attemptId, storageKey]);

  useEffect(() => {
    if (!attemptId) {
      router.replace(`/tryout/${tryoutId}`);
      return;
    }

    let startMs: number;
    const savedIso = localStorage.getItem(storageKey);
    const parsedMs = savedIso ? new Date(savedIso).getTime() : NaN;
    if (Number.isFinite(parsedMs)) {
      startMs = parsedMs;
    } else {
      startMs = Date.now();
      localStorage.setItem(storageKey, new Date(startMs).toISOString());
    }

    const updateCountdown = () => {
      const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, BREAK_DURATION_SEC - elapsedSec);
      setBreakTimeRemainingSec(remaining);
      if (remaining === 0 && !proceedingRef.current) {
        void handleProceedToNext();
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 500);

    return () => {
      clearInterval(timer);
    };
  }, [attemptId, tryoutId, router, storageKey, handleProceedToNext]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-3xl w-full bg-white border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-12 rounded-xl overflow-hidden">
        {/* Left: 1-Minute Countdown & Next Subtest */}
        <div className="p-6 sm:p-8 md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-400 text-emerald-800 px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] mb-4 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              SUBTES {currentOrder} SELESAI
            </div>

            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
              {prevSubtestName} selesai
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Jawaban kamu sudah tersimpan otomatis. Istirahat 1 menit atau langsung lanjut ke subtes berikutnya kapan saja.
            </p>

            <div className="bg-slate-900 text-white border border-slate-800 p-5 mb-5 shadow-sm rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-400">
                  JEDA ANTAR SUBTES (1 MENIT)
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-300">
                  <Clock className="w-3 h-3" />
                  Otomatis lanjut
                </span>
              </div>
              <div className="font-mono text-5xl font-semibold text-amber-400 leading-none my-3 tabular-nums">
                {formatBreakClock(breakTimeRemainingSec)}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-400">
                  SUBTES {nextSubtestId}/{visibleSubtests.length} BERIKUTNYA
                </div>
                <div className="font-display text-lg font-bold text-white mt-0.5">
                  {nextSubtestMeta?.name || nextSubtestName}
                </div>
                {(displayNextQuestions > 0 || displayNextDuration > 0) && (
                  <div className="font-mono text-xs text-slate-400 mt-1 tabular-nums">
                    {displayNextQuestions} soal · {displayNextDuration} menit
                  </div>
                )}
              </div>
            </div>

            {proceedError && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                {proceedError}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              variant="default"
              size="lg"
              className="w-full"
              disabled={isProceeding}
              onClick={() => void handleProceedToNext()}
            >
              {isProceeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memulai subtes...
                </>
              ) : (
                <>
                  Lewati Jeda &amp; Lanjut Sekarang
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-[11px] text-center text-slate-500">
              Timer subtes berikutnya baru berjalan setelah kamu masuk ke lembar soal.
            </p>
          </div>
        </div>

        {/* Right: Subtests Progress */}
        <div className="bg-slate-50 p-6 sm:p-8 md:col-span-5">
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-900 font-medium mb-4">
            PROGRES {visibleSubtests.length} SUBTES
          </div>
          <div className="space-y-2">
            {visibleSubtests.map((sub, index) => {
              const isFinished = sub.order <= currentOrder;
              const isNext = sub.order === nextOrder;

              return (
                <div
                  key={sub.order}
                  className={`p-2.5 border flex items-center justify-between gap-2 shadow-xs transition-colors rounded-md ${
                    isNext
                      ? "bg-white border-blue-600 ring-1 ring-blue-600/30 text-slate-900"
                      : isFinished
                        ? "bg-emerald-50/50 border-emerald-200 text-slate-600"
                        : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-slate-500">
                      0{index + 1} · {sub.abbr} · {sub.duration}m
                    </div>
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {sub.name}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] uppercase px-1.5 py-0.5 border shrink-0 rounded ${
                      isFinished
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : isNext
                          ? "bg-blue-600 border-blue-600 text-white font-medium"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                    }`}
                  >
                    {isFinished ? "SELESAI" : isNext ? "BERIKUT" : "NANTI"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
