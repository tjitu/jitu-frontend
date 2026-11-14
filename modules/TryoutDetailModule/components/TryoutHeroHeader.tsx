"use client";

import React, { useState, useEffect } from "react";
import { Clock, Lock } from "lucide-react";
import { TryoutDetail } from "../interface";

interface TryoutHeroHeaderProps {
  tryoutData: TryoutDetail;
  formatDate: (dateString: string) => string;
  isFinished?: boolean;
  isUnlocked?: boolean;
  finalScore?: number;
  onUnlockClick?: () => void;
}

function useCountdown(endDateStr?: string) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!endDateStr) {
      setTimeLeft("Jadwal belum ditentukan");
      return;
    }

    const calculate = () => {
      const target = new Date(endDateStr).getTime();
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target)) {
        setTimeLeft("-");
        return;
      }

      if (diff <= 0) {
        setTimeLeft("Selesai");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}h ${hours}j ${minutes}m ${seconds}d`);
      } else {
        const hh = hours.toString().padStart(2, "0");
        const mm = minutes.toString().padStart(2, "0");
        const ss = seconds.toString().padStart(2, "0");
        setTimeLeft(`${hh}:${mm}:${ss}`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endDateStr]);

  return timeLeft;
}

export function TryoutHeroHeader({
  tryoutData,
  isFinished = false,
  isUnlocked = false,
  finalScore = 0,
  onUnlockClick,
}: TryoutHeroHeaderProps) {
  const participantsCount = Math.max(0, tryoutData.participants || 0);
  const countdown = useCountdown(tryoutData.endDate);

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Visual Blue Header Banner with Title & Description on top */}
      <div
        className={`relative min-h-[180px] sm:min-h-[220px] w-full overflow-hidden select-none flex flex-col justify-between p-6 sm:p-8 ${
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
              ? "from-[#3B0764]/85 via-[#5B21B6]/75 to-[#1E0536]/95"
              : "from-[#122F82]/85 via-[#183EA6]/75 to-[#08153A]/95"
          }`}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] opacity-[0.05] bg-repeat bg-[length:320px_320px]"
        />

        {/* Foreground Content inside Banner */}
        <div className="relative z-10 flex flex-col justify-between h-full gap-5">
          {/* Top row: Clock icon & Countdown timer to end date */}
          <div className="flex justify-end">
            <div className="h-7 px-3 rounded-full bg-black/35 backdrop-blur-xs border border-white/20 text-white text-xs font-mono tabular-nums inline-flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-white/90 shrink-0" />
              <span>{countdown}</span>
            </div>
          </div>

          {/* Name & Description directly on the blue banner */}
          <div className="space-y-2 max-w-2xl py-1">
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.15]">
              {tryoutData.title}
            </h1>
            {tryoutData.description && (
              <p className="text-white/80 text-xs sm:text-sm md:text-[15px] max-w-2xl leading-relaxed">
                {tryoutData.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 pt-5 space-y-5">
        {/* Boundary area: Small avatar stack + Participant count */}
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5 overflow-hidden py-0.5">
            <div className="size-6 rounded-full border-2 border-surface bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              AP
            </div>
            <div className="size-6 rounded-full border-2 border-surface bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              RP
            </div>
            <div className="size-6 rounded-full border-2 border-surface bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              NZ
            </div>
            <div className="size-6 rounded-full border-2 border-surface bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              DA
            </div>
            <div className="size-6 rounded-full border-2 border-surface bg-primary text-white flex items-center justify-center text-[9px] font-bold shrink-0 tabular-nums">
              +
            </div>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-text">
            <span className="font-mono font-bold text-primary tabular-nums">
              {participantsCount.toLocaleString("id-ID")}
            </span>{" "}
            peserta terdaftar
          </span>
        </div>

        {/* 4 Result Stat Cards: Benar, Salah, Kosong, IRT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* 1. Benar (Warna Ijo) */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 flex flex-col justify-between">
            <div className="text-xs font-semibold text-text-muted mb-1.5">
              Benar
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              {isFinished ? (tryoutData.correctCount ?? 0) : "-"}
            </div>
          </div>

          {/* 2. Salah (Warna Merah) */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 flex flex-col justify-between">
            <div className="text-xs font-semibold text-text-muted mb-1.5">
              Salah
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-rose-600 tabular-nums">
              {isFinished ? (tryoutData.wrongCount ?? 0) : "-"}
            </div>
          </div>

          {/* 3. Kosong (Item Agak Abu) */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 flex flex-col justify-between">
            <div className="text-xs font-semibold text-text-muted mb-1.5">
              Kosong
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-zinc-600 dark:text-zinc-400 tabular-nums">
              {isFinished ? (tryoutData.emptyCount ?? 0) : "-"}
            </div>
          </div>

          {/* 4. IRT (Gembok Borderless jika Free/Belum Unlock, Skor jika Terbuka, '-' jika Belum Selesai) */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 flex flex-col justify-between">
            <div className="text-xs font-semibold text-text-muted mb-1.5">
              Skor IRT
            </div>
            <div>
              {!isFinished ? (
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text-muted tabular-nums">
                  -
                </div>
              ) : !isUnlocked ? (
                <button
                  type="button"
                  onClick={onUnlockClick}
                  className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors cursor-pointer p-0 border-0 bg-transparent text-left"
                  title="Buka pembahasan untuk melihat Skor IRT"
                >
                  <Lock className="w-6 h-6 stroke-[2.2]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Terkunci
                  </span>
                </button>
              ) : (
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary tabular-nums">
                  {Math.round(finalScore ?? tryoutData.latestScore ?? 0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
