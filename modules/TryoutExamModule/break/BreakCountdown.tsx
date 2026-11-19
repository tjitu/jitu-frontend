"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export function BreakCountdown({ storageKey, seconds }: { storageKey: string; seconds: number }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    let start = now;
    try {
      const stored = Date.parse(localStorage.getItem(storageKey) ?? "");
      if (Number.isFinite(stored) && stored <= now) start = stored;
      else localStorage.setItem(storageKey, new Date(start).toISOString());
    } catch {
      // The countdown still works for this visit with browser storage disabled.
    }

    const end = start + seconds * 1000;
    const update = () => setRemaining(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [seconds, storageKey]);

  if (remaining === null) return null;
  const minutes = Math.floor(remaining / 60);
  const clock = `${minutes}:${String(remaining % 60).padStart(2, "0")}`;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md bg-surface-muted px-4 py-3 text-sm text-text-body">
      <Timer aria-hidden="true" className="size-4" />
      {remaining > 0 ? (
        <>Sisa jeda <span role="timer" className="font-mono font-semibold tabular-nums text-text">{clock}</span></>
      ) : "Jeda selesai. Mulai saat kamu siap."}
    </div>
  );
}
