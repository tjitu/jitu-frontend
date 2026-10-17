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
      <div className="border-2 border-dashed border-slate-500 bg-blue-50 p-6 space-y-2">
        <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
          <Trophy className="w-4 h-4 stroke-[1.75] text-blue-500" aria-hidden="true" />
          <span>PERINGKAT PESERTA</span>
        </div>
        <p className="text-[14px] text-slate-700">
          Belum ada peserta yang menyelesaikan tryout ini.
        </p>
      </div>
    );
  }

  const { top10, currentUserRank } = leaderboardData;

  return (
    <div className="bg-white border-2 border-blue-900 shadow-[4px_4px_0_var(--blue-900)]">
      <div className="px-5 py-3.5 border-b-2 border-blue-900 bg-blue-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 stroke-[1.75] text-signal" aria-hidden="true" />
          <span className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
            10 SKOR TERTINGGI
          </span>
        </div>
        <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-blue-200">
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
              className={user.isCurrentUser ? "bg-signal-100 font-semibold" : ""}
            >
              <TableCell className="font-mono font-medium tabular-nums">
                #{String(user.rank).padStart(2, "0")}
              </TableCell>
              <TableCell>
                <span>{user.name}</span>
                {user.isCurrentUser && (
                  <span className="ml-2 px-1.5 py-[1px] border border-blue-900 bg-white font-mono text-[11px] uppercase">
                    Kamu
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono font-medium tabular-nums">
                {user.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="border-t-2 border-blue-900 bg-blue-50 px-5 py-3 flex items-center justify-between font-mono text-[14px]">
          <div className="flex items-center gap-3">
            <span className="font-medium text-blue-900 tabular-nums">
              #{currentUserRank.rank}
            </span>
            <span className="font-sans font-semibold text-blue-900">
              {currentUserRank.name} (Peringkatmu)
            </span>
          </div>
          <span className="font-medium text-blue-500 tabular-nums">
            {currentUserRank.score}
          </span>
        </div>
      )}
    </div>
  );
};
