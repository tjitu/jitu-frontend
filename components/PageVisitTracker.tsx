"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function getOrCreateVisitorId(): string {
  try {
    const key = "jitu_visitor_id";
    let id = window.localStorage.getItem(key);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export default function PageVisitTracker() {
  const pathname = usePathname();
  const visitRef = useRef<{ visitId: string; path: string; startedAt: number } | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const visitorId = getOrCreateVisitorId();
    const visitId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `pv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const startedAt = Date.now();
    visitRef.current = { visitId, path: pathname, startedAt };

    // Record initial page view
    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId, path: pathname, visitorId, durationSec: 0 }),
      keepalive: true,
    }).catch(() => {});

    const flushDuration = () => {
      const current = visitRef.current;
      if (!current || current.visitId !== visitId) return;
      const durationSec = Math.round((Date.now() - current.startedAt) / 1000);
      if (durationSec <= 0) return;
      const payload = JSON.stringify({
        visitId: current.visitId,
        path: current.path,
        visitorId,
        durationSec,
      });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/visit", blob);
      } else {
        fetch("/api/analytics/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener("pagehide", flushDuration);
    return () => {
      flushDuration();
      window.removeEventListener("pagehide", flushDuration);
    };
  }, [pathname]);

  return null;
}

