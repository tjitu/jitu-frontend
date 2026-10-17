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
    <div className="bg-white border-2 border-blue-900 p-5 flex flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700 font-medium">
          {label}
        </span>
        {Icon && (
          <Icon
            className="h-4 w-4 text-blue-600 stroke-[1.75] shrink-0"
            aria-hidden="true"
          />
        )}
      </div>

      <div>
        <div className="font-mono font-medium text-[32px] leading-none text-blue-900 tabular-nums">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          ) : (
            value
          )}
        </div>
        {suffix && (
          <p className="font-mono text-[12px] text-slate-600 mt-1.5">
            {suffix}
          </p>
        )}
      </div>
    </div>
  );
};
