"use client";

import React from "react";
import { ArrowLeft, Loader2, AlertCircle, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTryoutLeaderboard } from "./hooks/useTryoutLeaderboard";
import { LeaderboardSummaryCard } from "./components/LeaderboardSummaryCard";
import { LeaderboardTable } from "./components/LeaderboardTable";

export function TryoutLeaderboardModule() {
  const {
    tryoutId,
    tryoutData,
    leaderboardData,
    isLoading,
    error,
    p1,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredItems,
    router,
    refetch,
  } = useTryoutLeaderboard();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
          MEMUAT LEADERBOARD TRYOUT...
        </p>
      </div>
    );
  }

  if (error || !tryoutData) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 max-w-lg mx-auto text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h3 className="font-display text-xl font-bold text-text">
            Leaderboard gagal dimuat
          </h3>
          <p className="text-sm text-text-muted">
            {error || "Tryout tidak ditemukan."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              onClick={() => router.push(`/tryout/${tryoutId}`)}
              variant="outline"
            >
              Kembali ke Tryout
            </Button>
            <Button onClick={refetch} variant="default">
              Muat Ulang
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isOngoing = leaderboardData?.isOngoing;
  const totalParticipants =
    leaderboardData?.totalParticipants || tryoutData.participants || 0;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/tryout/${tryoutId}`)}
          className="text-text-muted hover:text-text -ml-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali ke Detail Tryout
        </Button>
      </div>

      {/* Leaderboard Page Header */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-semibold text-primary border-primary/30">
            {tryoutData.badge || "UTBK"}
          </Badge>
          {isOngoing ? (
            <Badge variant="default" className="bg-amber-500 text-white font-semibold">
              Leaderboard Sementara
            </Badge>
          ) : (
            <Badge variant="default" className="bg-emerald-600 text-white font-semibold">
              Leaderboard Resmi Final
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 shrink-0" />
            <span>Leaderboard: {tryoutData.title}</span>
          </h1>
          <p className="text-sm text-text-muted">
            Peringkat akumulatif peserta berdasarkan perolehan Skor IRT standar SNBT UTBK.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-1 text-xs text-text-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-primary" />
            <strong className="font-mono text-text font-bold">
              {totalParticipants.toLocaleString("id-ID")}
            </strong>{" "}
            peserta berpartisipasi
          </span>
        </div>
      </div>

      {/* User's Personal Ranking Card */}
      <LeaderboardSummaryCard
        leaderboardData={leaderboardData}
        p1={p1}
        totalParticipants={totalParticipants}
      />

      {/* Full Leaderboard Table with Tabs & Search */}
      <LeaderboardTable
        items={filteredItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        p1={p1}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}

export default TryoutLeaderboardModule;
