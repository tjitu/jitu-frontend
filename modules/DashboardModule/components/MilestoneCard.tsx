"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Circle, Trophy } from "lucide-react";

export interface MilestoneStep {
  id: string;
  label: string;
  done: boolean;
  href: string;
  actionLabel: string;
}

export interface MilestonePhase {
  phase: number;
  steps: MilestoneStep[];
}

interface MilestoneCardProps {
  hasTarget: boolean;
  dailyCompleted: boolean;
  registeredTryoutsCount: number;
  finishedTryoutsCount: number;
  solvedQuestions: number;
  currentStreak: number;
  bestScore: number | null;
  onOpenScoreHistory?: () => void;
}

export function MilestoneCard({
  hasTarget,
  dailyCompleted,
  registeredTryoutsCount,
  finishedTryoutsCount,
  solvedQuestions,
  currentStreak,
  bestScore,
}: MilestoneCardProps) {
  const phases: MilestonePhase[] = useMemo(
    () => [
      {
        phase: 1,
        steps: [
          {
            id: "f1-target",
            label: "Tentukan target PTN & jurusan",
            done: hasTarget,
            href: "/profile",
            actionLabel: "Atur target",
          },
          {
            id: "f1-warmup",
            label: "Selesaikan pemanasan soal hari ini",
            done: dailyCompleted || solvedQuestions >= 1,
            href: "/latihan",
            actionLabel: "Kerjakan",
          },
          {
            id: "f1-tryout",
            label: "Daftar tryout gratis pertamamu",
            done: registeredTryoutsCount > 0,
            href: "#jadwal-tryout",
            actionLabel: "Pilih jadwal",
          },
        ],
      },
      {
        phase: 2,
        steps: [
          {
            id: "f2-10q",
            label: "Selesaikan 10 soal latihan atau tryout",
            done: solvedQuestions >= 10,
            href: "/latihan",
            actionLabel: `${Math.min(solvedQuestions, 10)}/10`,
          },
          {
            id: "f2-streak3",
            label: "Raih streak belajar 3 hari beruntun",
            done: currentStreak >= 3,
            href: "/latihan",
            actionLabel: `${Math.min(currentStreak, 3)}/3 hr`,
          },
          {
            id: "f2-to1",
            label: "Tuntaskan 1 tryout hingga keluar IRT",
            done: finishedTryoutsCount >= 1,
            href: "/tryout",
            actionLabel: "Kerjakan",
          },
        ],
      },
      {
        phase: 3,
        steps: [
          {
            id: "f3-50q",
            label: "Selesaikan 50 soal terkurasi",
            done: solvedQuestions >= 50,
            href: "/arsip-soal",
            actionLabel: `${Math.min(solvedQuestions, 50)}/50`,
          },
          {
            id: "f3-streak7",
            label: "Raih streak belajar 7 hari beruntun",
            done: currentStreak >= 7,
            href: "/latihan",
            actionLabel: `${Math.min(currentStreak, 7)}/7 hr`,
          },
          {
            id: "f3-irt600",
            label: "Capai skor IRT terbaik minimal 600",
            done: (bestScore ?? 0) >= 600,
            href: "/tryout",
            actionLabel: `${bestScore ?? 0}/600`,
          },
        ],
      },
      {
        phase: 4,
        steps: [
          {
            id: "f4-150q",
            label: "Tuntaskan 150 soal UTBK",
            done: solvedQuestions >= 150,
            href: "/arsip-soal",
            actionLabel: `${Math.min(solvedQuestions, 150)}/150`,
          },
          {
            id: "f4-to3",
            label: "Selesaikan minimal 3 tryout SNBT",
            done: finishedTryoutsCount >= 3,
            href: "/tryout",
            actionLabel: `${Math.min(finishedTryoutsCount, 3)}/3`,
          },
          {
            id: "f4-irt700",
            label: "Capai skor IRT terbaik minimal 700",
            done: (bestScore ?? 0) >= 700,
            href: "/tryout",
            actionLabel: `${bestScore ?? 0}/700`,
          },
        ],
      },
    ],
    [
      hasTarget,
      dailyCompleted,
      registeredTryoutsCount,
      finishedTryoutsCount,
      solvedQuestions,
      currentStreak,
      bestScore,
    ]
  );

  // Automatically advance to the first phase that doesn't have all 3 steps checked
  const unlockedPhaseIndex = useMemo(() => {
    const idx = phases.findIndex((p) => !p.steps.every((s) => s.done));
    return idx === -1 ? phases.length - 1 : idx;
  }, [phases]);

  const [selectedPhaseIndex, setSelectedPhaseIndex] =
    useState<number>(unlockedPhaseIndex);

  useEffect(() => {
    setSelectedPhaseIndex(unlockedPhaseIndex);
  }, [unlockedPhaseIndex]);

  const activePhase = phases[selectedPhaseIndex] || phases[0];
  const completedCount = activePhase.steps.filter((s) => s.done).length;

  return (
    <div className="bg-surface rounded-lg border border-border p-5 space-y-4 flex-1 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Card Header (matching Hot Question of the Day above) */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-label text-text-muted">
            <Trophy className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
            <span>Milestone</span>
          </div>
          <span className="text-[12px] text-text-muted tabular-nums">
            {completedCount}/{activePhase.steps.length} selesai
          </span>
        </div>

        {/* 3 Milestone Steps */}
        <div className="space-y-2">
          {activePhase.steps.map((step) => (
            <Link
              key={step.id}
              href={step.href}
              className="p-2.5 rounded-md border border-border bg-surface-muted/50 hover:border-blue-300 flex items-center justify-between gap-3 transition-colors"
            >
              <span className="inline-flex items-center gap-2.5 text-[13px] font-medium text-text min-w-0">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-ink-300 shrink-0" />
                )}
                <span
                  className={`truncate ${
                    step.done ? "line-through text-text-muted" : ""
                  }`}
                >
                  {step.label}
                </span>
              </span>
              <span
                className={`text-[12px] font-semibold shrink-0 tabular-nums ${
                  step.done ? "text-emerald-700" : "text-primary"
                }`}
              >
                {step.done ? "Selesai" : "Kerjakan"}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pure Visual Milestone Track (No text, signals ongoing progression) */}
      <div
        className="pt-2.5 border-t border-ink-100/80 flex items-center gap-1.5"
        aria-label={`Milestone tahap ${activePhase.phase} dari ${phases.length}`}
      >
        {phases.map((p, idx) => {
          const phaseDone = p.steps.every((s) => s.done);
          const phaseDoneCount = p.steps.filter((s) => s.done).length;
          const isUnlocked = idx <= unlockedPhaseIndex;
          const isSelected = idx === selectedPhaseIndex;
          const isCurrentUnlocked = idx === unlockedPhaseIndex;

          const connectorPercent = phaseDone
            ? 100
            : isCurrentUnlocked
              ? Math.round((phaseDoneCount / p.steps.length) * 100)
              : 0;

          return (
            <React.Fragment key={p.phase}>
              <button
                type="button"
                disabled={!isUnlocked}
                onClick={() => setSelectedPhaseIndex(idx)}
                aria-label={`Tahap ${p.phase}`}
                className={`shrink-0 rounded-full inline-flex items-center justify-center transition-all ${
                  phaseDone
                    ? `w-5 h-5 bg-emerald-500 text-white cursor-pointer ${
                        isSelected ? "ring-2 ring-emerald-200" : "hover:opacity-90"
                      }`
                    : isSelected
                      ? "w-5 h-5 bg-blue-50 border-2 border-primary cursor-pointer"
                      : isUnlocked
                        ? "w-4 h-4 bg-blue-100 border border-primary/40 cursor-pointer hover:border-primary"
                        : "w-3.5 h-3.5 bg-surface-muted border border-ink-200 cursor-default"
                }`}
              >
                {phaseDone ? (
                  <Check className="w-3 h-3 stroke-[2.75]" />
                ) : isSelected ? (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                ) : null}
              </button>

              {idx < phases.length - 1 ? (
                <div className="flex-1 h-[2px] rounded-full bg-ink-100 overflow-hidden">
                  <div
                    style={{ width: `${connectorPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      phaseDone ? "bg-emerald-500" : "bg-primary"
                    }`}
                  />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}

        {/* Continuing trail dots to show there are still more milestones ahead */}
        <div
          aria-hidden="true"
          className="flex items-center gap-1 pl-1 shrink-0"
        >
          <span className="w-2.5 h-[2px] rounded-full bg-ink-200/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-ink-200/80" />
          <span className="w-1 h-1 rounded-full bg-ink-200/50" />
          <span className="w-1 h-1 rounded-full bg-ink-200/25" />
        </div>
      </div>
    </div>
  );
}
