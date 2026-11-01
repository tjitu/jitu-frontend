import React from "react";
import { Loader2 } from "lucide-react";

export interface StatCardData {
  label: string;
  icon?: React.ElementType;
  color?: string;
  bgColor?: string;
  value: number | string;
  suffix?: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardData> = ({
  label,
  icon: Icon,
  value,
  suffix,
  isLoading = false,
}) => {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 flex flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] uppercase tracking-[0.06em] text-text-muted font-semibold">
          {label}
        </span>
        {Icon && (
          <Icon
            className="h-4 w-4 text-primary stroke-[1.75] shrink-0"
            aria-hidden="true"
          />
        )}
      </div>

      <div>
        <div className="font-bold text-[32px] leading-none text-text tabular-nums">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            value
          )}
        </div>
        {suffix && (
          <p className="text-[12px] text-text-muted mt-1.5">
            {suffix}
          </p>
        )}
      </div>
    </div>
  );
};
