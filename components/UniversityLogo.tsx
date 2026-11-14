import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UniversityLogoProps {
  logo?: string | null;
  acronym?: string | null;
  name?: string | null;
  className?: string;
  size?: number;
}

const PTN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  UI: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  ITB: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  UGM: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  ITS: { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-300" },
  UNAIR: { bg: "bg-yellow-50", text: "text-blue-900", border: "border-yellow-300" },
  UNPAD: { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" },
  UNDIP: { bg: "bg-blue-900", text: "text-white", border: "border-blue-950" },
  UB: { bg: "bg-blue-800", text: "text-yellow-300", border: "border-blue-900" },
  UNS: { bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-300" },
  IPB: { bg: "bg-blue-700", text: "text-white", border: "border-blue-800" },
  UNHAS: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  UPI: { bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-300" },
  USU: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
  UNAND: { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" },
  UNY: { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-300" },
  UNJ: { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  UPNVJ: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  UPNVY: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
};

export function UniversityLogo({
  logo,
  acronym,
  name,
  className,
  size = 22,
}: UniversityLogoProps) {
  // Check if logo exists in public directory (UI, ITB, UGM, ITS, UNAIR, UNPAD)
  const isImageLogo =
    logo &&
    (logo.endsWith(".png") ||
      logo.endsWith(".webp") ||
      logo.endsWith(".jpg") ||
      logo.endsWith(".jpeg") ||
      logo.startsWith("http"));

  if (isImageLogo) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 rounded overflow-hidden bg-white/80 p-0.5",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={logo}
          alt={acronym || name || "Logo Universitas"}
          width={size}
          height={size}
          className="object-contain w-full h-full"
          unoptimized
        />
      </div>
    );
  }

  // Fallback badge with university acronym
  const acr = (acronym || name || "PTN").toUpperCase().trim();
  const theme = PTN_COLORS[acr] || {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  };

  return (
    <div
      className={cn(
        "rounded shrink-0 flex items-center justify-center font-bold font-mono tracking-tight border select-none",
        theme.bg,
        theme.text,
        theme.border,
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size <= 20 ? 9 : size <= 28 ? 10 : 12,
      }}
      title={name || acronym || undefined}
    >
      {acr.slice(0, 4)}
    </div>
  );
}
