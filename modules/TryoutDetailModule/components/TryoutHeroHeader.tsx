"use client";

import React from "react";
import { Users, FileText, Clock } from "lucide-react";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { TryoutDetail } from "../interface";

interface TryoutHeroHeaderProps {
  tryoutData: TryoutDetail;
  formatDate: (dateString: string) => string;
}

export function TryoutHeroHeader({
  tryoutData,
  formatDate,
}: TryoutHeroHeaderProps) {
  const participantsCount = Math.max(0, tryoutData.participants || 0);
  const cost = tryoutData.tokenCost || 1;
  const totalQ = tryoutData.totalQuestions || 0;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Visual Blue Header Banner */}
      <div
        className={`relative h-36 sm:h-44 md:h-48 w-full overflow-hidden select-none ${
          tryoutData.isSpecial ? "bg-[#2E1065]" : "bg-[#0C1F52]"
        }`}
      >
        <img
          src={
            tryoutData.isSpecial
              ? "/special-tryout-banner.jpg"
              : "/hiring-header-photo.jpg?v=5"
          }
          alt=""
          className={`absolute inset-0 w-full h-full object-cover filter saturate-125 contrast-110 brightness-95 ${
            tryoutData.isSpecial ? "object-[center_45%]" : "object-[center_52%]"
          }`}
        />
        <div
          className={`absolute inset-0 mix-blend-multiply ${
            tryoutData.isSpecial ? "bg-[#6D28D9]/80" : "bg-[#1D44B8]/80"
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            tryoutData.isSpecial
              ? "from-[#3B0764]/82 via-[#5B21B6]/72 to-[#1E0536]/92"
              : "from-[#122F82]/80 via-[#183EA6]/72 to-[#08153A]/92"
          }`}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] opacity-[0.05] bg-repeat bg-[length:320px_320px]"
        />

        {/* Foreground Content inside Banner */}
        <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {tryoutData.number && (
                <span className="h-6 px-2.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 text-white text-[11px] font-bold uppercase tracking-[0.06em] inline-flex items-center tabular-nums">
                  Tryout #{tryoutData.number}
                </span>
              )}
              {tryoutData.badge && (
                <span className="h-6 px-2.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 text-white text-[11px] font-bold uppercase tracking-[0.06em] inline-flex items-center">
                  {tryoutData.badge}
                </span>
              )}
              {tryoutData.isFree ? (
                <span className="h-6 px-2.5 rounded-full bg-emerald-400 text-emerald-950 text-[11px] font-bold inline-flex items-center">
                  Gratis
                </span>
              ) : (
                <span className="h-6 px-2.5 rounded-full bg-yellow-400 text-ink-900 text-[11px] font-bold inline-flex items-center gap-1">
                  <PixelCoin size={12} />
                  <span>{cost} coin</span>
                </span>
              )}
            </div>

            {(tryoutData.startDate || tryoutData.endDate) && (
              <span className="text-xs sm:text-sm font-mono text-white/80 tabular-nums">
                {formatDate(tryoutData.startDate)} – {formatDate(tryoutData.endDate)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end">
            <span className="text-xs font-extrabold tracking-tight text-white/95">
              jitu<span className="text-yellow-400">.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight leading-tight">
            {tryoutData.title}
          </h1>
          {tryoutData.description && (
            <p className="text-text-body text-sm sm:text-base max-w-3xl leading-relaxed">
              {tryoutData.description}
            </p>
          )}
        </div>

        {/* 4 Clean Real Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* 1. Peserta */}
          <div className="bg-surface-muted rounded-xl border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mb-1.5">
              <Users className="w-3.5 h-3.5 text-text-muted" />
              <span>Peserta</span>
            </div>
            <div className="font-mono text-2xl font-bold text-text tabular-nums">
              {participantsCount.toLocaleString("id-ID")}
            </div>
          </div>

          {/* 2. Total Soal */}
          <div className="bg-surface-muted rounded-xl border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mb-1.5">
              <FileText className="w-3.5 h-3.5 text-text-muted" />
              <span>Total Soal</span>
            </div>
            <div className="font-mono text-2xl font-bold text-text tabular-nums">
              {totalQ}{" "}
              <span className="text-xs font-normal text-text-muted">soal</span>
            </div>
          </div>

          {/* 3. Durasi */}
          <div className="bg-surface-muted rounded-xl border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mb-1.5">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>Durasi</span>
            </div>
            <div className="font-mono text-2xl font-bold text-text tabular-nums">
              {tryoutData.duration}{" "}
              <span className="text-xs font-normal text-text-muted">menit</span>
            </div>
          </div>

          {/* 4. Biaya Pembahasan */}
          <div className="bg-surface-muted rounded-xl border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mb-1.5">
              <PixelCoin size={14} />
              <span>Pembahasan</span>
            </div>
            <div className="font-mono text-2xl font-bold text-text tabular-nums">
              {tryoutData.isFree ? (
                <span className="text-emerald-600">Gratis</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <PixelCoin size={18} />
                  <span>{cost} coin</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
