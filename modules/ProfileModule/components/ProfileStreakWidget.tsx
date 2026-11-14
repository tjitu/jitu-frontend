"use client";

import { Flame } from "lucide-react";

interface ProfileStreakWidgetProps {
  streak: number;
}

export function ProfileStreakWidget({ streak }: ProfileStreakWidgetProps) {
  const displayStreak = Number(streak) || 0;

  return (
    <div className="flex items-center gap-3.5 sm:gap-4 shrink-0 select-none md:mr-6 lg:mr-10">
      <div className="relative flex items-center justify-center shrink-0">
        <Flame className="w-12 h-12 sm:w-14 sm:h-14 text-amber-500 fill-amber-500 shrink-0 drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]" />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[12px] font-mono uppercase tracking-[0.1em] text-text-muted font-bold mb-0.5">
          STREAK
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl sm:text-5xl font-black text-text tabular-nums tracking-tight leading-none">
            {displayStreak}
          </span>
          <span className="text-sm sm:text-base text-text-muted font-semibold">
            hari
          </span>
        </div>
      </div>
    </div>
  );
}
