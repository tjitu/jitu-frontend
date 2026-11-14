"use client";

import { Flame, Lock } from "lucide-react";

interface ProfileStreakWidgetProps {
  streak: number;
}

export function ProfileStreakWidget({ streak }: ProfileStreakWidgetProps) {
  return (
    <div
      className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl border border-border/80 bg-surface-muted/30 opacity-60 cursor-not-allowed select-none shrink-0 transition-opacity"
      title="Fitur Daily Streak sedang dikunci (Segera hadir)"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-xs relative">
        <Flame className="w-5 h-5 stroke-[1.75]" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
          <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-bold">
            STREAK AKTIF
          </span>
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Terkunci
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold text-text-muted tabular-nums">
            {streak}
          </span>
          <span className="text-xs text-text-muted font-medium">
            hari
          </span>
        </div>
      </div>
    </div>
  );
}
