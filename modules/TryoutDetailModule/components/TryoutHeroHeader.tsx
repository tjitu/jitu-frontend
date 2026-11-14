"use client";

import React from "react";
import { Users, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Top Meta Badges & Schedule */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink-100">
        <div className="flex flex-wrap items-center gap-2">
          {tryoutData.number && (
            <Badge variant="secondary">Tryout #{tryoutData.number}</Badge>
          )}
          {tryoutData.badge && (
            <Badge variant="default">{tryoutData.badge}</Badge>
          )}
          {tryoutData.isFree ? (
            <Badge variant="success">Gratis</Badge>
          ) : (
            <Badge variant="signal" className="inline-flex items-center gap-1.5">
              <PixelCoin size={12} />
              <span>{cost} coin</span>
            </Badge>
          )}
        </div>
        {(tryoutData.startDate || tryoutData.endDate) && (
          <span className="text-xs sm:text-sm font-mono text-text-muted tabular-nums">
            {formatDate(tryoutData.startDate)} – {formatDate(tryoutData.endDate)}
          </span>
        )}
      </div>

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
  );
}
