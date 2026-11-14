"use client";

import React from "react";
import Link from "next/link";
import { Lock, BookOpen, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { TryoutDetail } from "../interface";
import type { LeaderboardData } from "@/lib/api/tryout";
import type { PtnTargets } from "@/lib/target";

interface TryoutResultSummaryProps {
  tryoutData: TryoutDetail;
  isUnlocked: boolean;
  cost: number;
  finalScore: number;
  userBalance: number;
  onUnlockClick: () => void;
  onStart: () => void;
  leaderboardData?: LeaderboardData | null;
  targets?: PtnTargets | null;
}

export function TryoutResultSummary({
  tryoutData,
  isUnlocked,
  cost,
  finalScore,
  userBalance,
  onUnlockClick,
  onStart,
  leaderboardData,
  targets,
}: TryoutResultSummaryProps) {
  const nationalRank = leaderboardData?.currentUserRank?.rank ?? 1;

  const p1Choice = targets?.pilihan1;
  const p1Label = p1Choice
    ? `${p1Choice.acronym || p1Choice.university} · ${p1Choice.jurusan}`
    : "UI · Pendidikan Dokter";
  const p1Rank = 1;

  const p2Choice = targets?.pilihan2;
  const p2Label = p2Choice
    ? `${p2Choice.acronym || p2Choice.university} · ${p2Choice.jurusan}`
    : "ITB · Teknik Informatika";
  const p2Rank = 1;

  const p3Choice = targets?.pilihan3;
  const p3Label = p3Choice
    ? `${p3Choice.acronym || p3Choice.university} · ${p3Choice.jurusan}`
    : null;
  const p3Rank = 1;

  if (!isUnlocked) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 stroke-[2]" />
            <span>Pembahasan Terkunci</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-text">
              Buka Hasil &amp; Pembahasan
            </h3>
            <p className="text-sm text-text-body leading-relaxed">
              Gunakan {cost} coin untuk membuka skor dan pembahasan lengkap {tryoutData.title}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onUnlockClick}
              className="inline-flex items-center gap-2"
            >
              <PixelCoin size={16} />
              <span>Buka Pembahasan · {cost} coin</span>
            </Button>

            {userBalance < cost ? (
              <Link
                href="/shop"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Beli coin di Shop →
              </Link>
            ) : (
              <span className="text-xs text-text-muted flex items-center gap-1.5">
                <PixelCoin size={12} />
                <span>Saldo kamu: {userBalance} coin</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Skor IRT
            </span>
          </div>
          <div className="font-mono text-4xl sm:text-5xl font-extrabold text-primary tabular-nums">
            {finalScore}
          </div>

          {/* Ranking Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Peringkat Nasional #{nationalRank}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pilihan 1: #{p1Rank} {p1Label}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
              <Target className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Pilihan 2: #{p2Rank} {p2Label}</span>
            </span>
            {p3Label && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                <Target className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Pilihan 3: #{p3Rank} {p3Label}</span>
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            className="w-full sm:w-auto font-semibold flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lihat Pembahasan Lengkap</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
