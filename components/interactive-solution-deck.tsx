"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  Check,
  X,
  Sigma,
} from "lucide-react";
import katex from "katex";
import type { SolutionStep, QuestionSolutionData } from "@/lib/practice-store";

export interface RenderMathOptions {
  animatedHighlights?: boolean;
}

export function renderMathContent(
  content: string,
  options: RenderMathOptions = {}
): string {
  if (!content) return "";

  const { animatedHighlights = false } = options;

  // 1. Replace block math $$...$$ with prominent, cinematic math card
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="step-math-card my-5 py-4 px-5 rounded-2xl bg-surface-muted/90 border border-primary/25 text-center overflow-x-auto text-lg sm:text-xl md:text-2xl shadow-xs">${rendered}</div>`;
    } catch {
      return `<div class="step-math-card my-5 py-4 px-5 rounded-2xl bg-surface-muted/90 border border-primary/25 font-mono text-center overflow-x-auto text-lg">$$${math}$$</div>`;
    }
  });

  // 2. Replace inline math $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return `<span class="inline-math font-mono text-text font-bold px-1.5 py-0.5 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50">${katex.renderToString(
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
    `<div class="flex items-start gap-3 p-4 sm:p-5 my-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 text-emerald-950 font-bold text-base sm:text-lg leading-snug shadow-2xs">
      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs mt-0.5">✓</span>
      <div class="flex-1">$1</div>
    </div>`
  );

  // 4. Blockquotes > ...
  processed = processed.replace(
    /^>\s*(.*?)$/gm,
    `<blockquote class="border-l-4 border-primary pl-4 py-2.5 my-3.5 bg-blue-50/50 rounded-r-xl text-base sm:text-lg text-text-body italic leading-relaxed">$1</blockquote>`
  );

  // 5. Convert bold markdown **text** with marker sweep animation
  if (animatedHighlights) {
    processed = processed.replace(
      /\*\*(.*?)\*\*/g,
      `<mark class="step-highlight-animated">$1</mark>`
    );
  } else {
    processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  }

  return processed;
}

interface InteractiveSolutionDeckProps {
  solution: QuestionSolutionData;
  className?: string;
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
  onClose?: () => void;
}

export function InteractiveSolutionDeck({
  solution,
  className = "",
  onStepChange,
  onClose,
}: InteractiveSolutionDeckProps) {
  const steps = solution.steps || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showFullStatic, setShowFullStatic] = useState(false);
  const [showKeyFormula, setShowKeyFormula] = useState(false);

  const hasSteps = steps.length > 0;
  const currentStep = hasSteps ? steps[currentSlide] : null;

  // Reset to slide 0 when solution changes
  useEffect(() => {
    setCurrentSlide(0);
    setDirection("next");
    setShowKeyFormula(false);
  }, [solution.id]);

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
    setDirection(targetIndex > currentSlide ? "next" : "prev");
    setCurrentSlide(targetIndex);
  };

  const handleNext = () => {
    if (currentSlide < steps.length - 1) {
      setDirection("next");
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection("prev");
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // Keyboard navigation support (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, steps.length]);

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

          {/* Stepper counter & navigation */}
          {hasSteps && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold px-2 py-1 rounded-md bg-surface text-text-body border border-border">
                {currentSlide + 1}/{steps.length}
              </span>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Langkah sebelumnya"
                title="Langkah sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentSlide >= steps.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Langkah selanjutnya"
                title="Langkah selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Close button X */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted hover:text-text hover:bg-surface hover:border-text transition-colors cursor-pointer ml-1"
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
          CURRENT STEP CARD BODY (LARGE, CINEMATIC VIDEO-EXPLAINER FEEL)
          ============================================================ */}
      <div className="p-6 sm:p-8 lg:p-9 space-y-6">
        {hasSteps && currentStep ? (
          <div
            key={currentSlide}
            className="space-y-5 animate-write-in"
          >
            {/* Step Category Badge & Progress Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {currentStep.category || `Langkah ${currentStep.stepNumber}`}
                </span>
                <span className="text-sm font-semibold text-text-muted">
                  Langkah {currentStep.stepNumber} dari {steps.length}
                </span>
              </div>
              <span className="text-xs text-text-muted font-medium hidden sm:inline">
                Tekan ◀ ▶ di keyboard
              </span>
            </div>

            {/* Step Title: Large, bold, video slide style */}
            <h3 className="text-xl sm:text-2xl lg:text-[25px] font-black text-text tracking-tight leading-snug m-0">
              {currentStep.title}
            </h3>

            {/* Step Content: Large, spacious font for video-explainer feel */}
            <div
              className="text-base sm:text-lg lg:text-[19px] text-text-body leading-relaxed space-y-4 whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{
                __html: renderMathContent(currentStep.content, {
                  animatedHighlights: true,
                }),
              }}
            />
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-muted border border-border text-sm text-text-muted italic">
            Belum ada langkah bertahap untuk soal ini.
          </div>
        )}

        {/* ============================================================
            Companion Cards: Rumus Kunci & Trik Jitu
            ============================================================ */}
        <div className="space-y-4 pt-2">
          {/* Rumus: bersifat click to view (gausah ditulis teksnya, pake icon aja) */}
          {solution.keyFormula && !showKeyFormula && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeyFormula(true)}
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-surface-muted/60 text-text-muted hover:text-text hover:bg-surface hover:border-blue-400 transition-colors cursor-pointer"
                title="Lihat Rumus"
                aria-label="Lihat Rumus"
              >
                <Sigma className="w-4 h-4" />
              </button>
            </div>
          )}

          {solution.keyFormula && showKeyFormula && (
            <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-blue-200/50">
                <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-blue-100 text-blue-700">
                  <Sigma className="w-4 h-4" />
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyFormula(false)}
                  className="text-text-muted hover:text-text p-1 rounded-md cursor-pointer"
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

          {/* Trik Jitu Cepat Companion Card */}
          {solution.quickTrick && (
            <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50/80 p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-sm font-bold text-yellow-900 mb-1.5">
                <Zap className="w-4 h-4 text-yellow-600 fill-yellow-500" /> Trik Jitu Cepat
              </div>
              <p className="text-sm sm:text-base text-yellow-950 font-medium leading-relaxed m-0">
                {solution.quickTrick}
              </p>
            </div>
          )}
        </div>

        {/* ============================================================
            Collapsible Full Conventional Text Solution Fallback
            ============================================================ */}
        {solution.staticContent && (
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setShowFullStatic((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer py-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showFullStatic
                ? "Sembunyikan Versi Teks Lengkap"
                : "Lihat Pembahasan Versi Teks Lengkap"}
            </button>

            {showFullStatic && (
              <div className="mt-2.5 p-4 rounded-xl bg-surface-muted border border-border text-sm text-text-body leading-relaxed whitespace-pre-wrap font-sans">
                {solution.staticContent}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            VIDEO PLAYER STYLE SLIDE CONTROLS FOOTER
            ============================================================ */}
        {hasSteps && (
          <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-bold text-text hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Langkah Sebelumnya
            </button>

            <div className="flex items-center gap-2">
              {currentSlide < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  Langkah Selanjutnya <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semua Langkah Selesai
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InteractiveSolutionDeck;
