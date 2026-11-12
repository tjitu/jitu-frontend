import React from "react";

interface TryoutCardBannerProps {
  label: string;
  badge?: React.ReactNode;
  sublabel?: string;
}

/**
 * 1/3-top Tryout Card Banner using the /careers team photo with JITU deep blue tint.
 */
export function TryoutCardBanner({
  label,
  badge,
  sublabel = "Simulasi SNBT · 7 Subtes",
}: TryoutCardBannerProps) {
  return (
    <div className="relative h-32 w-full overflow-hidden bg-[#0C1F52] border-b border-border/60 shrink-0 select-none">
      {/* Photo from /careers with deep blue tint */}
      <img
        src="/hiring-header-photo.jpg?v=5"
        alt=""
        className="w-full h-full object-cover object-[center_52%] filter saturate-125 contrast-110 brightness-95"
      />
      <div className="absolute inset-0 bg-[#1D44B8]/80 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#122F82]/80 via-[#183EA6]/72 to-[#08153A]/92" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] opacity-[0.05] bg-repeat bg-[length:320px_320px]"
      />

      {/* Foreground metadata chips */}
      <div className="relative z-10 h-full p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="h-6 px-2.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 text-white text-[11px] font-bold uppercase tracking-[0.06em] inline-flex items-center tabular-nums">
            {label}
          </span>
          {badge}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-blue-100/90 tracking-wide">
            {sublabel}
          </span>
          <span className="text-[11px] font-extrabold tracking-tight text-white/95">
            jitu<span className="text-yellow-400">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
