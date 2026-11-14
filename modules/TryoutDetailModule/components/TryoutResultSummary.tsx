"use client";

import React from "react";
import Link from "next/link";
import { Lock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { TryoutDetail } from "../interface";

interface TryoutResultSummaryProps {
  tryoutData: TryoutDetail;
  isUnlocked: boolean;
  cost: number;
  finalScore: number;
  userBalance: number;
  onUnlockClick: () => void;
  onStart: () => void;
}

export function TryoutResultSummary({
  tryoutData,
  isUnlocked,
  cost,
  finalScore,
  userBalance,
  onUnlockClick,
  onStart,
}: TryoutResultSummaryProps) {
  if (!isUnlocked) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 stroke-[2]" />
            <span>Pembahasan Terkunci</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-text">
              Buka Hasil &amp; Pembahasan
            </h3>
            <p className="text-sm text-text-body leading-relaxed">
              Gunakan {cost} coin untuk membuka skor dan pembahasan lengkap {tryoutData.title}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onUnlockClick}
              className="inline-flex items-center gap-2"
            >
              <PixelCoin size={16} />
              <span>Buka Pembahasan · {cost} coin</span>
            </Button>

            {userBalance < cost ? (
              <Link
                href="/shop"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Beli coin di Shop →
              </Link>
            ) : (
              <span className="text-xs text-text-muted flex items-center gap-1.5">
                <PixelCoin size={12} />
                <span>Saldo kamu: {userBalance} coin</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Skor Akhir
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Selesai Dikerjakan
            </span>
          </div>
          <div className="font-mono text-4xl sm:text-5xl font-extrabold text-primary tabular-nums">
            {finalScore}
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Kamu telah menyelesaikan tryout ini. Buka pembahasan untuk mempelajari kunci jawaban dan penjelasan setiap soal.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            className="w-full sm:w-auto font-semibold flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lihat Pembahasan Lengkap</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
