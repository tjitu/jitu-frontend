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
      <div className="border border-dashed border-slate-300 bg-slate-50/60 p-6 space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-500 font-medium">
          <Trophy className="w-4 h-4 stroke-[1.75] text-amber-500" aria-hidden="true" />
          <span>PERINGKAT PESERTA</span>
        </div>
        <p className="text-sm text-slate-600">
          Belum ada peserta yang menyelesaikan tryout ini.
        </p>
      </div>
    );
  }

  const { top10, currentUserRank } = leaderboardData;

  return (
    <div className="bg-white border border-slate-200 shadow-xs">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 stroke-[2] text-amber-400" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold">
            10 SKOR TERTINGGI
          </span>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
          SKOR IRT
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
              className={user.isCurrentUser ? "bg-amber-50/70 font-semibold" : ""}
            >
              <TableCell className="font-mono font-medium tabular-nums">
                #{String(user.rank).padStart(2, "0")}
              </TableCell>
              <TableCell>
                <span>{user.name}</span>
                {user.isCurrentUser && (
                  <span className="ml-2 px-1.5 py-[1px] border border-amber-300 bg-amber-100 text-amber-900 font-mono text-[10px] uppercase font-bold">
                    Kamu
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono font-bold tabular-nums text-slate-900">
                {user.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between font-mono text-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 tabular-nums">
              #{currentUserRank.rank}
            </span>
            <span className="font-sans font-semibold text-slate-900">
              {currentUserRank.name} (Peringkatmu)
            </span>
          </div>
          <span className="font-bold text-blue-600 tabular-nums">
            {currentUserRank.score}
          </span>
        </div>
      )}
    </div>
  );
};
