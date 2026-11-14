"use client";

import React from "react";
import Image from "next/image";
import { Users, FileText, Clock, Sparkles } from "lucide-react";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { RegistrantAvatars } from "./RegistrantAvatars";
import { getDisplayedParticipants } from "@/lib/tryout-display";
import { TryoutDetail } from "../interface";

interface TryoutHeroHeaderProps {
  tryoutData: TryoutDetail;
  formatDate: (dateString: string) => string;
}

export function TryoutHeroHeader({
  tryoutData,
  formatDate,
}: TryoutHeroHeaderProps) {
  const participantsCount = getDisplayedParticipants(
    tryoutData.id,
    tryoutData.participants
  );
  const cost = tryoutData.tokenCost || 1;
  const totalQ = tryoutData.totalQuestions || 155;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Visual Photography Hero Banner */}
      <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden select-none bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950">
        {/* Real student examination & study photograph */}
        <img
          src={
            tryoutData.isSpecial
              ? "/special-tryout-banner.jpg"
              : "/hiring-header-photo.jpg?v=5"
          }
          alt="Suasana Belajar UTBK Jitu"
          className="absolute inset-0 w-full h-full object-cover object-center filter saturate-110 contrast-105 opacity-55 mix-blend-luminosity"
        />

        {/* Brand duotone gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-blue-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/50 to-transparent" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] opacity-[0.06] bg-repeat bg-[length:320px_320px]"
        />

        {/* Floating Top Banner Information */}
        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Simulasi Resmi UTBK-SNBT 2026/2027</span>
            </div>

            <div className="text-xs sm:text-sm font-mono text-white/80 tabular-nums">
              {formatDate(tryoutData.startDate)} – {formatDate(tryoutData.endDate)}
            </div>
          </div>

          {/* Dream PTN Targets showcase */}
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-white/90 text-xs font-medium bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-white/60">Target Utama Siswa:</span>
              <div className="flex items-center gap-2 font-semibold">
                <span>UI</span>
                <span className="text-white/30">•</span>
                <span>ITB</span>
                <span className="text-white/30">•</span>
                <span>UGM</span>
                <span className="text-white/30">•</span>
                <span>ITS</span>
                <span className="text-white/30">•</span>
                <span>UNAIR</span>
              </div>
            </div>

            <div className="ml-auto text-right">
              <span className="text-xs font-bold tracking-tight text-white/90">
                jitu<span className="text-yellow-400">.</span> ptn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Title & Description (without the removed badges Tryout #102, SNBT, Gratis) */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-primary">
            <span>Paket Ujian Komprehensif</span>
            <span className="text-text-muted">•</span>
            <span>Standar Balai Pengelolaan Pengujian Pendidikan (BP3)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight leading-tight">
            {tryoutData.title}
          </h1>

          <p className="text-text-body text-[15px] sm:text-base max-w-3xl leading-relaxed">
            {tryoutData.description ||
              "Paket latihan tryout intensif TPS dan Literasi Bahasa Indonesia & Inggris dengan pembobotan nilai IRT standar nasional."}
          </p>
        </div>

        {/* Social Proof: Registrant Avatars Banner */}
        <div>
          <RegistrantAvatars
            participantsCount={participantsCount}
            variant="hero"
          />
        </div>

        {/* 4 Upgraded Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-2">
          {/* 1. Peserta with mini avatar stack */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-blue-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                <div className="size-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span>Peserta</span>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text tabular-nums">
                {participantsCount.toLocaleString("id-ID")}
              </div>
            </div>
            <RegistrantAvatars
              participantsCount={participantsCount}
              variant="compact"
            />
          </div>

          {/* 2. Soal */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-purple-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                <div className="size-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>Total Soal</span>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text tabular-nums">
                {totalQ}{" "}
                <span className="text-sm sm:text-base font-normal text-text-muted">
                  soal
                </span>
              </div>
            </div>
            <span className="text-[11px] text-text-muted font-medium mt-1.5">
              7 Subtes TPS &amp; Literasi
            </span>
          </div>

          {/* 3. Durasi */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-amber-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                <div className="size-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span>Durasi</span>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-text tabular-nums">
                {tryoutData.duration}{" "}
                <span className="text-sm sm:text-base font-normal text-text-muted">
                  menit
                </span>
              </div>
            </div>
            <span className="text-[11px] text-text-muted font-medium mt-1.5">
              Timer otomatis per subtes
            </span>
          </div>

          {/* 4. Pembahasan */}
          <div className="bg-surface-muted rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-emerald-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                <div className="size-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Pembahasan</span>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary tabular-nums">
                {tryoutData.isFree ? (
                  <span className="text-emerald-600">Gratis</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <PixelCoin size={20} />
                    <span>{cost} coin</span>
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] text-text-muted font-medium mt-1.5">
              Penilaian IRT &amp; kunci jawaban
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
