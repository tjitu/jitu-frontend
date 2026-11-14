"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lock,
  Sparkles,
} from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { renderMathContent } from "@/components/interactive-solution-deck";
import type { PracticeQuestionSummary } from "@/lib/practice-store";

const HOLD_DURATION_MS = 5000;
const HOT_QUESTION_COUNT = 5;

const SUBTEST_LABELS: Record<string, { short: string; name: string }> = {
  PENALARAN_UMUM: { short: "PU", name: "Penalaran Umum" },
  PU: { short: "PU", name: "Penalaran Umum" },
  PENGETAHUAN_KUANTITATIF: { short: "PK", name: "Pengetahuan Kuantitatif" },
  PK: { short: "PK", name: "Pengetahuan Kuantitatif" },
  PENALARAN_MATEMATIKA: { short: "PM", name: "Penalaran Matematika" },
  PM: { short: "PM", name: "Penalaran Matematika" },
  PEMAHAMAN_BACAAN_MENULIS: { short: "PBM", name: "Pemahaman Bacaan" },
  PBM: { short: "PBM", name: "Pemahaman Bacaan" },
  PENGETAHUAN_PEMAHAMAN_UMUM: { short: "PPU", name: "Pengetahuan Umum" },
  PPU: { short: "PPU", name: "Pengetahuan Umum" },
  LITERASI_INDONESIA: { short: "LBI", name: "Literasi Indonesia" },
  LBI: { short: "LBI", name: "Literasi Indonesia" },
  LITERASI_INGGRIS: { short: "LBE", name: "Literasi Inggris" },
  LBE: { short: "LBE", name: "Literasi Inggris" },
};

function formatQuestionSnippetHtml(raw?: string | null): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<\/\s*(?:p|div|li|h[1-6])\s*>/gi, " ")
    .replace(/<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^>]*)?\/?>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => `$${math}$`)
    .replace(/\s+/g, " ")
    .trim();

  return renderMathContent(cleaned);
}

