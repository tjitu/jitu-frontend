"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, Sparkles, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import katex from "katex";
import type { SolutionStep, QuestionSolutionData } from "@/lib/practice-store";

interface InteractiveSolutionDeckProps {
  solution: QuestionSolutionData;
  className?: string;
  autoFocus?: boolean;
}

export function renderMathContent(content: string): string {
  if (!content) return "";

  // Replace block math $$...$$
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="katex-block my-3 overflow-x-auto py-1 text-center">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `$$${math}$$`;
    }
  });

  // Replace inline math $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });

  // Convert bold markdown **text** to <strong>
  processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return processed;
}

export function InteractiveSolutionDeck({
  solution,
  className = "",
}: InteractiveSolutionDeckProps) {
  const steps = solution.steps || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullStatic, setShowFullStatic] = useState(false);

  const hasSteps = steps.length > 0;
  const currentStep = hasSteps ? steps[currentSlide] : null;

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(steps.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [steps.length]);

  return (
    <div className={`rounded-xl border border-blue-200 bg-surface shadow-sm overflow-hidden ${className}`}>
      {/* Top Deck Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/25 border border-blue-400/40 text-blue-200">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white m-0">
                  Interactive Solution Deck
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-[10px] font-semibold border border-blue-400/30">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-300" /> Deck Mode
                </span>
              </div>
              <p className="text-[12px] text-blue-200/80 m-0 mt-0.5">
                Pelajari langkah penyelesaian bertahap & konsep kunci secara interaktif.
              </p>
            </div>
          </div>

          {/* Slide Indicator & Nav */}
          {hasSteps && (
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-white/10 text-blue-100 border border-white/15">
                Slide {currentSlide + 1} / {steps.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => Math.min(steps.length - 1, prev + 1))}
                  disabled={currentSlide >= steps.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Slide selanjutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slide Progress Bar */}
        {hasSteps && (
          <div className="mt-3.5 flex items-center gap-1.5 w-full">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? "bg-yellow-400 shadow-sm"
                    : idx < currentSlide
                    ? "bg-blue-300/80"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                title={`Lompat ke langkah ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Slide Card Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {hasSteps && currentStep ? (
          <div className="rounded-xl border border-border bg-surface-muted/40 p-5 space-y-3.5 shadow-sm">
            {/* Step Category & Step Number */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  {currentStep.category || `Langkah ${currentStep.stepNumber}`}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  Langkah {currentStep.stepNumber} dari {steps.length}
                </span>
              </div>
              <div className="text-[11px] text-text-muted hidden sm:block">
                Gunakan panah ◀ ▶ keyboard untuk navigasi
              </div>
            </div>

            {/* Step Title */}
            <h4 className="text-base sm:text-[17px] font-bold text-text leading-snug">
              {currentStep.title}
            </h4>

            {/* Step Content */}
            <div
              className="text-[14px] sm:text-[15px] text-text-body leading-relaxed space-y-2 whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{
                __html: renderMathContent(currentStep.content),
              }}
            />
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-surface-muted border border-border text-xs text-text-muted italic">
            Belum ada slide bertahap untuk soal ini.
          </div>
        )}

        {/* Companion Quick Tricks & Key Formula Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {solution.keyFormula && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                <span className="text-sm">📐</span> Rumus Kunci & Konsep
              </div>
              <div
                className="text-xs text-purple-950 font-mono overflow-x-auto py-1"
                dangerouslySetInnerHTML={{
                  __html: renderMathContent(solution.keyFormula),
                }}
              />
            </div>
          )}

          {solution.quickTrick && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Trik Jitu & Pola Cepat
              </div>
              <p className="text-xs sm:text-[13px] text-amber-950 leading-relaxed m-0 font-medium">
                {solution.quickTrick}
              </p>
            </div>
          )}
        </div>

        {/* Fallback / Full Conventional Static Explanation Toggle */}
        {solution.staticContent && (
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setShowFullStatic((prev) => !prev)}
              className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer py-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showFullStatic ? "Sembunyikan Versi Teks Lengkap" : "Lihat Pembahasan Versi Teks Lengkap (Konvensional)"}
            </button>

            {showFullStatic && (
              <div className="mt-3 p-4 rounded-lg bg-surface-muted border border-border text-xs sm:text-sm text-text-body leading-relaxed whitespace-pre-wrap">
                {solution.staticContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Slide Action Bar */}
      {hasSteps && (
        <div className="bg-surface-muted border-t border-border px-5 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Langkah Sebelumnya
          </button>

          <span className="text-[12px] font-medium text-text-muted">
            {currentSlide + 1} dari {steps.length} langkah
          </span>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentSlide >= steps.length - 1}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Langkah Selanjutnya <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

