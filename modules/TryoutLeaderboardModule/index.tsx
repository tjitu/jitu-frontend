"use client";

import React from "react";
import { ArrowLeft, Loader2, AlertCircle, Trophy, Users, Sparkles, Check, Wallet, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTryoutLeaderboard } from "./hooks/useTryoutLeaderboard";
import { LeaderboardSummaryCard } from "./components/LeaderboardSummaryCard";
import { LeaderboardTable } from "./components/LeaderboardTable";
import { PixelCoin } from "@/components/ui/pixel-coin";

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
            {tryoutData && !tryoutData.resultsAvailable ? "Peringkat belum tersedia" : "Leaderboard gagal dimuat"}
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

  if (!tryoutData.isFree && tryoutData.unlockedSolutions.length === 0) {
    const cost = tryoutData.tokenCost ?? 0;
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <Card className="p-8 text-center space-y-4">
          <Lock className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-xl font-bold text-text">Ranking terkunci</h1>
          <p className="text-sm text-text-body">
            Upgrade pendaftaran tryout ini untuk melihat ranking dan hasil IRT.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push(`/tryout/${tryoutId}?upgrade=true`)}
            className="inline-flex items-center gap-2"
          >
            <PixelCoin size={15} /> Upgrade · {cost} coin
          </Button>
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

      {/* Leaderboard Hero Banner (PTN Premium Pass Standard) */}
      <div className="group relative w-full rounded-2xl bg-gradient-to-r from-[#143485] via-[#1D4ED8] to-[#163372] text-white p-6 sm:p-8 lg:p-9 border border-blue-400/40 shadow-xl shadow-blue-950/20 hover:border-blue-300/70 transition-all duration-300 overflow-hidden">
        {/* 1. Sweeping Ambient Shimmer Light Beam Animation */}
        <div
          aria-hidden="true"
          className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none animate-pass-shimmer"
        />

        {/* 2. Pulsing Ambient Glowing Orbs */}
        <div
          aria-hidden="true"
          className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl animate-pulse [animation-duration:4s] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl animate-pulse [animation-duration:6s] pointer-events-none"
        />

        {/* 3. Signature Hand-drawn Yellow & Light Blue Doodle Accessories */}
        <svg
          aria-hidden="true"
          className="hidden sm:block absolute top-2 left-[2.5%] w-13 h-11 text-blue-300/60 pointer-events-none drop-shadow-xs rotate-[-15deg] animate-doodle-2"
          viewBox="0 0 68 48"
          fill="none"
        >
          <path
            d="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="hidden md:block absolute top-3 left-[60%] -translate-x-1/2 w-14 h-12 text-[#FFD13B]/80 pointer-events-none drop-shadow-xs rotate-[8deg] animate-doodle-1"
          viewBox="0 0 68 48"
          fill="none"
        >
          <path
            d="M8 38C22 34 38 18 30 8C22 -2 12 14 30 22C48 30 58 16 66 10"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="hidden lg:block absolute -bottom-1.5 left-[44%] w-14 h-12 text-blue-200/50 pointer-events-none drop-shadow-xs rotate-[8deg] animate-doodle-1"
          viewBox="0 0 68 48"
          fill="none"
        >
          <path
            d="M6 26C16 12 24 14 26 22C28 30 20 32 18 24C16 14 32 16 44 26C54 34 60 26 64 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="absolute top-4 right-10 w-5 h-5 text-[#FFD13B]/80 pointer-events-none animate-pulse [animation-duration:3s]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Left: Badges, Headline, E-Wallet Highlight, & Benefits */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/25 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
                {tryoutData.badge || "SNBT"}
              </span>
              {isOngoing ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD13B]/20 text-[#FFD13B] border border-[#FFD13B]/40 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD13B] animate-pulse" />
                  Leaderboard Sementara
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold uppercase tracking-wider">
                  Leaderboard Resmi Final
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black text-[11px] font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3 fill-black text-black" />
                Top 10 Reward
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FFD13B] shrink-0" />
                <span>Leaderboard: {tryoutData.title}</span>
              </div>

              <h1 className="text-[24px] sm:text-[30px] lg:text-[34px] font-black text-white tracking-tight leading-tight flex flex-wrap items-center gap-2">
                <span>DAPATKAN</span>
                <span className="bg-[#FFD13B] text-black px-2.5 sm:px-3 py-0.5 rounded-xs inline-block shadow-sm">
                  E-WALLET
                </span>
                <span>UNTUK 10 BESAR!</span>
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xl">
                Peringkat akumulatif peserta berdasarkan perolehan Skor IRT standar SNBT UTBK. Raih posisi 10 besar nasional untuk klaim hadiah saldo E-Wallet!
              </p>
            </div>

            {/* 3 Checkmark Info Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
              <div className="flex items-center gap-2 text-[12.5px] sm:text-[13px] text-blue-100 font-medium">
                <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Skor IRT Standar UTBK</span>
              </div>

              <div className="flex items-center gap-2 text-[12.5px] sm:text-[13px] text-blue-100 font-medium">
                <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Hadiah E-Wallet Top 10</span>
              </div>

              <div className="flex items-center gap-2 text-[12.5px] sm:text-[13px] text-blue-100 font-medium">
                <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>
                  <strong className="font-mono text-white font-bold">
                    {totalParticipants.toLocaleString("id-ID")}
                  </strong>{" "}
                  peserta berpartisipasi
                </span>
              </div>
            </div>
          </div>

          {/* Right: Highlighted Reward & Participant Badge Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t border-blue-400/30 lg:border-t-0">
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 text-left lg:text-right shadow-lg">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FFD13B] mb-1">
                <Wallet className="w-3.5 h-3.5" />
                <span>Apresiasi Juara</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Top 1 – 10 Nasional
              </div>
              <div className="text-xs text-blue-200 font-medium mt-0.5">
                Saldo E-Wallet Resmi JITU PTN
              </div>
            </div>
          </div>
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
