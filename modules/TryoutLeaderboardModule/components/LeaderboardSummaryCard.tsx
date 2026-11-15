"use client";

import React from "react";
import { UniversityLogo } from "@/components/UniversityLogo";
import type { LeaderboardData } from "@/lib/api/tryout";

interface LeaderboardSummaryCardProps {
  leaderboardData: LeaderboardData | null;
  p1: any;
  totalParticipants: number;
}

export function LeaderboardSummaryCard({
  leaderboardData,
  p1,
  totalParticipants,
}: LeaderboardSummaryCardProps) {
  const currentUser = leaderboardData?.currentUserRank;
  if (!currentUser) return null;

  const nationalRank = currentUser.rank;
  const totalNational =
    currentUser.totalParticipants ??
    (totalParticipants > 0 ? totalParticipants : 1);

  const choice1Data = currentUser.choice1;
  const activeP1 = choice1Data || p1;
  const hasActiveP1 = Boolean(activeP1 && (activeP1.acronym || activeP1.university));
  const p1Rank = choice1Data?.rank ?? nationalRank;
  const p1Total = choice1Data?.totalParticipants ?? totalNational;

  return (
    <div className="bg-yellow-400 text-black rounded-2xl border border-yellow-500/50 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Identity & Score */}
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-black text-yellow-400 font-mono font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
            #{nationalRank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-black">
                {currentUser.name}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/10 text-black px-2 py-0.5 rounded-full">
                Peringkatmu
              </span>
            </div>
            <div className="text-xs sm:text-sm text-black/75 flex items-center gap-2">
              <span>
                Skor IRT:{" "}
                <strong className="font-mono text-black font-extrabold text-sm sm:text-base">
                  {currentUser.score}
                </strong>
              </span>
              <span>·</span>
              <span>
                #{nationalRank} dari {totalNational} peserta nasional
              </span>
            </div>
          </div>
        </div>

        {/* Choice 1 PTN Details (Hanya ditampilkan jika sudah ada Pilihan 1) */}
        {hasActiveP1 && activeP1 && (
          <div className="pt-3 mt-1 border-t border-black/15 md:border-t-0 md:pt-0 md:mt-0 md:border-l md:border-black/20 md:pl-8 md:ml-4">
            <div className="flex items-center gap-3.5">
              <UniversityLogo
                logo={activeP1.logo}
                acronym={activeP1.acronym}
                name={activeP1.university}
                size={36}
                className="rounded-full bg-white p-0.5 border border-black/15 shrink-0 shadow-2xs"
              />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-black/75">
                  Target Pil 1 · {activeP1.acronym || activeP1.university}
                </div>
                <div className="text-xs sm:text-sm font-bold text-black flex items-baseline gap-1.5 flex-wrap">
                  <span className="truncate max-w-[200px]">
                    {activeP1.jurusan || "Semua Jurusan"}
                  </span>
                  <span className="font-mono font-black text-black">
                    #{p1Rank}
                  </span>
                  <span className="text-xs font-semibold text-black/70">
                    / {p1Total} peminat
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
