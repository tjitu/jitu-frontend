"use client";

import React, { useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTryoutScheduleDetails } from "@/lib/tryout-display";

interface ExecutionPeriodCardProps {
  startDate: string;
  endDate: string;
  formatDate?: (dateString: string) => string;
}

export function ExecutionPeriodCard({
  startDate,
  endDate,
}: ExecutionPeriodCardProps) {
  const schedule = useMemo(() => {
    return formatTryoutScheduleDetails(startDate, endDate);
  }, [startDate, endDate]);

  const status = useMemo(() => {
    if (!startDate || !endDate) return "ACTIVE";
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && now < start) return "UPCOMING";
    if (!isNaN(end.getTime()) && now > end) return "ENDED";
    return "ACTIVE";
  }, [startDate, endDate]);

  return (
    <Card className="overflow-hidden border-border shadow-xs">
      <CardHeader className="py-4 px-5 border-b border-ink-100 bg-surface">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-bold text-text">
              Periode Pelaksanaan
            </CardTitle>
          </div>

          {status === "ACTIVE" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Berlangsung</span>
            </span>
          )}
          {status === "UPCOMING" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              <Clock className="w-3 h-3" />
              <span>Akan Datang</span>
            </span>
          )}
          {status === "ENDED" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
              Selesai
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-ink-100">
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
              Dibuka
            </span>
            <span className="font-semibold text-text tabular-nums text-sm">
              {schedule.startStr}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
              Ditutup
            </span>
            <span className="font-semibold text-text tabular-nums text-sm">
              {schedule.endStr}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
