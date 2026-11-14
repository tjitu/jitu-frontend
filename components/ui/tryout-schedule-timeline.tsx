import React from "react";
import { Calendar, Clock } from "lucide-react";
import { formatTryoutScheduleDetails } from "@/lib/tryout-display";

interface TryoutScheduleTimelineProps {
  start: Date | string | null | undefined;
  end: Date | string | null | undefined;
  className?: string;
}

export function TryoutScheduleTimeline({
  start,
  end,
  className = "",
}: TryoutScheduleTimelineProps) {
  const schedule = formatTryoutScheduleDetails(start, end);

  return (
    <div
      className={`relative flex flex-col gap-2.5 text-[12.5px] text-text-body font-medium tabular-nums ${className}`}
    >
      {/* Connecting line between timeline nodes */}
      <div className="absolute left-[10px] top-[14px] bottom-[14px] w-[1.5px] bg-blue-100" />

      {/* Mulai */}
      <div className="flex items-center gap-2.5 relative z-10">
        <div className="w-[21px] h-[21px] rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <Calendar className="w-3 h-3 text-primary stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-2 leading-none">
          <span className="text-text-muted text-[11px] uppercase tracking-wider font-semibold w-[48px] shrink-0">
            Mulai
          </span>
          <span className="font-semibold text-text text-[13px]">
            {schedule.startStr}
          </span>
        </div>
      </div>

      {/* Selesai */}
      <div className="flex items-center gap-2.5 relative z-10">
        <div className="w-[21px] h-[21px] rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <Clock className="w-3 h-3 text-primary stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-2 leading-none">
          <span className="text-text-muted text-[11px] uppercase tracking-wider font-semibold w-[48px] shrink-0">
            Selesai
          </span>
          <span className="font-semibold text-text text-[13px]">
            {schedule.endStr}
          </span>
        </div>
      </div>
    </div>
  );
}
