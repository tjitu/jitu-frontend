"use client";

import React from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  XCircle,
  BookOpen,
} from "lucide-react";
import type { PracticeHistoryItem } from "@/lib/practice-store";
import InteractiveSolutionDeck, {
  renderMathContent,
} from "@/components/interactive-solution-deck";

interface PracticeHistoryRowProps {
  item: PracticeHistoryItem;
  isOpen: boolean;
  onToggle: () => void;
}

export function PracticeHistoryRow({ item, isOpen, onToggle }: PracticeHistoryRowProps) {
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-surface-muted/30 transition-colors"
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
              {item.subtest.replace(/_/g, " ")}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-surface-muted text-text-muted text-[11px] font-semibold">
              {item.difficulty}
            </span>
            {item.isRevealOnly ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                <BookOpen className="w-3 h-3" /> Pembahasan
              </span>
            ) : item.isCorrect ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> Benar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                <XCircle className="w-3 h-3" /> Kurang Tepat
              </span>
            )}
            <span className="text-[11px] text-text-muted ml-auto sm:ml-0">
              {new Date(item.answeredAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div
            className="text-sm text-text line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: renderMathContent(item.content, { animatedHighlights: false }),
            }}
          />

          {item.topicTitle && (
            <div className="text-xs text-text-muted">
              Materi: <strong className="text-text">{item.topicTitle}</strong>
              {item.subtopicTitle ? ` › ${item.subtopicTitle}` : ""}
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary pt-1">
          <span>{isOpen ? "Tutup" : "Lihat Bahas"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border p-4 sm:p-6 bg-surface-muted/20 space-y-5">
          {item.narration && (
            <div
              className="p-4 rounded-xl bg-surface border border-border text-sm text-text-body leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: renderMathContent(item.narration, { animatedHighlights: false }),
              }}
            />
          )}

          <div
            className="text-sm sm:text-base font-medium text-text leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: renderMathContent(item.content, { animatedHighlights: false }),
            }}
          />

          {item.options.length > 0 ? (
            <div className="space-y-2">
              {item.options.map((opt, idx) => {
                const isUserChoice = item.selectedOptionId === opt.id;
                const isKey = opt.isCorrect;
                return (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-xl border text-sm flex items-start gap-3 ${
                      isKey
                        ? "border-emerald-400 bg-emerald-50/70 text-emerald-950 font-semibold"
                        : isUserChoice
                        ? "border-rose-300 bg-rose-50/70 text-rose-900"
                        : "border-border bg-surface text-text-body"
                    }`}
                  >
                    <span className="font-bold shrink-0">{letters[idx] || idx + 1}.</span>
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: renderMathContent(opt.content, { animatedHighlights: false }),
                      }}
                    />
                    {isKey && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                    {!isKey && isUserChoice && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-surface border border-border text-sm space-y-1">
              <div>
                Jawaban Kamu:{" "}
                <strong className={item.isCorrect ? "text-emerald-600" : "text-rose-600"}>
                  {item.inputText || "(Tidak menjawab)"}
                </strong>
              </div>
              <div>
                Kunci Jawaban:{" "}
                <strong className="text-emerald-700">{item.correctAnswerText || "-"}</strong>
              </div>
            </div>
          )}

          {item.solution ? (
            <InteractiveSolutionDeck solution={item.solution} />
          ) : (
            <div className="p-4 rounded-xl border border-border bg-surface text-xs text-text-muted italic">
              Pembahasan detail untuk soal ini sedang dilengkapi oleh tim akademik.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
