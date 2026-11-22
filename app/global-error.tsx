"use client";

import { useEffect } from "react";
import "./globals.css";

// Replaces the root layout when it crashes, so it must render its own <html> and <body>
// and cannot rely on next/font or any provider from layout.tsx.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="antialiased bg-bg text-text-body">
        <main className="flex min-h-dvh flex-col items-start justify-center px-5 md:px-8 mx-auto max-w-[720px]">
          <p className="text-2xl font-extrabold tracking-tight text-primary">
            jitu<span className="text-yellow-400">.</span>
          </p>
          <h1 className="mt-8 text-balance text-3xl font-bold tracking-tight text-text">
            Terjadi kendala di sistem kami
          </h1>
          <p className="mt-3 max-w-[56ch] leading-relaxed text-text-muted">
            Aplikasi gagal dimuat. Coba muat ulang. Kalau masih sama, tunggu beberapa menit lalu coba lagi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center rounded-[10px] bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Coba lagi
            </button>
            {/* Plain anchor on purpose: a full page load resets the broken client tree. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex h-11 items-center rounded-[10px] border border-border bg-surface px-5 text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Kembali ke beranda
            </a>
          </div>
          {error.digest ? (
            <p className="mt-10 text-sm text-text-muted">
              Kode referensi: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
