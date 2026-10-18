"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

const SUBTESTS = [
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
    duration: 42.5,
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
    duration: 42.5,
  },
];

const BREAK_DURATION_SEC = 30;

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

  const [breakTimeRemainingSec, setBreakTimeRemainingSec] = useState<
    number | null
  >(null);

  const currentOrder = Number(nextSubtestId) - 1;
  const nextSubtestMeta = SUBTESTS.find(
    (s) => s.order === Number(nextSubtestId),
  );

  const handleProceedToNext = useCallback(async () => {
    await fetch(
      `${BACKEND_URL}/exam/${encodeURIComponent(attemptId || "")}/start-subtest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subtestOrder: Number(nextSubtestId) }),
      },
    );

    router.push(
      `/tryout/${tryoutId}/exam/${nextSubtestId}?attemptId=${encodeURIComponent(
        attemptId || "",
      )}`,
    );
  }, [router, tryoutId, nextSubtestId, attemptId]);

  useEffect(() => {
    if (!attemptId) {
      router.replace(`/tryout/${tryoutId}`);
      return;
    }

    const storageKey = `break_started_at_${attemptId}`;
    let startTimeIso = localStorage.getItem(storageKey);

    if (!startTimeIso) {
      startTimeIso = new Date().toISOString();
      localStorage.setItem(storageKey, startTimeIso);
    }

    const startTime = new Date(startTimeIso);

    const timer = setInterval(() => {
      const elapsedSec = (new Date().getTime() - startTime.getTime()) / 1000;
      const remaining = Math.max(
        0,
        Math.floor(BREAK_DURATION_SEC - elapsedSec),
      );

      setBreakTimeRemainingSec(remaining);

      if (remaining === 0) {
        localStorage.removeItem(storageKey);
        handleProceedToNext();
      }
    }, 1000);

    const initialElapsed = (new Date().getTime() - startTime.getTime()) / 1000;
    setBreakTimeRemainingSec(
      Math.max(0, Math.floor(BREAK_DURATION_SEC - initialElapsed)),
    );

    return () => {
      clearInterval(timer);
    };
  }, [attemptId, tryoutId, router, handleProceedToNext]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-3xl w-full bg-white border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-12">
        {/* Left: Countdown & Next Subtest */}
        <div className="p-6 sm:p-8 md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-400 text-emerald-800 px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              SUBTES {currentOrder} SELESAI
            </div>

            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
              {prevSubtestName} selesai
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Tarik napas sebentar. Subtes berikutnya akan dimulai otomatis
              saat hitung mundur habis.
            </p>

            <div className="bg-slate-900 text-white border border-slate-800 p-5 mb-6 shadow-sm">
              <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-400">
                MULAI OTOMATIS DALAM
              </div>
              <div className="font-mono text-5xl font-medium text-amber-400 leading-none my-3">
                00:
                {String(breakTimeRemainingSec ?? BREAK_DURATION_SEC).padStart(
                  2,
                  "0",
                )}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-400">
                  SUBTES {nextSubtestId}/7 BERIKUTNYA
                </div>
                <div className="font-display text-lg font-bold text-white mt-0.5">
                  {nextSubtestName}
                </div>
                {nextSubtestMeta && (
                  <div className="font-mono text-xs text-slate-400 mt-1">
                    {nextSubtestMeta.questions} soal ·{" "}
                    {nextSubtestMeta.duration} menit
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => {
              const storageKey = `break_started_at_${attemptId}`;
              localStorage.removeItem(storageKey);
              handleProceedToNext();
            }}
          >
            Lanjut sekarang
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Right: 7 Subtests Progress */}
        <div className="bg-slate-50 p-6 sm:p-8 md:col-span-5">
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-900 font-medium mb-4">
            PROGRES 7 SUBTES
          </div>
          <div className="space-y-2">
            {SUBTESTS.map((sub) => {
              const isFinished = sub.order <= currentOrder;
              const isNext = sub.order === currentOrder + 1;

              return (
                <div
                  key={sub.order}
                  className={`p-2.5 border flex items-center justify-between gap-2 shadow-xs transition-colors ${
                    isNext
                      ? "bg-white border-blue-600 ring-1 ring-blue-600/30 text-slate-900"
                      : isFinished
                        ? "bg-emerald-50/50 border-emerald-200 text-slate-600"
                        : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-slate-500">
                      0{sub.order} · {sub.abbr}
                    </div>
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {sub.name}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] uppercase px-1.5 py-0.5 border shrink-0 ${
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
