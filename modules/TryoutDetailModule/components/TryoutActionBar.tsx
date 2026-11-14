"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Play, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TryoutDetail } from "../interface";

interface TryoutActionBarProps {
  tryoutData: TryoutDetail;
  isStartingAttempt: boolean;
  isRegistering: boolean;
  onStart: () => void;
  onRegister: () => void;
}

export function TryoutActionBar({
  tryoutData,
  isStartingAttempt,
  isRegistering,
  onStart,
  onRegister,
}: TryoutActionBarProps) {
  const isRegistered = tryoutData.isRegistered;
  const isInProgress = tryoutData.latestAttemptStatus === "IN_PROGRESS";

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all shadow-xs ${
        isRegistered
          ? "bg-linear-to-r from-emerald-50/80 via-teal-50/30 to-surface border-emerald-200"
          : "bg-surface border-border hover:border-blue-300"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div
          className={`size-12 rounded-xl flex items-center justify-center shrink-0 border ${
            isRegistered
              ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
              : "bg-blue-50 text-primary border-blue-200"
          }`}
        >
          {isRegistered ? (
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <Sparkles className="w-6 h-6 stroke-[2]" />
          )}
        </div>

        {/* Text Information */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-text">
              {isRegistered
                ? isInProgress
                  ? "Sesi Tryout Sedang Berjalan"
                  : "Kamu Sudah Terdaftar!"
                : "Siap Uji Kemampuanmu?"}
            </h2>
            {isRegistered && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Akses Terbuka
              </span>
            )}
          </div>
          <p className="text-sm text-text-body max-w-xl leading-relaxed">
            {isRegistered
              ? isInProgress
                ? "Lanjutkan pengerjaan dari subtes terakhir. Progres dan sisa waktu tersimpan aman di server."
                : "Waktu pengerjaan akan otomatis berjalan begitu kamu mulai subtes pertama. Pastikan perangkat dan internet stabil."
              : "Daftar sekarang untuk mengakses 7 subtes resmi, penilaian IRT standar nasional, dan peringkat peserta se-Indonesia."}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full sm:w-auto shrink-0">
        {isRegistered ? (
          <Button
            onClick={onStart}
            disabled={isStartingAttempt}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-12 px-7 text-base font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2.5"
          >
            {isStartingAttempt ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            <span>{isInProgress ? "Lanjutkan Ujian" : "Mulai Kerjakan"}</span>
          </Button>
        ) : (
          <Button
            onClick={onRegister}
            disabled={isRegistering || isStartingAttempt}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-12 px-7 text-base font-bold shadow-md hover:shadow-lg transition-all duration-150"
          >
            Daftar Tryout Sekarang
          </Button>
        )}
      </div>
    </div>
  );
}
