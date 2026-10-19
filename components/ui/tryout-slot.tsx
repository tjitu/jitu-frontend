"use client";

import React from "react";
import Link from "next/link";
import { Check, Clock, Calendar, Minus, ArrowRight } from "lucide-react";

export type SlotState = "open" | "upcoming" | "done" | "missed";

export interface TryoutSlotItem {
  id: string;
  number: number;
  title: string;
  displayDate: string;
  windowLabel: string;
  subtestInfo: string;
  state: SlotState;
  href?: string;
}

interface TryoutSlotCardProps {
  slot: TryoutSlotItem;
  onDark?: boolean;
}

/**
 * DESIGN.md Section 7 — Slot (shared component)
 * Box with 2px border, mono `#n` label, 34px display date.
 * States:
 * - open/active = signal fill
 * - upcoming = white
 * - done = blue-100 + check
 * - missed = dashed
 */
export function TryoutSlotCard({ slot, onDark = false }: TryoutSlotCardProps) {
  const numStr = `#${String(slot.number).padStart(2, "0")}`;

  const containerStyle =
    slot.state === "open"
      ? "bg-signal text-blue-900 border-2 border-blue-900 shadow-[4px_4px_0_var(--blue-500)]"
      : slot.state === "done"
        ? "bg-blue-100 text-blue-900 border-2 border-blue-900"
        : slot.state === "missed"
          ? onDark
            ? "bg-blue-800 text-blue-300 border-2 border-dashed border-slate-500"
            : "bg-blue-50 text-slate-700 border-2 border-dashed border-slate-500"
          : "bg-white text-blue-900 border-2 border-blue-900";

  const chipContent = () => {
    if (slot.state === "open") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-[3px] border-[1.5px] border-blue-900 bg-white text-blue-900 font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
          <Clock className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
          <span>Dibuka</span>
        </span>
      );
    }
    if (slot.state === "done") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-[3px] border-[1.5px] border-blue-900 bg-blue-100 text-blue-900 font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
          <Check className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
          <span>Selesai</span>
        </span>
      );
    }
    if (slot.state === "missed") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-[3px] border-[1.5px] border-dashed font-mono text-[12px] uppercase tracking-[0.06em] ${
            onDark
              ? "border-slate-500 text-blue-300"
              : "border-slate-500 text-slate-700"
          }`}
        >
          <Minus className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
          <span>Ditutup</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-[3px] border-[1.5px] border-blue-900 bg-blue-50 text-blue-900 font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
        <Calendar className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
        <span>Segera</span>
      </span>
    );
  };

  return (
    <article className={`p-6 flex flex-col justify-between gap-4 ${containerStyle}`}>
      <div className="space-y-3">
        {/* Top Row: Mono #n label + State chip */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-mono text-[12px] uppercase tracking-[0.06em] font-medium tabular-nums ${
              slot.state === "missed" && onDark ? "text-blue-300" : "text-blue-900"
            }`}
          >
            TRYOUT {numStr}
          </span>
          {chipContent()}
        </div>

        {/* 34px Display Date */}
        <div
          className={`font-display font-extrabold text-[34px] leading-[1.02] tracking-[-0.025em] tabular-nums ${
            slot.state === "missed" && onDark ? "text-white" : "text-blue-900"
          }`}
        >
          {slot.displayDate}
        </div>

        {/* Title & Window */}
        <div className="space-y-1 pt-1 border-t border-slate-300/80">
          <h3
            className={`text-[16px] font-bold leading-snug ${
              slot.state === "missed" && onDark ? "text-white" : "text-blue-900"
            }`}
          >
            {slot.title}
          </h3>
          <p
            className={`font-mono text-[12px] uppercase tracking-[0.06em] tabular-nums ${
              slot.state === "missed" && onDark ? "text-blue-300" : "text-slate-700"
            }`}
          >
            {slot.windowLabel} · {slot.subtestInfo}
          </p>
        </div>
      </div>

      {/* Bottom Action or Status Line */}
      <div className="pt-2">
        {slot.state === "open" ? (
          <Link
            href={slot.href ?? "/register"}
            className="w-full min-h-[44px] px-4 py-2.5 border-2 border-blue-900 bg-blue-900 text-white font-semibold text-[14px] inline-flex items-center justify-between hover:bg-blue-800 transition-colors"
          >
            <span>Kerjakan</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
          </Link>
        ) : slot.state === "upcoming" ? (
          <Link
            href={slot.href ?? "/register"}
            className="w-full min-h-[44px] px-4 py-2.5 border-2 border-blue-900 bg-blue-50 text-blue-900 font-semibold text-[14px] inline-flex items-center justify-between hover:bg-blue-100 transition-colors"
          >
            <span>Daftar gratis</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
          </Link>
        ) : slot.state === "done" ? (
          <Link
            href={slot.href ?? "/login"}
            className="w-full min-h-[44px] px-4 py-2.5 border-2 border-blue-900 bg-white text-blue-900 font-semibold text-[14px] inline-flex items-center justify-between hover:bg-blue-50 transition-colors"
          >
            <span>Lihat hasil</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
          </Link>
        ) : (
          <div className="min-h-[44px] px-3 py-2 border border-dashed border-slate-500 flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.06em]">
            <span>Ditutup</span>
            <span>Buka pembahasan · 1 coin</span>
          </div>
        )}
      </div>
    </article>
  );
}

