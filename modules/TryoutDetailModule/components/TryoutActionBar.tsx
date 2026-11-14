"use client";

import React from "react";
import { CheckCircle2, Play, Loader2, BookOpen } from "lucide-react";
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
      className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all shadow-xs ${
        isRegistered
          ? "bg-surface border-border"
          : "bg-surface border-border"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`size-11 rounded-xl flex items-center justify-center shrink-0 border ${
            isRegistered
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-surface-muted text-primary border-border"
          }`}
        >
          {isRegistered ? (
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <BookOpen className="w-5 h-5 stroke-[2]" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text">
              {isRegistered
                ? isInProgress
                  ? "Sesi Ujian Sedang Berjalan"
                  : "Kamu Sudah Terdaftar"
                : "Pendaftaran Tryout"}
            </h2>
            {isRegistered && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Terdaftar
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-text-body max-w-xl leading-relaxed">
            {isRegistered
              ? isInProgress
                ? "Lanjutkan pengerjaan dari subtes terakhir yang belum selesai."
                : "Waktu pengerjaan akan mulai berjalan begitu kamu menekan tombol mulai."
              : "Daftar untuk mengakses lembar ujian tryout ini."}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto shrink-0">
        {isRegistered ? (
          <Button
            onClick={onStart}
            disabled={isStartingAttempt}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-11 px-6 font-semibold flex items-center justify-center gap-2"
          >
            {isStartingAttempt ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{isInProgress ? "Lanjutkan Ujian" : "Mulai Kerjakan"}</span>
          </Button>
        ) : (
          <Button
            onClick={onRegister}
            disabled={isRegistering || isStartingAttempt}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-11 px-6 font-semibold"
          >
            {isRegistering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Daftar Tryout</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
