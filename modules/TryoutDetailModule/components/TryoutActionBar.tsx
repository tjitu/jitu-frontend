"use client";

import React from "react";
import { CheckCircle2, Play, Loader2, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registrationLabel } from '@/lib/growth/registration-label';
import { TryoutDetail } from "../interface";
import { isTryoutBeforeStart } from "@/lib/tryout-start";

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
  const questionsReleased =
    tryoutData.questionsReleased !== false || Boolean(tryoutData.isSandboxPreview);
  const isWaitingQuestionRelease = isRegistered && !isInProgress && !questionsReleased;
  const beforeStart = isTryoutBeforeStart(tryoutData);

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
          <div className="flex items-center flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text">
              {isRegistered
                ? isInProgress
                  ? "Sesi Ujian Sedang Berjalan"
                  : "Kamu Sudah Terdaftar"
                : "Pendaftaran Tryout"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-body max-w-xl leading-relaxed">
            {isRegistered
              ? isInProgress
                ? "Lanjutkan pengerjaan dari subtes terakhir yang belum selesai."
                : isWaitingQuestionRelease
                  ? "Pendaftaranmu sudah tercatat. Soal ujian akan dibuka oleh panitia menjelang jadwal pelaksanaan tryout."
                  : "Waktu pengerjaan akan mulai berjalan begitu kamu menekan tombol mulai."
              : "Daftar untuk mengakses lembar ujian tryout ini."}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto shrink-0">
        {isRegistered ? (
          <Button
            onClick={onStart}
            disabled={isStartingAttempt || (isWaitingQuestionRelease && !beforeStart)}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-11 px-6 font-semibold flex items-center justify-center gap-2"
          >
            {isStartingAttempt ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isWaitingQuestionRelease && !beforeStart ? (
              <Clock className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>
              {isInProgress
                ? "Lanjutkan Tryout"
                : isWaitingQuestionRelease && !beforeStart
                  ? "Menunggu Soal Dibuka"
                  : "Mulai Kerjakan"}
            </span>
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
              <span>{registrationLabel(tryoutData.verificationStatus)}</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
