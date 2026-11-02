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

  // 1. Replace block math $$...$$
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="step-math-card my-3 py-2.5 px-3 rounded-xl bg-surface-muted/70 border border-border text-center overflow-x-auto">${rendered}</div>`;
    } catch {
      return `<div class="step-math-card my-3 py-2.5 px-3 rounded-xl bg-surface-muted/70 border border-border font-mono text-center overflow-x-auto">$$${math}$$</div>`;
    }
  });

  // 2. Replace inline math $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return `<span class="inline-math font-mono text-text">${katex.renderToString(
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
    `<div class="flex items-start gap-2.5 p-3 my-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 font-bold text-xs sm:text-[13px] leading-snug">
      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] mt-0.5">✓</span>
      <div class="flex-1">$1</div>
    </div>`
  );

  // 4. Blockquotes > ...
  processed = processed.replace(
    /^>\s*(.*?)$/gm,
    `<blockquote class="border-l-3 border-primary/70 pl-3 py-1.5 my-2.5 bg-blue-50/40 rounded-r-lg text-xs sm:text-[13px] text-text-body italic leading-relaxed">$1</blockquote>`
  );

  // 5. Convert bold markdown **text**
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

  const hasSteps = steps.length > 0;
  const currentStep = hasSteps ? steps[currentSlide] : null;

  // Reset to slide 0 when solution changes
  useEffect(() => {
    setCurrentSlide(0);
    setDirection("next");
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

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
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
          Minimalist Header (design.md: Quiet Chrome, Loud Content)
          ============================================================ */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-primary">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text m-0">Pembahasan Interaktif</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                Interactive Deck
              </span>
            </div>
            <p className="text-[11px] text-text-muted m-0 mt-0.5">
              Langkah terstruktur dengan highlight konsep kunci otomatis
            </p>
          </div>
        </div>

        {/* Quick Stepper Counter, Prev/Next chevrons & Optional Close button */}
        <div className="flex items-center gap-2 shrink-0">
          {hasSteps && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-md bg-surface-muted text-text-body border border-border">
                {currentSlide + 1} / {steps.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Langkah sebelumnya"
                  title="Langkah sebelumnya (◀)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentSlide >= steps.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Langkah selanjutnya"
                  title="Langkah selanjutnya (▶)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-muted hover:border-text transition-colors cursor-pointer ml-0.5"
              aria-label="Tutup Pembahasan"
              title="Tutup Pembahasan"
            >
              <span>Tutup</span>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          Horizontal Step Chips Roadmap / Tabs
          ============================================================ */}
      {hasSteps && (
        <div className="px-4 py-2.5 bg-surface-muted/40 border-b border-border flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-primary text-on-primary shadow-2xs"
                    : isCompleted
                    ? "bg-surface text-text border border-border hover:border-blue-300"
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

      {/* ============================================================
          Current Step Card Body (Direction-Aware Slide + Animated Highlights)
          ============================================================ */}
      <div className="p-5 sm:p-6 space-y-4">
        {hasSteps && currentStep ? (
          <div
            key={currentSlide}
            className={`space-y-3.5 ${
              direction === "next" ? "animate-step-enter-right" : "animate-step-enter-left"
            }`}
          >
            {/* Step Category Badge & Progress Header */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {currentStep.category || `Langkah ${currentStep.stepNumber}`}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  Langkah {currentStep.stepNumber} dari {steps.length}
                </span>
              </div>
              <span className="text-[11px] text-text-muted font-medium hidden sm:inline">
                Tekan ◀ ▶ di keyboard
              </span>
            </div>

            {/* Step Title */}
            <h4 className="text-base font-bold text-text leading-snug m-0">
              {currentStep.title}
            </h4>

            {/* Step Content: KaTeX + Animated Highlighter Pen Effect */}
            <div
              className="text-sm text-text-body leading-relaxed space-y-2 whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{
                __html: renderMathContent(currentStep.content, {
                  animatedHighlights: true,
                }),
              }}
            />
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-muted border border-border text-xs text-text-muted italic">
            Belum ada langkah bertahap untuk soal ini.
          </div>
        )}

        {/* ============================================================
            Companion Cards: Rumus Kunci & Trik Jitu
            ============================================================ */}
        <div className="space-y-3 pt-2">
          {solution.keyFormula && (
            <div className="rounded-xl border border-border bg-surface-muted/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text mb-1.5">
                <span className="text-sm">📐</span> Rumus Kunci & Konsep
              </div>
              <div
                className="text-xs font-mono text-text-body overflow-x-auto py-1"
                dangerouslySetInnerHTML={{
                  __html: renderMathContent(solution.keyFormula, {
                    animatedHighlights: false,
                  }),
                }}
              />
            </div>
          )}

          {solution.quickTrick && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50/70 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-900 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-600 fill-yellow-500" /> Trik Jitu Cepat
              </div>
              <p className="text-xs sm:text-[13px] text-yellow-950 font-medium leading-relaxed m-0">
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
              <div className="mt-2.5 p-3.5 rounded-xl bg-surface-muted border border-border text-xs sm:text-sm text-text-body leading-relaxed whitespace-pre-wrap">
                {solution.staticContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          Bottom Slide Action Bar
          ============================================================ */}
      {hasSteps && (
        <div className="bg-surface-muted/50 border-t border-border px-5 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="inline-flex items-center gap-1 text-xs font-semibold text-text hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === currentSlide
                    ? "w-6 bg-primary"
                    : idx < currentSlide
                    ? "w-1.5 bg-blue-300"
                    : "w-1.5 bg-border hover:bg-text-muted"
                }`}
                title={`Langkah ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentSlide >= steps.length - 1}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Selanjutnya <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
