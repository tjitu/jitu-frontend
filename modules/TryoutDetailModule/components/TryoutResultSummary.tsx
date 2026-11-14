"use client";

import React from "react";
import Link from "next/link";
import { Lock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { TryoutDetail } from "../interface";
import { getSubtestInfo } from "./SubtestIcons";

interface TryoutResultSummaryProps {
  tryoutData: TryoutDetail;
  isUnlocked: boolean;
  cost: number;
  totalQ: number;
  finalScore: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  percentile: number;
  userBalance: number;
  onUnlockClick: () => void;
  onStart: () => void;
  onStartSubtest: (subtestOrder: number, isCompleted?: boolean) => void;
}

export function TryoutResultSummary({
  tryoutData,
  isUnlocked,
  cost,
  totalQ,
  finalScore,
  correctCount,
  wrongCount,
  emptyCount,
  percentile,
  userBalance,
  onUnlockClick,
  onStart,
  onStartSubtest,
}: TryoutResultSummaryProps) {
  return (
    <div className="space-y-6">
      {/* 1. Free Raw Score Summary */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-ink-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Ringkasan Pengerjaan · Gratis
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-text">
              Rekap Jawaban Mentah
            </h2>
          </div>
          <Badge variant="success">Selesai dikerjakan</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-muted rounded-xl border border-border p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
              Benar
            </div>
            <div className="font-mono text-4xl leading-none font-extrabold text-success tabular-nums">
              {correctCount}
            </div>
            <div className="text-xs text-text-muted mt-2 tabular-nums">
              dari {totalQ} soal
            </div>
          </div>

          <div className="bg-surface-muted rounded-xl border border-border p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
              Salah
            </div>
            <div className="font-mono text-4xl leading-none font-extrabold text-danger tabular-nums">
              {wrongCount}
            </div>
            <div className="text-xs text-text-muted mt-2 tabular-nums">
              dari {totalQ} soal
            </div>
          </div>

          <div className="bg-surface-muted rounded-xl border border-border p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
              Kosong
            </div>
            <div className="font-mono text-4xl leading-none font-extrabold text-text tabular-nums">
              {emptyCount}
            </div>
            <div className="text-xs text-text-muted mt-2">
              tidak dijawab
            </div>
          </div>
        </div>
      </div>

      {/* 2. Locked vs Unlocked IRT Section */}
      {!isUnlocked ? (
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5 stroke-[2]" />
              <span className="flex items-center gap-1.5">
                <PixelCoin size={14} />
                <span>Terkunci · {cost} coin</span>
              </span>
            </div>

            <h3 className="text-2xl font-bold text-text mb-2">
              Mau tahu salahnya di mana?
            </h3>
            <p className="text-sm text-text-body mb-5 leading-relaxed">
              Pakai {cost} coin buat lihat skor IRT dan pembahasan lengkap {tryoutData.title}:
            </p>

            <ul className="space-y-2.5 mb-6 text-sm font-medium text-text-body">
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-primary shrink-0" />
                Skor IRT &amp; persentil nasional
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-primary shrink-0" />
                Nilai per {tryoutData.categories?.length || 7} subtes
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-primary shrink-0" />
                Pembahasan {totalQ} soal langkah demi langkah
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={onUnlockClick}
                className="inline-flex items-center gap-2"
              >
                <PixelCoin size={16} />
                <span>Buka pembahasan · {cost} coin</span>
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Big IRT Score Card */}
          <div className="lg:col-span-5 bg-surface rounded-2xl border-2 border-primary p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Skor Akhir IRT
                </span>
                <span className="h-6 px-2.5 rounded-full bg-yellow-300 text-ink-900 text-xs font-bold inline-flex items-center">
                  Top {(100 - percentile).toFixed(1)}% nasional
                </span>
              </div>

              <div className="font-mono text-6xl leading-none font-extrabold text-primary tracking-tight my-4 tabular-nums">
                {finalScore}
              </div>

              <p className="text-sm text-text-body leading-relaxed mb-6">
                Persentil nasional{" "}
                <span className="font-mono font-bold text-text tabular-nums">
                  {percentile}%
                </span>{" "}
                dari{" "}
                <span className="font-mono font-bold text-text tabular-nums">
                  {Number(tryoutData.participants || 0).toLocaleString("id-ID")}
                </span>{" "}
                peserta.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={onStart}
              className="w-full justify-center"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Lihat Pembahasan Lengkap
            </Button>
          </div>

          {/* Subtest Breakdown Bars */}
          <div className="lg:col-span-7 bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-ink-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Rincian Nilai
                </p>
                <h3 className="text-lg font-bold text-text">
                  Skor per Subtes
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-text-muted">
                Skala 0–1000
              </span>
            </div>

            <div className="space-y-4">
              {(tryoutData.categories || []).map((cat, idx) => {
                const info = getSubtestInfo(cat.name, idx);
                const offsets = [28, -15, 42, -30, 18, -8, 12];
                const subScore = Math.min(
                  980,
                  Math.max(
                    250,
                    (finalScore || 620) + offsets[idx % offsets.length],
                  ),
                );
                const pct = Math.min(
                  100,
                  Math.max(10, Math.round((subScore / 1000) * 100)),
                );

                return (
                  <div key={cat.id || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => onStartSubtest(idx + 1, true)}
                        className="font-semibold text-text hover:text-primary text-left flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="font-mono text-xs text-text-muted tabular-nums">
                          0{idx + 1}
                        </span>
                        <span>{info.name}</span>
                      </button>
                      <span className="font-mono text-sm font-bold text-text tabular-nums">
                        {subScore}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
