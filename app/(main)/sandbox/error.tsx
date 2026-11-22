"use client";

import { useEffect } from "react";

export default function SandboxError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sandbox render error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-20 text-center">
      <h2 className="text-lg font-bold text-text">Soal ini gagal ditampilkan</h2>
      <p className="text-sm text-text-muted">
        Data soal atau pembahasan kemungkinan tidak valid. Detail error ada di console browser.
      </p>
      <p className="font-mono text-xs text-text-muted break-all">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary cursor-pointer"
      >
        Coba lagi
      </button>
    </div>
  );
}
