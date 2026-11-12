import React from "react";

interface TryoutCardBannerProps {
  label?: string;
  badge?: React.ReactNode;
  sublabel?: React.ReactNode;
  rightFooter?: React.ReactNode;
  isSpecial?: boolean;
}

/**
 * 1/3-top Tryout Card Banner with deep blue tint (default) or royal purple tint (special tryout).
 */
export function TryoutCardBanner({
  label,
  badge,
  sublabel = "Simulasi SNBT · 7 Subtes",
  rightFooter,
  isSpecial = false,
}: TryoutCardBannerProps) {
  return (
    <div
      className={`relative h-32 w-full overflow-hidden border-b border-border/60 shrink-0 select-none ${
        isSpecial ? "bg-[#2E1065]" : "bg-[#0C1F52]"
      }`}
    >
      {/* Background photograph */}
      <img
        src={isSpecial ? "/special-tryout-banner.jpg" : "/hiring-header-photo.jpg?v=5"}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover filter saturate-125 contrast-110 brightness-95 ${
          isSpecial ? "object-[center_45%]" : "object-[center_52%]"
        }`}
      />
      <div
        className={`absolute inset-0 mix-blend-multiply ${
          isSpecial ? "bg-[#6D28D9]/80" : "bg-[#1D44B8]/80"
        }`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          isSpecial
            ? "from-[#3B0764]/82 via-[#5B21B6]/72 to-[#1E0536]/92"
            : "from-[#122F82]/80 via-[#183EA6]/72 to-[#08153A]/92"
        }`}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] opacity-[0.05] bg-repeat bg-[length:320px_320px]"
      />

      {/* Foreground metadata chips */}
      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">
        <div
          className={`flex items-center gap-2 ${
            label ? "justify-between" : "justify-end"
          }`}
        >
          {label ? (
            <span
              className={`h-6 px-2.5 rounded-full backdrop-blur-xs border text-white text-[11px] font-bold uppercase tracking-[0.06em] inline-flex items-center tabular-nums ${
                isSpecial
                  ? "bg-purple-500/30 border-purple-200/35"
                  : "bg-white/15 border-white/25"
              }`}
            >
              {label}
            </span>
          ) : null}
          {badge}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div
            className={`text-[11px] font-medium tracking-wide ${
              isSpecial ? "text-purple-100/95" : "text-blue-100/90"
            }`}
          >
            {sublabel}
          </div>
          {rightFooter ?? (
            <span className="text-[11px] font-extrabold tracking-tight text-white/95">
              jitu<span className="text-yellow-400">.</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
