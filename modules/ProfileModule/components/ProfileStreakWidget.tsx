"use client";

import { Flame } from "lucide-react";

interface ProfileStreakWidgetProps {
  streak: number;
}

export function ProfileStreakWidget({ streak }: ProfileStreakWidgetProps) {
  const displayStreak = Number(streak) || 0;

  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      <Flame className="w-6 h-6 text-amber-500 fill-amber-500 shrink-0" />
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-bold">
          Streak
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-bold text-text tabular-nums">
            {displayStreak}
          </span>
          <span className="text-xs text-text-muted font-medium">hari</span>
        </div>
      </div>
    </div>
  );
}

