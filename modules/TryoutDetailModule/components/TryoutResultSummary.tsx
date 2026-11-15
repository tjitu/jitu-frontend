"use client";

import React from "react";
import Link from "next/link";
import { Lock, Trophy, Target, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { UniversityLogo } from "@/components/UniversityLogo";
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
  onStart?: () => void;
  leaderboardData?: LeaderboardData | null;
  targets?: PtnTargets | null;
}

export function TryoutResultSummary({
  tryoutData,
  isUnlocked,
  cost,
  userBalance,
  onUnlockClick,
  leaderboardData,
  targets,
}: TryoutResultSummaryProps) {
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

  const currentUser = leaderboardData?.currentUserRank;
  const nationalRank = currentUser?.rank ?? 1;
  const totalNational =
    currentUser?.totalParticipants ??
    (tryoutData.participants > 0 ? tryoutData.participants : 1);

  const choice1Data = currentUser?.choice1;
  const p1 = choice1Data || targets?.pilihan1;
  const p1Rank = choice1Data?.rank ?? nationalRank;
  const p1Total = choice1Data?.totalParticipants ?? totalNational;

  return (
    <div className="bg-yellow-400 dark:bg-yellow-400 text-black dark:text-black rounded-2xl border border-yellow-500/50 px-4 py-3 sm:px-6 sm:py-3.5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Stats: Peringkat Nasional & Peringkat Pil 1 */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-black/15">
          {/* Peringkat Nasional */}
          <div className="flex items-center gap-3">
            <div className="size-8 sm:size-9 rounded-full bg-black/10 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-black/75">
                Peringkat Nasional
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl sm:text-2xl font-black text-black tabular-nums">
                  #{nationalRank}
                </span>
                <span className="text-xs font-semibold text-black/70">
                  / {totalNational} peserta
                </span>
              </div>
            </div>
          </div>

          {/* Peringkat Pilihan 1 */}
          <div className="pt-2 md:pt-0 md:pl-6 flex items-center gap-3">
            {p1 && (p1.acronym || p1.university) ? (
              <>
                <UniversityLogo
                  logo={p1.logo}
                  acronym={p1.acronym}
                  name={p1.university}
                  size={32}
                  className="rounded-full bg-white p-0.5 border border-black/15 shrink-0 shadow-2xs"
                />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-black/75 flex items-center gap-1.5">
                    <span>Pilihan 1 · {p1.acronym || p1.university}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-black truncate max-w-[150px] sm:max-w-[220px]">
                      {p1.jurusan || "Semua Jurusan"}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-black tabular-nums">
                      #{p1Rank}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-black/70">
                      / {p1Total} peminat
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-black/80" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-black/75">
                    Pilihan 1
                  </div>
                  <Link
                    href="/profile"
                    className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                  >
                    <span>Atur target di profil</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Opsi View Full Leaderboard */}
        <div className="shrink-0 flex items-center pt-1 md:pt-0">
          <Link
            href={`/tryout/${tryoutData.id}/leaderboard`}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-black hover:bg-neutral-900 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer group"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Lihat Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
