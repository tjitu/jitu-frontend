"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
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
  onStart?: () => void;
  leaderboardData?: any;
  targets?: any;
}

export function TryoutResultSummary({
  tryoutData,
  isUnlocked,
  cost,
  finalScore,
  userBalance,
  onUnlockClick,
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
    <div className="bg-yellow-400 dark:bg-yellow-400 text-black dark:text-black rounded-2xl border border-yellow-500/40 p-6 sm:p-8 shadow-xs">
      <div className="space-y-1.5">
        <div className="text-xs font-bold uppercase tracking-wider text-black/80 dark:text-black/80">
          Skor IRT
        </div>
        <div className="font-mono text-4xl sm:text-5xl font-black text-black dark:text-black tabular-nums">
          {finalScore}
        </div>
      </div>
    </div>
  );
}
