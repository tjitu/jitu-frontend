"use client";

import React from "react";
import { Trophy, Search, Medal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { UniversityLogo } from "@/components/UniversityLogo";
import type { LeaderboardItem } from "@/lib/api/tryout";

interface LeaderboardTableProps {
  items: LeaderboardItem[];
  activeTab: "nasional" | "pilihan1";
  onTabChange: (tab: "nasional" | "pilihan1") => void;
  p1: any;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function LeaderboardTable({
  items,
  activeTab,
  onTabChange,
  p1,
  searchQuery,
  onSearchChange,
}: LeaderboardTableProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-black text-amber-500">
          <Medal className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>#01</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-400">
          <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />
          <span>#02</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700">
          <Medal className="w-4 h-4 text-amber-700 fill-amber-600" />
          <span>#03</span>
        </span>
      );
    }
    return (
      <span className="font-mono text-text-muted font-medium tabular-nums">
        #{String(rank).padStart(2, "0")}
      </span>
    );
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Control Bar: Tabs & Search */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-surface-muted/60 rounded-xl border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onTabChange("nasional")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "nasional"
                ? "bg-surface text-text shadow-2xs font-extrabold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Nasional
          </button>
          <button
            type="button"
            onClick={() => onTabChange("pilihan1")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pilihan1"
                ? "bg-surface text-text shadow-2xs font-extrabold"
                : "text-text-muted hover:text-text"
            }`}
          >
            {p1?.logo && (
              <UniversityLogo
                logo={p1.logo}
                acronym={p1.acronym}
                name={p1.university}
                size={16}
                className="rounded-full bg-white"
              />
            )}
            <span>Pilihan 1 {p1?.acronym ? `(${p1.acronym})` : ""}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama peserta..."
            className="pl-9 h-9 text-xs rounded-xl bg-surface-muted/40 border-border"
          />
        </div>
      </div>

      {/* Table Content */}
      {items.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <Trophy className="w-8 h-8 text-text-muted mx-auto stroke-[1.5]" />
          <p className="text-sm font-semibold text-text">
            {searchQuery
              ? "Tidak ada peserta yang cocok dengan pencarian."
              : "Belum ada data peringkat untuk kategori ini."}
          </p>
          <p className="text-xs text-text-muted">
            {searchQuery
              ? "Coba kata kunci pencarian yang lain."
              : "Peringkat akan diperbarui secara otomatis."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[90px] text-xs font-bold uppercase tracking-wider text-text-muted pl-6">
                  Peringkat
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Peserta
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted hidden sm:table-cell">
                  Target Pil 1
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-muted text-right pr-6">
                  Skor IRT
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((user, idx) => {
                const displayRank = idx + 1;
                const isCurrent = user.isCurrentUser;
                return (
                  <TableRow
                    key={user.userId || `${user.name}-${idx}`}
                    className={`border-border/60 transition-colors ${
                      isCurrent
                        ? "bg-yellow-50 dark:bg-yellow-950/20 font-semibold"
                        : "hover:bg-surface-muted/40"
                    }`}
                  >
                    <TableCell className="pl-6">
                      {getRankBadge(displayRank)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text text-sm">
                          {user.name}
                        </span>
                        {isCurrent && (
                          <span className="h-5 px-2 rounded-full bg-yellow-400 text-black text-[11px] font-black inline-flex items-center">
                            Kamu
                          </span>
                        )}
                      </div>
                      {/* Mobile Target Preview */}
                      {user.pilihan1 && (
                        <div className="sm:hidden text-xs text-text-muted flex items-center gap-1.5 pt-0.5">
                          <UniversityLogo
                            logo={user.pilihan1.logo}
                            acronym={user.pilihan1.acronym}
                            name={user.pilihan1.university}
                            size={14}
                            className="rounded-full bg-white shrink-0"
                          />
                          <span className="truncate">
                            {user.pilihan1.acronym || user.pilihan1.university}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {user.pilihan1 ? (
                        <div className="flex items-center gap-2 text-xs">
                          <UniversityLogo
                            logo={user.pilihan1.logo}
                            acronym={user.pilihan1.acronym}
                            name={user.pilihan1.university}
                            size={20}
                            className="rounded-full bg-white p-0.5 border border-border shrink-0 shadow-2xs"
                          />
                          <div className="truncate max-w-[240px]">
                            <span className="font-bold text-text">
                              {user.pilihan1.acronym || user.pilihan1.university}
                            </span>
                            {user.pilihan1.jurusan && (
                              <span className="text-text-muted">
                                {" "}· {user.pilihan1.jurusan}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">
                          Belum diatur
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="font-mono text-base font-black tabular-nums text-text">
                        {user.score}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
