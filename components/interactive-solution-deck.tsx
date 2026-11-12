"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Check,
  X,
  Sigma,
} from "lucide-react";
import katex from "katex";
import type { QuestionSolutionData } from "@/lib/practice-store";

export interface RenderMathOptions {
  animatedHighlights?: boolean;
}

export function renderMathContent(
  content: string,
  options: RenderMathOptions = {}
): string {
  if (!content) return "";

  const { animatedHighlights = false } = options;

  // 1. Replace block math $$...$$ with compact, balanced math card
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="step-math-card my-2.5 py-2.5 px-4 rounded-xl bg-surface-muted/85 border border-primary/20 text-center overflow-x-auto text-sm sm:text-base">${rendered}</div>`;
    } catch {
      return `<div class="step-math-card my-2.5 py-2.5 px-4 rounded-xl bg-surface-muted/85 border border-primary/20 font-mono text-center overflow-x-auto text-sm sm:text-base">$$${math}$$</div>`;
    }
  });

  // 2. Replace inline math $...$ naturally in prose flow without boxy badges
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return `<span class="inline-math px-0.5">${katex.renderToString(
        math.trim(),
        { displayMode: false, throwOnError: false }
      )}</span>`;
    } catch {
      return `$${math}$`;
    }
  });

  // 3. Special callout for checklist / conclusion lines starting with ✅
  processed = processed.replace(
    /^✅\s*(.*?)$/gm,
    `<div class="flex items-start gap-2.5 p-3 sm:p-3.5 my-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 font-semibold text-sm sm:text-[15px] leading-snug">
      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] mt-0.5">✓</span>
      <div class="flex-1">$1</div>
    </div>`
  );

  // 4. Blockquotes > ...
  processed = processed.replace(
    /^>\s*(.*?)$/gm,
    `<blockquote class="border-l-4 border-primary pl-3.5 py-2 my-2.5 bg-blue-50/50 rounded-r-xl text-sm sm:text-[15px] text-text-body italic leading-relaxed">$1</blockquote>`
  );

  // Clean extra newlines directly adjacent to block-level HTML cards so whitespace-pre-wrap stays crisp
  processed = processed
    .replace(/\n+(<(?:div|blockquote)\b)/g, "$1")
    .replace(/(<\/(?:div|blockquote)>)\n+/g, "$1");

  // 5. Highlight syntax ==text== -> yellow animated stabilo ONLY for truly crucial insights
  if (animatedHighlights) {
    processed = processed.replace(
      /(?<!=)==([^\n]+?)(?<!=)==(?!=)/g,
      `<mark class="step-highlight-animated">$1</mark>`
    );
  } else {
    processed = processed.replace(
      /(?<!=)==([^\n]+?)(?<!=)==(?!=)/g,
      `<mark class="px-1 py-0.5 rounded bg-yellow-100 font-semibold text-text">$1</mark>`
    );
  }

  // 6. Standard markdown **text** -> clean bold without yellow stabilo
  processed = processed.replace(
    /\*\*(.*?)\*\*/g,
    `<strong class="font-bold text-text">$1</strong>`
  );

  return processed;
}

interface InteractiveSolutionDeckProps {
  solution: QuestionSolutionData;
  className?: string;
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
  onClose?: () => void;
}

export function InteractiveSolutionDeck(props: InteractiveSolutionDeckProps) {
  return <InteractiveSolutionDeckContent key={props.solution.id} {...props} />;
}

function InteractiveSolutionDeckContent({
  solution,
  className = "",
  onStepChange,
  onClose,
}: InteractiveSolutionDeckProps) {
  const steps = solution.steps || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showKeyFormula, setShowKeyFormula] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const hasSteps = steps.length > 0;
  const currentStep = hasSteps ? steps[currentSlide] : null;

  // Notify parent on step change
  useEffect(() => {
    if (onStepChange && hasSteps) {
      onStepChange(currentSlide, steps.length);
    }
  }, [currentSlide, hasSteps, steps.length, onStepChange]);

  const goToSlide = (targetIndex: number) => {
    if (targetIndex === currentSlide || targetIndex < 0 || targetIndex >= steps.length) {
      return;
    }
    setCurrentSlide(targetIndex);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, Math.max(steps.length - 1, 0)));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  // Keyboard navigation support (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(prev + 1, Math.max(steps.length - 1, 0)));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [steps.length]);

  return (
    <div
      className={`rounded-2xl border border-border bg-surface shadow-xs overflow-hidden ${className}`}
    >
      {/* ============================================================
          VIDEO-STYLE SLIDE PROGRESS BAR
          ============================================================ */}
      <div className="h-1.5 w-full bg-blue-100/60 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / (steps.length || 1)) * 100}%` }}
        />
      </div>

      {/* ============================================================
          TOP STEP NAVIGATION BAR (Tabs + Formula Icon + Chevrons + Close)
          ============================================================ */}
      <div className="p-3 sm:px-5 bg-surface-muted/40 border-b border-border flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Step Chips on Left */}
        {hasSteps && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {steps.map((st, idx) => {
              const isActive = idx === currentSlide;
              const isCompleted = idx < currentSlide;
              const categoryLabel = (st.category || `Langkah ${st.stepNumber}`)
                .replace(/_/g, " ")
                .toLowerCase();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-primary text-on-primary shadow-xs"
                      : isCompleted
                      ? "bg-surface text-text border border-border hover:border-blue-400"
                      : "bg-surface/50 text-text-muted hover:text-text border border-transparent"
                  }`}
                  title={`Lompat ke langkah ${idx + 1}`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white text-primary"
                        : isCompleted
                        ? "bg-blue-100 text-blue-700"
                        : "bg-border text-text-muted"
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                  </span>
                  <span className="capitalize">{categoryLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Action controls on Right */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Rumus Kunci Click-to-view icon (pake icon aja, gausah ditulis teksnya) */}
          {solution.keyFormula && (
            <button
              type="button"
              onClick={() => setShowKeyFormula((prev) => !prev)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-all cursor-pointer ${
                showKeyFormula
                  ? "bg-primary text-on-primary border-primary shadow-2xs"
                  : "border-border bg-surface text-text-muted hover:text-text hover:bg-surface-muted hover:border-blue-400"
              }`}
              title={showKeyFormula ? "Sembunyikan Rumus" : "Lihat Rumus"}
              aria-label="Lihat Rumus"
            >
              <Sigma className="w-4 h-4" />
            </button>
          )}

          {/* Close button X */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted hover:text-text hover:bg-surface hover:border-text transition-colors cursor-pointer"
              aria-label="Tutup Pembahasan"
              title="Tutup Pembahasan"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Click-to-view Formula Dropdown / Collapsible */}
      {solution.keyFormula && showKeyFormula && (
        <div className="mx-5 sm:mx-8 mt-4 p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/70 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-blue-200/50">
            <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-blue-100 text-blue-700">
              <Sigma className="w-4 h-4" />
            </span>
            <button
              type="button"
              onClick={() => setShowKeyFormula(false)}
              className="text-blue-700 hover:text-blue-900 p-1 rounded-md cursor-pointer"
              title="Tutup Rumus"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            className="text-sm sm:text-base font-mono text-blue-950 overflow-x-auto py-2 text-center"
            dangerouslySetInnerHTML={{
              __html: renderMathContent(solution.keyFormula, {
                animatedHighlights: false,
              }),
            }}
          />
        </div>
      )}

      {/* ============================================================
          CURRENT STEP CARD BODY (SWIPEABLE ON MOBILE + ICON-ONLY STEPPER)
          ============================================================ */}
      <div
        className="p-5 sm:p-6 flex flex-col gap-4"
        onTouchStart={(e) => {
          if (e.touches.length !== 1) return;
          if ((e.target as HTMLElement | null)?.closest('.step-math-card')) {
            touchStartRef.current = null;
            return;
          }
          const t = e.touches[0];
          touchStartRef.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touchStartRef.current;
          touchStartRef.current = null;
          if (!start || e.changedTouches.length !== 1 || !hasSteps) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            if (dx < 0) handleNext();
            else handlePrev();
          }
        }}
      >
        <div>
          {hasSteps && currentStep ? (
            <div
              key={currentSlide}
              className="space-y-2.5 animate-write-in"
            >
              {/* Step Title */}
              <h3 className="text-base sm:text-lg font-extrabold text-text tracking-tight leading-snug m-0">
                {currentStep.title}
              </h3>

              {/* Step Content: Balanced reading scale matching Card Soal */}
              <div
                className="text-sm sm:text-[15px] text-text-body leading-relaxed space-y-2.5 whitespace-pre-wrap font-sans"
                dangerouslySetInnerHTML={{
                  __html: renderMathContent(currentStep.content, {
                    animatedHighlights: true,
                  }),
                }}
              />
            </div>
          ) : solution.staticContent ? (
            <div
              className="text-sm sm:text-[15px] text-text-body leading-relaxed space-y-2.5 whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{
                __html: renderMathContent(solution.staticContent, {
                  animatedHighlights: false,
                }),
              }}
            />
          ) : (
            <div className="p-5 rounded-xl bg-surface-muted border border-border text-sm text-text-muted italic">
              Belum ada langkah bertahap untuk soal ini.
            </div>
          )}
        </div>

        {/* ============================================================
            Companion Card: Trik Cepat (Hanya tampil di slide kesimpulan / akhir)
            ============================================================ */}
        {solution.quickTrick && (!hasSteps || currentSlide === steps.length - 1) && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50/80 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-yellow-900 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-600 fill-yellow-500" /> Trik Cepat
            </div>
            <div
              className="text-xs sm:text-sm text-yellow-950 font-medium leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: renderMathContent(solution.quickTrick, {
                  animatedHighlights: false,
                }),
              }}
            />
          </div>
        )}

        {/* Icon-Only Bottom Step Navigation (Progress Dots + ArrowLeft + Primary ArrowRight Pill) */}
        {hasSteps && steps.length > 1 && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1" role="tablist" aria-label="Progres langkah pembahasan">
              {steps.map((st, idx) => {
                const isActive = idx === currentSlide;
                const isCompleted = idx < currentSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Langkah ${idx + 1}: ${st.category || st.title}`}
                    title={`Langkah ${idx + 1}: ${st.category || st.title}`}
                    className="py-1.5 px-0.5 flex items-center justify-center cursor-pointer focus:outline-none group"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all duration-200 ${
                        isActive
                          ? "w-6 bg-primary"
                          : isCompleted
                          ? "w-2 bg-primary/45 group-hover:bg-primary/70"
                          : "w-2 bg-border group-hover:bg-text-muted/60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentSlide === 0}
                aria-label="Langkah sebelumnya"
                title="Langkah sebelumnya"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-surface-muted hover:border-blue-400 disabled:opacity-30 disabled:hover:border-border disabled:hover:bg-surface disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 stroke-[2.25]" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentSlide >= steps.length - 1}
                aria-label="Langkah selanjutnya"
                title="Langkah selanjutnya"
                className="flex h-10 w-12 items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-on-primary shadow-xs disabled:opacity-30 disabled:bg-surface-muted disabled:text-text-muted disabled:border disabled:border-border disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
              >
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InteractiveSolutionDeck;
