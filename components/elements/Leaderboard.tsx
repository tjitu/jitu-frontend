"use client";

import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardData } from "@/lib/api/tryout";

interface LeaderboardProps {
  leaderboardData: LeaderboardData | null;
}

export const Leaderboard = ({ leaderboardData }: LeaderboardProps) => {
  if (!leaderboardData || !leaderboardData.top10 || leaderboardData.top10.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 space-y-2">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.06em] text-text-muted font-semibold">
          <Trophy className="w-4 h-4 stroke-[1.75] text-yellow-700" aria-hidden="true" />
          <span>Peringkat peserta</span>
        </div>
        <p className="text-sm text-text-body">
          Belum ada peserta yang menyelesaikan tryout ini.
        </p>
      </div>
    );
  }

  const { top10, currentUserRank } = leaderboardData;

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 stroke-[1.75] text-primary" aria-hidden="true" />
          <span className="text-[12px] uppercase tracking-[0.06em] font-semibold text-text">
            10 Skor tertinggi
          </span>
        </div>
        <span className="text-[12px] uppercase tracking-[0.06em] font-semibold text-text-muted">
          Skor IRT
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead>Nama peserta</TableHead>
            <TableHead className="text-right">Skor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top10.map((user) => (
            <TableRow
              key={user.rank}
              className={user.isCurrentUser ? "bg-yellow-100/50 font-semibold" : ""}
            >
              <TableCell className="font-mono font-medium tabular-nums">
                #{String(user.rank).padStart(2, "0")}
              </TableCell>
              <TableCell>
                <span className="text-text">{user.name}</span>
                {user.isCurrentUser && (
                  <span className="ml-2 h-6 px-2.5 rounded-full bg-yellow-100 text-yellow-700 text-[12px] font-semibold inline-flex items-center">
                    Kamu
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold tabular-nums text-text">
                {user.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="border-t border-border bg-surface-muted px-5 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-text tabular-nums">
              #{currentUserRank.rank}
            </span>
            <span className="font-semibold text-text">
              {currentUserRank.name} (Peringkatmu)
            </span>
          </div>
          <span className="font-mono font-bold text-primary tabular-nums">
            {currentUserRank.score}
          </span>
        </div>
      )}
    </div>
  );
};
