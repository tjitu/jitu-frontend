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
 * DESIGN.md Section 5 & WRITING.md Section 7 — Tryout Slot Card
 * White card, 1px solid --border (blue-300 on hover / primary border when open), radius 16 (rounded-lg), 24px padding.
 * Pill status chips (24px tall, radius full, 12px/600 text).
 */
export function TryoutSlotCard({ slot, onDark = false }: TryoutSlotCardProps) {
  const numStr = `#${slot.number}`;

  const containerStyle =
    slot.state === "open"
      ? "bg-surface text-text border-2 border-primary hover:border-primary"
      : slot.state === "done"
        ? "bg-surface-muted text-text border border-border"
        : slot.state === "missed"
          ? onDark
            ? "bg-blue-900/40 text-blue-200 border border-dashed border-blue-700"
            : "bg-surface-muted text-text-muted border border-dashed border-ink-300"
          : "bg-surface text-text border border-border hover:border-blue-300";

  const chipContent = () => {
    if (slot.state === "open") {
      return (
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-yellow-100 text-yellow-700 text-[12px] font-semibold">
          <Clock className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
          <span>Dibuka</span>
        </span>
      );
    }
    if (slot.state === "done") {
      return (
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-success-soft text-success-text text-[12px] font-semibold">
          <Check className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
          <span>Selesai</span>
        </span>
      );
    }
    if (slot.state === "missed") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-semibold ${
            onDark
              ? "bg-blue-800 text-blue-200"
              : "bg-ink-100 text-ink-500"
          }`}
        >
          <Minus className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
          <span>Ditutup</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 text-[12px] font-semibold">
        <Calendar className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
        <span>Segera</span>
      </span>
    );
  };

  return (
    <article
      className={`p-6 rounded-lg flex flex-col justify-between gap-4 transition-colors duration-[120ms] ${containerStyle}`}
    >
      <div className="space-y-3">
        {/* Top Row: Label + State chip */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[12px] uppercase tracking-[0.06em] font-semibold tabular-nums ${
              slot.state === "missed" && onDark ? "text-blue-200" : "text-text-muted"
            }`}
          >
            Tryout {numStr}
          </span>
          {chipContent()}
        </div>

        {/* Display Date */}
        <div
          className={`font-bold text-[28px] leading-[1.2] tracking-[-0.02em] tabular-nums ${
            slot.state === "missed" && onDark ? "text-white" : "text-text"
          }`}
        >
          {slot.displayDate}
        </div>

        {/* Title & Window */}
        <div className="space-y-1 pt-3 border-t border-ink-100">
          <h3
            className={`text-[16px] font-semibold leading-snug ${
              slot.state === "missed" && onDark ? "text-white" : "text-text"
            }`}
          >
            {slot.title}
          </h3>
          <p
            className={`text-[13px] tabular-nums ${
              slot.state === "missed" && onDark ? "text-blue-200" : "text-text-muted"
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
            className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-primary text-on-primary font-semibold text-[14px] inline-flex items-center justify-between hover:bg-primary-hover active:bg-primary-pressed transition-colors duration-[120ms]"
          >
            <span>Kerjakan</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
          </Link>
        ) : slot.state === "upcoming" ? (
          <Link
            href={slot.href ?? "/register"}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-md border border-border bg-surface text-text font-semibold text-[14px] inline-flex items-center justify-between hover:bg-surface-muted transition-colors duration-[120ms]"
          >
            <span>Daftar gratis</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
          </Link>
        ) : slot.state === "done" ? (
          <Link
            href={slot.href ?? "/login"}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-md border border-border bg-surface text-text font-semibold text-[14px] inline-flex items-center justify-between hover:bg-surface-muted transition-colors duration-[120ms]"
          >
            <span>Lihat hasil</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
          </Link>
        ) : (
          <div className="min-h-[44px] px-3 py-2 rounded-md border border-dashed border-ink-300 flex items-center justify-between text-[12px] font-medium text-text-muted">
            <span>Ditutup</span>
            <span>Buka pembahasan · 1 coin</span>
          </div>
        )}
      </div>
    </article>
  );
}
