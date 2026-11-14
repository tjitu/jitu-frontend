"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TryoutCardBanner } from "@/components/ui/tryout-card-banner";
import { TryoutScheduleTimeline } from "@/components/ui/tryout-schedule-timeline";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { getDisplayedParticipants } from "@/lib/tryout-display";
import { TryOutData } from "../types";

interface LandscapeTryoutCardProps {
  tryout: TryOutData;
}

export function LandscapeTryoutCard({ tryout }: LandscapeTryoutCardProps) {
  const router = useRouter();

  const statusBadge =
    tryout.isSandboxPreview || tryout.curationStatus === "QC_SANDBOX" ? (
      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-blue-100 text-blue-900 text-[12px] font-semibold shadow-2xs">
        <span>QC Sandbox</span>
      </span>
    ) : tryout.isRegistered ? (
      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-emerald-400 text-emerald-950 text-[12px] font-bold shadow-2xs">
        <Check className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>Terdaftar</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-yellow-400 text-ink-900 text-[12px] font-bold shadow-2xs">
        <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>Belum terdaftar</span>
      </span>
    );

  return (
    <article
      onClick={() => router.push(`/tryout/${tryout.id}`)}
      className={`w-full bg-surface rounded-xl border border-border overflow-hidden hover:shadow-sm transition-all duration-[120ms] cursor-pointer flex flex-col md:flex-row items-stretch ${
        tryout.isSpecial ? "hover:border-purple-300" : "hover:border-blue-300"
      }`}
    >
      <TryoutCardBanner
        isSpecial={tryout.isSpecial}
        badge={statusBadge}
        className="w-full h-44 md:h-auto md:w-80 md:min-w-[300px] border-b md:border-b-0 md:border-r border-border/60"
        sublabel={
          <span className="inline-flex items-center gap-1.5">
            <span>Free · {tryout.solutionPrice || 1}</span>
            <PixelCoin size={13} />
            <span>untuk pembahasan</span>
          </span>
        }
        rightFooter={
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/95 tabular-nums">
            <Users className="w-3.5 h-3.5 stroke-[2]" />
            <span>
              {getDisplayedParticipants(
                tryout.id,
                tryout.participants
              ).toLocaleString("id-ID")}{" "}
              peserta
            </span>
          </span>
        }
      />

      <div className="p-6 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
              <span>Sistem IRT (E-Wallet untuk 10 besar)</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sedang berlangsung
            </span>
          </div>

          <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-text leading-snug tracking-[-0.015em]">
            {tryout.title}
          </h2>

          <p className="text-[14px] sm:text-[15px] text-text-body leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-3">
            {tryout.description?.trim() ||
              "Tryout persiapan UTBK-SNBT 2026 nasional dengan penilaian IRT dan analisis subtes."}
          </p>

          <TryoutScheduleTimeline
            start={tryout.scheduledStart}
            end={tryout.scheduledEnd}
            className="pt-1 pb-0.5"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-border/50">
          <div className="text-[12.5px] text-text-muted">
            Simulasi UTBK resmi mencakup 7 subtes TPS &amp; Literasi
          </div>

          {tryout.isRegistered ? (
            <Button
              size="lg"
              variant="primary"
              className="sm:min-w-[200px] justify-between cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/tryout/${tryout.id}`);
              }}
            >
              <span>Kerjakan tryout</span>
              <ArrowRight className="w-4 h-4 stroke-[1.75]" />
            </Button>
          ) : (
            <div className="sm:min-w-[200px] group/btn transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
              <Button
                size="lg"
                variant="primary"
                className="w-full justify-between cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/tryout/${tryout.id}`);
                }}
              >
                <span className="font-bold">Daftar gratis</span>
                <ArrowRight
                  className="w-4 h-4 stroke-[1.75] transition-transform duration-150 ease-out group-hover/btn:translate-x-1 group-active/btn:translate-x-0"
                  aria-hidden="true"
                />
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
