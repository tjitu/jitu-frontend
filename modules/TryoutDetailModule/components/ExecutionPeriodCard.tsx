"use client";

import React, { useMemo } from "react";
import { Calendar, Clock, ArrowDown, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExecutionPeriodCardProps {
  startDate: string;
  endDate: string;
  formatDate: (dateString: string) => string;
}

interface ParsedDateCard {
  month: string;
  day: string;
  year: string;
  fullStr: string;
}

function parseDateForCard(dateString: string): ParsedDateCard {
  if (!dateString) {
    return { month: "TBA", day: "--", year: "----", fullStr: "Belum ditentukan" };
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) {
    return { month: "TBA", day: "--", year: "----", fullStr: dateString };
  }
  const month = d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  const day = d.toLocaleDateString("id-ID", { day: "numeric" });
  const year = d.getFullYear().toString();
  const fullStr = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return { month, day, year, fullStr };
}

export function ExecutionPeriodCard({
  startDate,
  endDate,
  formatDate,
}: ExecutionPeriodCardProps) {
  const startParsed = useMemo(() => parseDateForCard(startDate), [startDate]);
  const endParsed = useMemo(() => parseDateForCard(endDate), [endDate]);

  const status = useMemo(() => {
    if (!startDate || !endDate) return "ACTIVE";
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "UPCOMING";
    if (now > end) return "ENDED";
    return "ACTIVE";
  }, [startDate, endDate]);

  return (
    <Card className="overflow-hidden border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-ink-100 bg-surface">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-50 text-primary border border-blue-200/60 flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-text">
                Periode Pelaksanaan
              </CardTitle>
            </div>
          </div>

          {status === "ACTIVE" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Berlangsung</span>
            </span>
          )}
          {status === "UPCOMING" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              <Clock className="w-3 h-3" />
              <span>Akan Datang</span>
            </span>
          )}
          {status === "ENDED" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
              <span>Selesai</span>
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Visual Timeline Cards */}
        <div className="relative pl-3 space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[27px] top-[28px] bottom-[28px] w-0.5 bg-gradient-to-b from-blue-300 via-indigo-200 to-amber-300" />

          {/* 1. Dibuka / Start Date Card */}
          <div className="relative flex items-center gap-3.5 group">
            {/* Calendar Icon Badge */}
            <div className="size-14 rounded-xl border border-blue-200 bg-white shadow-2xs overflow-hidden flex flex-col shrink-0 z-10">
              <div className="bg-blue-600 text-white text-[9.5px] font-bold text-center py-0.5 uppercase tracking-wider">
                {startParsed.month}
              </div>
              <div className="flex-1 flex items-center justify-center font-mono text-xl font-bold text-blue-950 tabular-nums">
                {startParsed.day}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Waktu Pembukaan
              </span>
              <p className="text-sm font-bold text-text truncate">
                {startParsed.fullStr}
              </p>
              <p className="text-[11.5px] text-text-muted">
                Pukul 00:00 WIB · Akses 24 Jam
              </p>
            </div>
          </div>

          {/* Visual Indicator Down */}
          <div className="flex items-center gap-2 pl-3 text-text-muted/60">
            <ArrowDown className="w-3.5 h-3.5 text-primary/50" />
            <span className="text-[11px] italic">rentang waktu fleksibel</span>
          </div>

          {/* 2. Ditutup / End Date Card */}
          <div className="relative flex items-center gap-3.5 group">
            {/* Calendar Icon Badge */}
            <div className="size-14 rounded-xl border border-amber-200 bg-white shadow-2xs overflow-hidden flex flex-col shrink-0 z-10">
              <div className="bg-amber-500 text-white text-[9.5px] font-bold text-center py-0.5 uppercase tracking-wider">
                {endParsed.month}
              </div>
              <div className="flex-1 flex items-center justify-center font-mono text-xl font-bold text-amber-950 tabular-nums">
                {endParsed.day}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Batas Akhir Penutupan
              </span>
              <p className="text-sm font-bold text-text truncate">
                {endParsed.fullStr}
              </p>
              <p className="text-[11.5px] text-text-muted">
                Pukul 23:59 WIB · Sistem otomatis tutup
              </p>
            </div>
          </div>
        </div>

        {/* Feature highlight info box */}
        <div className="p-3 rounded-xl bg-surface-muted border border-border/80 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-text-body">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Pengerjaan Mandiri:</strong> Bebas pilih jam ujian kapan saja selama periode pengerjaan masih aktif.
            </span>
          </div>
          <div className="flex items-start gap-2 text-text-body">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Sistem Anti-Curang:</strong> Waktu per subtes berjalan ketat sesuai standar regulasi UTBK resmi.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
