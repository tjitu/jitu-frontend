"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, Lock, Plus } from "lucide-react";
import { TryoutDetail } from "../interface";
import { getDisplayedParticipants } from "@/lib/tryout-display";
import { PRESET_AVATARS } from "@/lib/avatar";

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

      const dStr = days < 10 ? `0${days}` : `${days}`;
      if (days > 0) {
        setTimeLeft(`${dStr}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endDateStr]);

  return timeLeft;
}

function getTryoutAvatars(tryoutId: string, count = 6) {
  const input = String(tryoutId || "tryout");
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const startIndex = Math.abs(hash) % PRESET_AVATARS.length;
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(PRESET_AVATARS[(startIndex + i) % PRESET_AVATARS.length]);
  }
  return list;
}

export function TryoutHeroHeader({
  tryoutData,
  isFinished = false,
  isUnlocked = false,
  finalScore = 0,
  onUnlockClick,
}: TryoutHeroHeaderProps) {
  const participantsCount = getDisplayedParticipants(
    tryoutData.id,
    tryoutData.participants
  );
  const countdown = useCountdown(tryoutData.endDate);
  const avatars = useMemo(
    () => getTryoutAvatars(tryoutData.id, 6),
    [tryoutData.id]
  );

  const avatarBorderClass = tryoutData.isSpecial
    ? "border-[#2E1065]"
    : "border-[#0C1F52]";

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Visual Blue Header Banner with Title, Bio, and Avatars vertically centered */}
      <div
        className={`relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] w-full overflow-hidden select-none flex flex-col justify-center p-6 sm:p-8 md:p-10 ${
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

        {/* Top-right countdown timer (no background) */}
        <div className="absolute top-4 sm:top-6 right-5 sm:right-8 z-20">
          <div className="text-white/85 text-xs sm:text-[13px] font-mono tabular-nums inline-flex items-center gap-1.5 drop-shadow-xs">
            <Clock className="w-3.5 h-3.5 text-white/80 shrink-0" />
            <span>{countdown}</span>
          </div>
        </div>

        {/* Foreground Content inside Banner - Vertically Centered */}
        <div className="relative z-10 flex flex-col justify-center max-w-2xl space-y-3 sm:space-y-3.5 my-auto py-2">
          {/* 1. Nama Tryout */}
          <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-white tracking-tight leading-[1.2]">
            {tryoutData.title}
          </h1>

          {/* 2. Bio / Keterangan Tryout */}
          {tryoutData.description && (
            <p className="text-white/80 text-xs sm:text-sm md:text-[15px] leading-relaxed">
              {tryoutData.description}
            </p>
          )}

          {/* 3. Random Avatar Stack + Jumlah Peserta (fake + aktual) */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <div className="flex -space-x-2.5 sm:-space-x-3 overflow-hidden py-0.5">
              {avatars.map((avatar, idx) => (
                <img
                  key={avatar.id || idx}
                  src={avatar.url}
                  alt=""
                  className={`size-6 sm:size-7 rounded-full border-2 ${avatarBorderClass} bg-white object-cover shrink-0 shadow-2xs`}
                />
              ))}
              <div
                className={`size-6 sm:size-7 rounded-full border-2 ${avatarBorderClass} bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5] text-white" />
              </div>
            </div>

            <span className="text-xs sm:text-sm font-medium text-white/90">
              <span className="font-mono font-bold text-white tabular-nums">
                {participantsCount.toLocaleString("id-ID")}
              </span>{" "}
              peserta terdaftar
            </span>
          </div>
        </div>
      </div>

      {/* Main Body: Benar, Salah, Kosong (Mid-aligned / Centered) */}
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-center divide-x divide-border/60 max-w-xl mx-auto">
          {/* 1. Benar (Warna Ijo) */}
          <div className="flex-1 text-center px-4 space-y-1">
            <div className="text-xs font-semibold text-text-muted">
              Benar
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-600 tabular-nums">
              {isFinished ? (tryoutData.correctCount ?? 0) : "-"}
            </div>
          </div>

          {/* 2. Salah (Warna Merah) */}
          <div className="flex-1 text-center px-4 space-y-1">
            <div className="text-xs font-semibold text-text-muted">
              Salah
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-rose-600 tabular-nums">
              {isFinished ? (tryoutData.wrongCount ?? 0) : "-"}
            </div>
          </div>

          {/* 3. Kosong (Item Agak Abu) */}
          <div className="flex-1 text-center px-4 space-y-1">
            <div className="text-xs font-semibold text-text-muted">
              Kosong
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-600 dark:text-zinc-400 tabular-nums">
              {isFinished ? (tryoutData.emptyCount ?? 0) : "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
