"use client";

import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Curated high quality diverse student portrait avatars with reliable CDN URLs
const REGISTRANT_STUDENTS = [
  {
    name: "Alya Putri",
    initials: "AP",
    color: "bg-blue-100 text-blue-700",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    campus: "Target: FK UI",
  },
  {
    name: "Rizky Pratama",
    initials: "RP",
    color: "bg-emerald-100 text-emerald-700",
    photo:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
    campus: "Target: STEI ITB",
  },
  {
    name: "Nabila Zahra",
    initials: "NZ",
    color: "bg-rose-100 text-rose-700",
    photo:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    campus: "Target: Psikologi UGM",
  },
  {
    name: "Dimas Anggara",
    initials: "DA",
    color: "bg-purple-100 text-purple-700",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    campus: "Target: Teknik Mesin ITS",
  },
  {
    name: "Siti Rahma",
    initials: "SR",
    color: "bg-amber-100 text-amber-700",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    campus: "Target: Akuntansi Unpad",
  },
];

interface RegistrantAvatarsProps {
  participantsCount: number;
  variant?: "hero" | "compact";
  className?: string;
}

export function RegistrantAvatars({
  participantsCount,
  variant = "hero",
  className = "",
}: RegistrantAvatarsProps) {
  const displayCount = Math.max(participantsCount, REGISTRANT_STUDENTS.length);
  const remaining = Math.max(0, displayCount - 4);

  const displayedList = useMemo(() => {
    return REGISTRANT_STUDENTS.slice(0, 4);
  }, []);

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 mt-1.5 ${className}`}>
        <div className="flex -space-x-2 overflow-hidden py-0.5">
          {displayedList.map((student, idx) => (
            <Avatar
              key={idx}
              className="size-6 border-2 border-surface shrink-0 ring-1 ring-border/40"
              title={`${student.name} (${student.campus})`}
            >
              <AvatarImage
                src={student.photo}
                alt={student.name}
                className="object-cover"
              />
              <AvatarFallback
                className={`text-[10px] font-bold ${student.color}`}
              >
                {student.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          {remaining > 0 && (
            <div className="size-6 rounded-full bg-blue-100 border-2 border-surface flex items-center justify-center text-[9px] font-bold text-blue-800 shrink-0 tabular-nums">
              +{remaining > 999 ? "999+" : remaining}
            </div>
          )}
        </div>
        <span className="text-[11px] text-text-muted font-medium">
          pejuang aktif
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-3 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-blue-50/70 border border-blue-200/60 ${className}`}
    >
      <div className="flex -space-x-2.5 overflow-hidden py-0.5">
        {displayedList.map((student, idx) => (
          <Avatar
            key={idx}
            className="size-8 sm:size-9 border-2 border-surface shrink-0 shadow-xs transition-transform hover:scale-110 hover:z-20 duration-150"
            title={`${student.name} · ${student.campus}`}
          >
            <AvatarImage
              src={student.photo}
              alt={student.name}
              className="object-cover"
            />
            <AvatarFallback
              className={`text-xs font-bold ${student.color}`}
            >
              {student.initials}
            </AvatarFallback>
          </Avatar>
        ))}
        {remaining > 0 && (
          <div className="size-8 sm:size-9 rounded-full bg-blue-600 border-2 border-surface flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shrink-0 shadow-xs tabular-nums">
            +{remaining > 999 ? "999+" : remaining}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-text">
            <span className="font-mono text-primary font-bold tabular-nums">
              {displayCount.toLocaleString("id-ID")}
            </span>{" "}
            siswa sudah terdaftar
          </span>
        </div>
        <span className="text-[11px] text-text-muted">
          Bergabung bersama ribuan pejuang PTN se-Indonesia
        </span>
      </div>
    </div>
  );
}