export function HotQuestionsCard() {
  const [questions, setQuestions] = useState<PracticeQuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cycleSeed, setCycleSeed] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartXRef = useRef<number | null>(null);
  const dragDeltaRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const auth = getFirebaseAuth();

    const fetchHotQuestions = async () => {
      try {
        const headers: Record<string, string> = {};
        if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken().catch(() => null);
          if (idToken) headers.Authorization = `Bearer ${idToken}`;
        }

        const res = await fetch(
          `/api/hot-questions?limit=${HOT_QUESTION_COUNT}`,
          { headers }
        );
        const data = await res.json();
        if (cancelled) return;

        if (data?.success && Array.isArray(data.questions)) {
          setQuestions(data.questions.slice(0, HOT_QUESTION_COUNT));
          setActiveIndex(0);
          setCycleSeed((s) => s + 1);
        }
      } catch (err) {
        console.error("Failed to fetch hot questions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const unsub = onAuthStateChanged(auth, () => {
      void fetchHotQuestions();
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const total = questions.length;

  const goToSlide = useCallback(
    (nextIdx: number) => {
      if (total <= 1) return;
      const wrapped = ((nextIdx % total) + total) % total;
      setActiveIndex(wrapped);
      setCycleSeed((s) => s + 1);
    },
    [total]
  );

  // Auto-hold 5s then swipe in an infinite loop
  useEffect(() => {
    if (total <= 1 || isPaused || isDragging) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % total);
      setCycleSeed((s) => s + 1);
    }, HOLD_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, total, isPaused, isDragging, cycleSeed]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (total <= 1) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    dragStartXRef.current = e.clientX;
    dragDeltaRef.current = 0;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;
    const delta = e.clientX - dragStartXRef.current;
    dragDeltaRef.current = delta;
    setDragOffset(delta);
  };

  const finishSwipe = () => {
    if (dragStartXRef.current === null) return;
    const delta = dragDeltaRef.current;
    dragStartXRef.current = null;
    dragDeltaRef.current = 0;
    setIsDragging(false);
    setDragOffset(0);

    if (Math.abs(delta) >= 40) {
      if (delta < 0) {
        goToSlide(activeIndex + 1);
      } else {
        goToSlide(activeIndex - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-5 space-y-4">
        <div className="h-5 w-44 rounded jitu-skeleton" />
        <div className="h-20 w-full rounded jitu-skeleton" />
        <div className="h-10 w-full rounded jitu-skeleton" />
      </div>
    );
  }

  const currentQuestion = questions[activeIndex] || null;
  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setCycleSeed((s) => s + 1);
      }}
      className="bg-surface rounded-lg border border-border p-5 space-y-4"
    >
      {/* Card Header */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 text-label text-text-muted">
          <Flame className="w-3.5 h-3.5 text-red-500 stroke-[2.2]" />
          <span>Hot Question of the Day</span>
        </div>
      </div>

      {/* Swipeable Question Track */}
      {total > 0 ? (
        <>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishSwipe}
            onPointerCancel={finishSwipe}
            onPointerLeave={finishSwipe}
            className="overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
          >
            <div
              style={{
                transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
              }}
              className={`flex ${
                isDragging
                  ? "transition-none"
                  : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              }`}
            >
              {questions.map((q) => {
                const qSub = SUBTEST_LABELS[q.subtest.toUpperCase()] || {
                  short: q.subtest.slice(0, 4).toUpperCase(),
                  name: q.subtest,
                };
                const title =
                  q.topicTitle?.trim() ||
                  q.subtopicTitle?.trim() ||
                  `Tantangan ${qSub.name}`;
                const previewHtml = formatQuestionSnippetHtml(q.content);

                return (
                  <div key={q.id} className="w-full shrink-0 space-y-1.5 pr-0.5">
                    <h3 className="text-[16px] font-bold text-text leading-snug line-clamp-1">
                      {title}
                    </h3>
                    <div
                      className="text-[13px] text-text-body line-clamp-3 leading-relaxed min-h-[63px] [&_.katex]:text-[13px]"
                      dangerouslySetInnerHTML={{
                        __html:
                          previewHtml ||
                          "Uji pemahamanmu lewat soal pilihan acak yang belum pernah kamu kerjakan.",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <Link
              href={`/latihan?questionId=${encodeURIComponent(currentQuestion!.id)}`}
              className="min-h-[42px] px-3.5 rounded-md bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Kerjakan soal</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
            <div
              title="Fitur Soal Harian sedang dikunci"
              className="min-h-[42px] px-3.5 rounded-md border border-border bg-surface-muted/40 text-text-muted text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-text-muted" />
              <span>Soal harian</span>
            </div>
          </div>

          {/* Bottom Swipe Dots + Stepper */}
          {total > 1 ? (
            <div className="flex items-center justify-between pt-1 border-t border-ink-100/80">
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label="Pilih Hot Question"
              >
                {questions.map((q, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Soal ${idx + 1} dari ${total}`}
                      onClick={() => goToSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "w-7 bg-blue-100 relative overflow-hidden"
                          : "w-2 bg-ink-200 hover:bg-ink-400"
                      }`}
                    >
                      {isActive ? (
                        <span
                          key={`${activeIndex}-${cycleSeed}`}
                          style={{
                            animationPlayState: isPaused ? "paused" : "running",
                          }}
                          className="animate-hot-question-progress absolute inset-0 rounded-full bg-primary origin-left"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="inline-flex items-center gap-1">
                <span className="font-mono text-[11px] text-text-muted tabular-nums mr-1">
                  {activeIndex + 1}/{total}
                </span>
                <button
                  type="button"
                  aria-label="Soal sebelumnya"
                  onClick={() => goToSlide(activeIndex - 1)}
                  className="w-6 h-6 rounded-md border border-border bg-surface hover:bg-surface-muted text-text-muted hover:text-text inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Soal berikutnya"
                  onClick={() => goToSlide(activeIndex + 1)}
                  className="w-6 h-6 rounded-md border border-border bg-surface hover:bg-surface-muted text-text-muted hover:text-text inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-success-text">
            <Sparkles className="w-4 h-4" />
            <span>Semua soal latihan sudah selesai kamu kerjakan!</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/latihan"
              className="min-h-[42px] px-3.5 rounded-md bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Buka latihan</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </Link>
            <div
              title="Fitur Soal Harian sedang dikunci"
              className="min-h-[42px] px-3.5 rounded-md border border-border bg-surface-muted/40 text-text-muted text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-text-muted" />
              <span>Soal harian</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
