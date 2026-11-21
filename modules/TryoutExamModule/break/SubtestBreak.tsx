"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock, ListChecks, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startNextSubtest } from "@/lib/api/exam";
import { getTryoutDetail } from "@/lib/api/tryout";
import { useSession } from "@/lib/auth-client";
import { getSubtestMeta } from "@/lib/soal-asli-types";
import { getSubtestInfo } from "@/modules/TryoutDetailModule/components/subtest-meta";
import type { CategoryDetail } from "@/modules/TryoutDetailModule/interface";
import { BreakCountdown } from "./BreakCountdown";
import { BreakProgress } from "./BreakProgress";
import { resolveBreak } from "./resolve-break";

interface BreakProps {
  tryoutId: string;
  attemptId: string;
  order: number;
  expiredLink: boolean;
}

interface BreakView {
  title: string;
  subtests: CategoryDetail[];
  nextIndex: number;
  breakSeconds: number;
}

export function SubtestBreak({ tryoutId, attemptId, order, expiredLink }: BreakProps) {
  const router = useRouter();
  const { isPending } = useSession();
  const [view, setView] = useState<BreakView | null>(null);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [startError, setStartError] = useState("");
  const [starting, setStarting] = useState(false);
  const [resumeBreak, setResumeBreak] = useState(false);
  const startingRef = useRef(false);
  const detailUrl = `/tryout/${encodeURIComponent(tryoutId)}`;
  const storageKey = `break_started_at_${attemptId}_${order}`;

  useEffect(() => {
    try {
      setResumeBreak(Boolean(localStorage.getItem(storageKey)));
    } catch {
      setResumeBreak(false);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!attemptId || !Number.isSafeInteger(order) || order < 1) {
      router.replace(detailUrl);
      return;
    }
    if (isPending) return;
    let active = true;
    getTryoutDetail(tryoutId).then((data) => {
      if (!active) return;
      const state = resolveBreak(data, attemptId, order, expiredLink);
      if (state.subtests) {
        setView({ ...state, title: data.title, breakSeconds: data.breakSeconds ?? 60 });
      } else {
        router.replace(state.redirect);
      }
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof Error ? error.message : "Progres tryout gagal dimuat.");
    });
    return () => { active = false; };
  }, [attemptId, detailUrl, expiredLink, isPending, order, retry, router, tryoutId]);

  async function proceed() {
    if (startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    setStartError("");
    try {
      await startNextSubtest(attemptId, order);
      try { localStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
      router.replace(`${detailUrl}/exam/${order}?attemptId=${encodeURIComponent(attemptId)}`);
    } catch (error) {
      startingRef.current = false;
      setStarting(false);
      setStartError(error instanceof Error ? error.message : "Subtes gagal dimulai. Coba lagi.");
    }
  }

  if (!view) {
    return (
      <div className="grid min-h-svh place-items-center bg-bg p-6">
        {loadError ? (
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
            <h1 className="text-lg font-bold text-text">Progres belum bisa dimuat</h1>
            <p role="alert" className="my-3 text-sm text-text-body">{loadError}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { setLoadError(""); setRetry((value) => value + 1); }}>Coba lagi</Button>
              <Button asChild variant="ghost"><Link href={detailUrl}>Detail tryout</Link></Button>
            </div>
          </div>
        ) : <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />Memeriksa waktu subtes…</p>}
      </div>
    );
  }

  const { subtests, nextIndex, breakSeconds } = view;
  const next = subtests[nextIndex];
  const NextSubtestIcon = getSubtestInfo(next.name, nextIndex).IconComponent;
  const previous = subtests[nextIndex - 1];
  const previousName = previous ? `${getSubtestMeta(previous.name).label} (${getSubtestInfo(previous.name, nextIndex - 1).code})` : "Subtes sebelumnya";
  const nextCode = getSubtestInfo(next.name, nextIndex).code;
  return (
    <div className="grid min-h-svh place-items-center bg-bg px-4 py-6 sm:px-8 sm:py-12">
      <section className="w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface">
        <header className="flex items-center gap-3 border-b border-border px-6 py-4 sm:px-8">
          <BookOpen aria-hidden="true" className="size-5 shrink-0 text-primary" />
          <span className="font-display text-sm font-semibold text-text">{view.title}</span>
        </header>
        <div className="grid lg:grid-cols-5">
          <div className="flex min-w-0 flex-col justify-center gap-6 p-6 sm:p-8 lg:col-span-3 lg:p-10">
            <p className="flex items-start gap-2 text-sm text-text-body">
              {expiredLink ? <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> :
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success-text" />}
              {expiredLink ? `Waktu untuk ${previousName} sudah habis.` : `${previousName} selesai.`}
            </p>
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">NEXT</p>
              <div className="flex items-center gap-3">
                <NextSubtestIcon aria-hidden="true" className="size-10 shrink-0 text-primary sm:size-12" size={48} />
                <h1 className="break-words font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">{getSubtestMeta(next.name).label} ({nextCode})</h1>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-body">
                <span className="inline-flex items-center gap-2"><ListChecks aria-hidden="true" className="size-4" />{next.questionCount} soal</span>
                <span className="inline-flex items-center gap-2"><Clock aria-hidden="true" className="size-4" />{next.duration} menit</span>
              </div>
            </div>
            {(!expiredLink || resumeBreak) && (
              <BreakCountdown storageKey={storageKey} seconds={breakSeconds} onElapsed={() => void proceed()} />
            )}
            <div className="space-y-3">
              {startError && <p role="alert" className="text-sm text-danger-text">{startError}</p>}
              <Button size="lg" className="w-full sm:w-auto" onClick={proceed} disabled={starting}>
                {starting ? <>Memulai subtes… <Loader2 className="size-4 animate-spin" /></> :
                  <>Mulai subtes <ArrowRight aria-hidden="true" className="size-4" /></>}
              </Button>
            </div>
          </div>
          <BreakProgress subtests={subtests} nextIndex={nextIndex} />
        </div>
      </section>
    </div>
  );
}
